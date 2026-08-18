const DiningSession = require("../models/dining-session.model");
const Reservation = require("../models/reservation.model");
const Table = require("../models/table.model");
const Order = require("../models/order.model");
const User = require("../models/user.model");
const RestaurantSetting = require("../models/setting.model");
const AppError = require("../app-error");
const { generateUniqueCode } = require("../utils/code-generator");
const { emitEvent } = require("../socket");
const { logAction } = require("../utils/audit");
const tableEngine = require("../utils/table-engine");

// 1. Check-in cho khách đã đặt bàn trước (Reservation -> DiningSession)
exports.checkInReservation = async (req, res, next) => {
  try {
    const { reservationId, actualGuestsCount, tableIds } = req.body;

    // Lớp 1: Kiểm tra thiếu dữ liệu (400 Bad Request)
    if (!reservationId) {
      return next(new AppError("Vui lòng cung cấp ID của đơn đặt bàn (reservationId)", 400));
    }

    // Lớp 2: Kiểm tra đơn đặt bàn có tồn tại hay không (404 Not Found)
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return next(new AppError("Không tìm thấy đơn đặt bàn này trên hệ thống", 404));
    }

    // Xung đột nghiệp vụ: Đơn đã bị hủy hoặc đã hoàn thành thì không được Check-in
    if (reservation.status === "CANCELLED" || reservation.status === "COMPLETED" || reservation.status === "ARRIVED") {
      return next(new AppError(`Đơn đặt bàn đang ở trạng thái '${reservation.status}', không thể Check-in!`, 409));
    }

    // Xác định số khách và danh sách bàn thực tế sử dụng
    const finalGuests = actualGuestsCount ? parseInt(actualGuestsCount, 10) : reservation.guestsCount;
    const finalTableIds = (tableIds && Array.isArray(tableIds) && tableIds.length > 0) 
      ? tableIds 
      : reservation.tables;

    if (!finalTableIds || finalTableIds.length === 0) {
      return next(new AppError("Vui lòng gán ít nhất 1 bàn cho lượt dùng bữa này", 400));
    }

    // Kiểm tra tính tồn tại và trạng thái của các bàn thực tế
    for (let tId of finalTableIds) {
      const table = await Table.findById(tId);
      if (!table) {
        return next(new AppError(`Bàn với ID '${tId}' không tồn tại`, 404));
      }
      if (table.status === "OCCUPIED") {
        return next(new AppError(`Bàn '${table.tableNumber}' hiện đang có khách khác ngồi ăn!`, 409));
      }
    }

    // Kiểm tra các bàn thực tế có nằm cạnh nhau để ghép được hay không
    if (finalTableIds.length > 1) {
      const mergeCheck = await tableEngine.validateMergeableTables(finalTableIds);
      if (!mergeCheck.isValid) {
        return next(new AppError("Các bàn check-in không nằm cạnh nhau nên không thể ghép. Vui lòng chọn bàn kề nhau.", 400));
      }
    }

    // Sinh mã lượt dùng bữa duy nhất (Ví dụ: SES-839201)
    const sessionCode = await generateUniqueCode(DiningSession, "SES", "sessionCode");

    // Atomic Claim: Chuyển các bàn từ AVAILABLE/RESERVED sang OCCUPIED
    const claimResult = await Table.updateMany(
      { _id: { $in: finalTableIds }, status: { $in: ["AVAILABLE", "RESERVED"] } },
      { status: "OCCUPIED" }
    );

    if (claimResult.modifiedCount !== finalTableIds.length) {
      // Hoàn nguyên nếu chỉ chiếm được một phần (xung đột đồng thời)
      await Table.updateMany(
        { _id: { $in: finalTableIds }, status: "OCCUPIED" },
        { status: "AVAILABLE" }
      );
      return next(new AppError("Một số bàn vừa bị chiếm hoặc đang phục vụ khách khác. Vui lòng thử lại!", 409));
    }

    // Lớp 3: Tạo DiningSession thực tế
    const newSession = await DiningSession.create({
      sessionCode,
      type: "RESERVATION",
      reservation: reservation._id,
      customer: reservation.user || null,
      customerName: reservation.customerName,
      customerPhone: reservation.customerPhone,
      actualGuestsCount: finalGuests,
      tables: finalTableIds,
      checkInTime: new Date(),
      expectedEndTime: reservation.endAt,
      status: "ACTIVE",
      servedBy: req.user ? req.user._id : null,
    });

    // Cập nhật trạng thái đơn đặt bàn sang ARRIVED
    reservation.status = "ARRIVED";
    await reservation.save();

    // Tự động tạo đợt gọi món đầu tiên từ các món Pre-order (nếu có)
    if (reservation.preOrderDishes && reservation.preOrderDishes.length > 0) {
      let preOrderSubtotal = 0;
      const items = reservation.preOrderDishes.map((item) => {
        preOrderSubtotal += item.priceAtBooking * item.quantity;
        return {
          dish: item.dish,
          quantity: item.quantity,
          price: item.priceAtBooking,
          notes: "Món đặt trước (Pre-order)",
        };
      });

      const preOrderCode = await generateUniqueCode(Order, "ORD", "orderCode");
      await Order.create({
        orderCode: preOrderCode,
        diningSession: newSession._id,
        items,
        subtotal: preOrderSubtotal,
        status: "PENDING",
        orderedBy: req.user ? req.user._id : null,
        notes: "Tự động tạo từ món Pre-order của đơn đặt bàn",
      });
    }

    const populatedSession = await DiningSession.findById(newSession._id)
      .populate("tables", "tableNumber capacity area")
      .populate("reservation", "reservationCode startAt endAt");

    emitEvent("sessions:changed");
    emitEvent("tables:changed");
    emitEvent("reservations:changed");
    emitEvent("orders:changed");
    logAction(req, "CHECK_IN", "DiningSession", newSession._id, {
      sessionCode: newSession.sessionCode,
      reservationCode: reservation.reservationCode,
    });

    res.status(201).json({
      status: "success",
      message: "Check-in thành công! Bàn ăn đã sẵn sàng đón khách.",
      data: { diningSession: populatedSession },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Tiếp nhận khách Walk-in (Đi ngang vào trực tiếp không đặt trước)
exports.createWalkInSession = async (req, res, next) => {
  try {
    const { customerName, customerPhone, guestsCount, tableIds, notes, customerId } = req.body;

    // Lớp 1: Kiểm tra thiếu dữ liệu (400 Bad Request)
    if (!customerName || !guestsCount || !tableIds || !Array.isArray(tableIds) || tableIds.length === 0) {
      return next(new AppError("Vui lòng cung cấp đầy đủ: Tên khách, Số lượng khách và Chọn ít nhất 1 bàn ăn", 400));
    }

    const guests = parseInt(guestsCount, 10);
    if (isNaN(guests) || guests <= 0) {
      return next(new AppError("Số lượng khách phải là số dương hợp lệ", 400));
    }

    // Lớp 2: Kiểm tra các bàn chọn có hợp lệ & còn trống hay không
    let totalCapacity = 0;
    for (let tId of tableIds) {
      const table = await Table.findById(tId);
      if (!table) {
        return next(new AppError(`Bàn với ID '${tId}' không tồn tại`, 404));
      }
      if (table.status === "OCCUPIED") {
        return next(new AppError(`Bàn '${table.tableNumber}' hiện đang có khách ngồi ăn!`, 409));
      }
      if (table.status === "MAINTENANCE") {
        return next(new AppError(`Bàn '${table.tableNumber}' đang trong quá trình bảo trì!`, 409));
      }
      totalCapacity += table.capacity || 0;
    }

    // Kiểm tra ghép bàn nếu chọn nhiều hơn 1 bàn
    if (tableIds.length > 1) {
      const mergeCheck = await tableEngine.validateMergeableTables(tableIds);
      if (!mergeCheck.isValid) {
        return next(new AppError("Các bàn được chọn không nằm kề nhau trong sơ đồ. Vui lòng chọn các bàn liền kề để ghép.", 400));
      }
    }

    // Đọc thời lượng mặc định của nhà hàng (VD: 120 phút)
    let durationMinutes = 120;
    const settings = await RestaurantSetting.findOne();
    if (settings && settings.reservation && settings.reservation.defaultDurationMinutes) {
      durationMinutes = settings.reservation.defaultDurationMinutes;
    }

    const now = new Date();
    const expectedEndTime = new Date(now.getTime() + durationMinutes * 60000);

    // Tự động tìm & gắn tài khoản thành viên qua SĐT (nếu có) để tích lũy chi tiêu
    let customer = null;
    if (customerId) {
      const customerUser = await User.findById(customerId);
      if (customerUser && customerUser.role === "customer") {
        customer = customerUser._id;
      }
    } else if (customerPhone && customerPhone.trim()) {
      const matchedUser = await User.findOne({ phone: customerPhone.trim(), role: "customer" });
      if (matchedUser) {
        customer = matchedUser._id;
      }
    }

    // Sinh mã session duy nhất
    const sessionCode = await generateUniqueCode(DiningSession, "SES", "sessionCode");

    // Atomic Claim: Chuyển các bàn từ AVAILABLE sang OCCUPIED
    const claimResult = await Table.updateMany(
      { _id: { $in: tableIds }, status: "AVAILABLE" },
      { status: "OCCUPIED" }
    );

    if (claimResult.modifiedCount !== tableIds.length) {
      await Table.updateMany(
        { _id: { $in: tableIds }, status: "OCCUPIED" },
        { status: "AVAILABLE" }
      );
      return next(new AppError("Một số bàn vừa bị chiếm bởi lượt khách khác. Vui lòng chọn lại bàn!", 409));
    }

    // Lớp 3: Tạo lượt dùng bữa Walk-in
    const newSession = await DiningSession.create({
      sessionCode,
      type: "WALK_IN",
      reservation: null, // Khách Walk-in không có đơn đặt trước
      customer,
      customerName: customerName.trim(),
      customerPhone: customerPhone ? customerPhone.trim() : "",
      actualGuestsCount: guests,
      tables: tableIds,
      checkInTime: now,
      expectedEndTime,
      status: "ACTIVE",
      servedBy: req.user ? req.user._id : null,
      notes: notes ? notes.trim() : "",
    });

    const populatedSession = await DiningSession.findById(newSession._id).populate("tables", "tableNumber capacity area");

    emitEvent("sessions:changed");
    emitEvent("tables:changed");
    logAction(req, "WALK_IN", "DiningSession", newSession._id, {
      sessionCode: newSession.sessionCode,
      customerName: newSession.customerName,
      guests: guests,
      tablesCount: tableIds.length,
    });

    res.status(201).json({
      status: "success",
      message: `Đã tiếp nhận khách Walk-in thành công và mở bàn (${totalCapacity} chỗ)!`,
      data: { diningSession: populatedSession },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Xem danh sách tất cả các bàn đang có khách ăn (Active Sessions)
exports.getActiveSessions = async (req, res, next) => {
  try {
    const sessions = await DiningSession.find({ status: "ACTIVE" })
      .populate("tables", "tableNumber capacity area")
      .populate("reservation", "reservationCode startAt endAt")
      .sort({ checkInTime: -1 });

    const now = new Date();
    // Bổ sung cờ cảnh báo xem bàn nào đang bị ngồi quá giờ (OVER_TIME)
    const formattedSessions = sessions.map((s) => {
      const doc = s.toObject();
      doc.isOverTime = now > new Date(s.expectedEndTime);
      doc.elapsedMinutes = Math.floor((now - new Date(s.checkInTime)) / 60000);
      return doc;
    });

    res.status(200).json({
      status: "success",
      results: formattedSessions.length,
      data: { activeSessions: formattedSessions },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Đổi bàn hoặc ghép thêm bàn cho khách đang ngồi ăn
exports.changeTables = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newTableIds, reason } = req.body;

    const session = await DiningSession.findById(id);
    if (!session) {
      return next(new AppError("Không tìm thấy lượt dùng bữa này", 404));
    }

    if (session.status !== "ACTIVE") {
      return next(new AppError("Lượt dùng bữa này đã kết thúc, không thể đổi bàn", 409));
    }

    if (!newTableIds || !Array.isArray(newTableIds) || newTableIds.length === 0) {
      return next(new AppError("Vui lòng cung cấp danh sách bàn mới (newTableIds)", 400));
    }

    const oldTableIds = session.tables.map((t) => t.toString());
    const newTableIdSet = new Set(newTableIds.map((t) => t.toString()));

    // Kiểm tra các bàn mới
    for (let tId of newTableIds) {
      // Nếu bàn mới trùng với bàn cũ khách đang ngồi thì bỏ qua
      if (oldTableIds.includes(tId.toString())) continue;

      const table = await Table.findById(tId);
      if (!table) return next(new AppError(`Bàn với ID '${tId}' không tồn tại`, 404));
      if (table.status === "OCCUPIED") {
        return next(new AppError(`Bàn '${table.tableNumber}' đang có khách khác ngồi, không thể chuyển sang!`, 409));
      }
    }

    // Quy tắc kề nhau: phân biệt "ghép thêm bàn" và "đổi hẳn bàn"
    const keptOldIds = oldTableIds.filter((id) => newTableIdSet.has(id));
    const addedNewIds = newTableIds.map((t) => t.toString()).filter((id) => !oldTableIds.includes(id));

    if (keptOldIds.length > 0 && addedNewIds.length > 0) {
      // Ghép thêm bàn: bàn thêm phải kề với bàn đang giữ (cả cụm phải liên thông)
      const mergeCheck = await tableEngine.validateMergeableTables([...keptOldIds, ...addedNewIds]);
      if (!mergeCheck.isValid) {
        return next(new AppError("Bàn thêm vào phải nằm cạnh bàn khách đang ngồi để ghép được.", 400));
      }
    } else if (keptOldIds.length === 0 && addedNewIds.length > 1) {
      // Đổi hẳn sang nhiều bàn mới: các bàn mới phải kề nhau
      const mergeCheck = await tableEngine.validateMergeableTables(addedNewIds);
      if (!mergeCheck.isValid) {
        return next(new AppError("Các bàn mới không nằm cạnh nhau nên không thể ghép.", 400));
      }
    }

    // 1. Atomic Claim các bàn mới thêm vào (chưa thuộc session cũ)
    if (addedNewIds.length > 0) {
      const claimResult = await Table.updateMany(
        { _id: { $in: addedNewIds }, status: "AVAILABLE" },
        { status: "OCCUPIED" }
      );
      if (claimResult.modifiedCount !== addedNewIds.length) {
        await Table.updateMany({ _id: { $in: addedNewIds } }, { status: "AVAILABLE" });
        return next(new AppError("Một số bàn mới vừa bị chiếm bởi lượt khách khác. Vui lòng chọn lại!", 409));
      }
    }

    // 2. Giải phóng các bàn cũ không còn ngồi về AVAILABLE
    const tablesToRelease = oldTableIds.filter((id) => !newTableIds.includes(id));
    if (tablesToRelease.length > 0) {
      await Table.updateMany({ _id: { $in: tablesToRelease } }, { status: "AVAILABLE" });
    }

    // 3. Cập nhật mảng tables trong session
    session.tables = newTableIds;
    if (reason) session.notes = (session.notes ? session.notes + " | " : "") + `Đổi bàn: ${reason}`;
    await session.save();

    const updatedSession = await DiningSession.findById(session._id).populate("tables", "tableNumber capacity area");

    emitEvent("sessions:changed");
    emitEvent("tables:changed");

    res.status(200).json({
      status: "success",
      message: "Chuyển bàn / Ghép bàn thành công!",
      data: { diningSession: updatedSession },
    });
  } catch (error) {
    next(error);
  }
};

// 5. Gộp 2 bàn / 2 lượt dùng bữa thành 1 hóa đơn duy nhất (Merge Sessions)
exports.mergeSessions = async (req, res, next) => {
  try {
    const { id } = req.params; // Target Session ID (Bàn giữ lại làm bàn chính)
    const { sourceSessionId } = req.body; // Source Session ID (Bàn phụ gộp vào)

    if (!sourceSessionId) {
      return next(new AppError("Vui lòng cung cấp mã bàn muốn gộp (sourceSessionId)", 400));
    }

    if (id.toString() === sourceSessionId.toString()) {
      return next(new AppError("Không thể tự gộp bàn vào chính nó!", 400));
    }

    const targetSession = await DiningSession.findById(id);
    const sourceSession = await DiningSession.findById(sourceSessionId);

    if (!targetSession || !sourceSession) {
      return next(new AppError("Không tìm thấy một trong hai lượt dùng bữa cần gộp", 404));
    }

    if (targetSession.status !== "ACTIVE" || sourceSession.status !== "ACTIVE") {
      return next(new AppError("Cả 2 bàn phải đang ở trạng thái hoạt động (ACTIVE) mới có thể gộp bàn!", 409));
    }

    // 1. Chuyển tất cả đơn gọi món từ Bàn nguồn sang Bàn đích
    const movedOrders = await Order.updateMany(
      { diningSession: sourceSession._id },
      { diningSession: targetSession._id }
    );

    // 2. Gộp bàn & số khách
    const combinedTables = Array.from(
      new Set([...targetSession.tables.map((t) => t.toString()), ...sourceSession.tables.map((t) => t.toString())])
    );
    targetSession.tables = combinedTables;
    targetSession.actualGuestsCount = (targetSession.actualGuestsCount || 1) + (sourceSession.actualGuestsCount || 1);
    targetSession.notes = (targetSession.notes ? targetSession.notes + " | " : "") + `Đã gộp từ bàn ${sourceSession.sessionCode}`;
    await targetSession.save();

    // 3. Đóng phiên Bàn nguồn
    sourceSession.status = "COMPLETED";
    sourceSession.notes = (sourceSession.notes ? sourceSession.notes + " | " : "") + `Đã gộp vào bàn ${targetSession.sessionCode}`;
    await sourceSession.save();

    logAction(req, "MERGE_SESSION", "DiningSession", targetSession._id, {
      targetCode: targetSession.sessionCode,
      sourceCode: sourceSession.sessionCode,
      movedOrdersCount: movedOrders.modifiedCount,
    });

    emitEvent("sessions:changed");
    emitEvent("tables:changed");
    emitEvent("orders:changed");

    const populatedTarget = await DiningSession.findById(targetSession._id).populate("tables", "tableNumber capacity area");

    res.status(200).json({
      status: "success",
      message: `Đã gộp thành công bàn ${sourceSession.sessionCode} vào bàn ${targetSession.sessionCode}!`,
      data: { diningSession: populatedTarget },
    });
  } catch (error) {
    next(error);
  }
};