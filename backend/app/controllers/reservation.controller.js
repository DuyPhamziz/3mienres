const Reservation = require("../models/reservation.model");
const Dish = require("../models/dish.model");
const Table = require("../models/table.model");
const AppError = require("../app-error");
const Recipe = require("../models/recipe.model");
const Ingredient = require("../models/ingredient.model");
// Hàm Helper: Tự động trừ kho dựa trên công thức món ăn
const deductInventory = async (reservation) => {
  const warnings = [];
  // Lặp qua từng món ăn có trong đơn đặt bàn
  for (let item of reservation.dishes) {
    // Tìm công thức định lượng của món ăn đó
    const recipe = await Recipe.findOne({ dish: item.dish });
    if (!recipe) continue; // Nếu món ăn chưa được cấu hình công thức thì bỏ qua
    // Lặp qua từng nguyên liệu có trong công thức
    for (let ing of recipe.ingredients) {
      const ingredient = await Ingredient.findById(ing.ingredient);
      if (!ingredient) continue;
      // Tính tổng khối lượng nguyên liệu cần dùng = Định lượng * Số lượng món ăn khách đặt
      const totalRequired = ing.quantityRequired * item.quantity;
      // Kiểm tra xem số lượng tồn kho hiện tại có đủ dùng không
      if (ingredient.stockQuantity < totalRequired) {
        throw new Error(
          `Không đủ nguyên liệu '${ingredient.name}' trong kho để thực hiện món ăn. (Yêu cầu: ${totalRequired}${ingredient.unit}, Hiện có: ${ingredient.stockQuantity}${ingredient.unit})`,
        );
      }
      // Trừ kho nguyên liệu
      ingredient.stockQuantity -= totalRequired;
      await ingredient.save();
      // Kiểm tra nếu lượng tồn kho rơi xuống dưới mức tối thiểu thì cảnh báo
      if (ingredient.stockQuantity <= ingredient.minStockLevel) {
        warnings.push(
          `Cảnh báo tồn kho: Nguyên liệu '${ingredient.name}' sắp hết! (Còn lại: ${ingredient.stockQuantity}${ingredient.unit})`,
        );
      }
    }
  }
  return warnings;
};
// 1. Tạo đơn đặt bàn & đặt món trước (Chỉ dành cho tài khoản đã đăng nhập)
exports.createReservation = async (req, res, next) => {
  try {
    const {
      guestsCount,
      reservationTime,
      dishes, // [{ dish: "id", quantity: 2 }]
      notes,
      paymentType, // "deposit" hoặc "full"
    } = req.body;

    // Lấy thông tin trực tiếp từ tài khoản đăng nhập (Chắc chắn tồn tại do đi qua middleware protect)
    const userId = req.user._id;
    const finalName = req.user.name;
    const finalPhone = req.user.phone;
    const finalEmail = req.user.email;

    // Tính tổng tiền các món ăn đặt trước
    let totalAmount = 0;
    let formattedDishes = [];

    if (dishes && dishes.length > 0) {
      for (let item of dishes) {
        const dishInfo = await Dish.findById(item.dish);
        if (!dishInfo) {
          return next(
            new AppError(`Không tìm thấy món ăn với ID: ${item.dish}`, 404),
          );
        }
        if (!dishInfo.availability) {
          return next(
            new AppError(`Món ăn '${dishInfo.name}' hiện tại đã hết!`, 400),
          );
        }

        const priceAtBooking = dishInfo.price;
        totalAmount += priceAtBooking * item.quantity;

        formattedDishes.push({
          dish: item.dish,
          quantity: item.quantity,
          priceAtBooking: priceAtBooking,
        });
      }
    }

    // Tính số tiền cọc (deposit)
    let depositAmount = 0;
    const finalPaymentType = paymentType || "deposit";

    if (finalPaymentType === "full") {
      depositAmount = totalAmount;
    } else {
      depositAmount = Math.round(totalAmount * 0.2); // Cọc trước 20%
    }

    // Tạo đơn đặt bàn
    const newReservation = await Reservation.create({
      user: userId,
      customerName: finalName,
      customerPhone: finalPhone,
      customerEmail: finalEmail,
      guestsCount,
      reservationTime,
      dishes: formattedDishes,
      totalAmount,
      depositAmount,
      paymentType: finalPaymentType,
      notes,
    });

    res.status(201).json({
      status: "success",
      data: {
        reservation: newReservation,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Lấy danh sách lịch sử đặt bàn của Khách đang đăng nhập
exports.getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate("dishes.dish", "name price image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: reservations.length,
      data: { reservations },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Xem chi tiết đơn đặt bàn
exports.getReservationDetails = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("table", "name capacity")
      .populate("dishes.dish", "name price image");

    if (!reservation) {
      return next(new AppError("Không tìm thấy đơn đặt bàn này", 404));
    }

    // Bảo vệ: Khách hàng thường chỉ được xem đơn đặt của chính mình
    if (
      req.user.role === "customer" &&
      String(reservation.user) !== String(req.user._id)
    ) {
      return next(
        new AppError("Bạn không có quyền xem thông tin đơn đặt này!", 403),
      );
    }

    res.status(200).json({
      status: "success",
      data: { reservation },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Quản lý lấy danh sách toàn bộ đặt bàn (Chỉ Manager/Admin)
exports.getAllReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find()
      .populate("user", "name email phone")
      .populate("table", "name capacity")
      .populate("dishes.dish", "name price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: reservations.length,
      data: { reservations },
    });
  } catch (error) {
    next(error);
  }
};

// 5. Cập nhật trạng thái đơn hàng (Chỉ Manager/Admin)
// 5. Cập nhật trạng thái đơn hàng (Chỉ Manager/Admin)
exports.updateReservationStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return next(new AppError("Không tìm thấy đơn đặt bàn này", 404));
    }

    // CHỈNH SỬA: Nếu đơn chuyển từ trạng thái khác sang 'confirmed' (Duyệt đơn)
    let warnings = [];
    if (status === "confirmed" && reservation.status !== "confirmed") {
      // Gọi hàm trừ kho, nếu thiếu nguyên liệu sẽ tự quăng lỗi và dừng lại ở đây
      warnings = await deductInventory(reservation);
    }

    if (status) reservation.status = status;
    if (paymentStatus) reservation.paymentStatus = paymentStatus;

    await reservation.save();

    res.status(200).json({
      status: "success",
      message: "Cập nhật trạng thái đơn đặt bàn thành công",
      warnings: warnings.length > 0 ? warnings : undefined, // Trả cảnh báo tồn kho nếu có
      data: { reservation },
    });
  } catch (error) {
    // Bắt lỗi không đủ nguyên liệu được quăng ra từ hàm deductInventory
    return next(new AppError(error.message, 400));
  }
};

// 6. Xếp bàn ăn cho khách (Chỉ Manager/Admin)
exports.assignTable = async (req, res, next) => {
  try {
    const { tableId } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return next(new AppError("Không tìm thấy đơn đặt bàn này", 404));
    }

    const table = await Table.findById(tableId);
    if (!table) {
      return next(new AppError("Bàn ăn này không tồn tại", 404));
    }

    if (table.status !== "available") {
      return next(new AppError("Bàn ăn này đã được sử dụng hoặc giữ chỗ", 400));
    }

    // CHỈNH SỬA: Trước khi duyệt đơn sang 'confirmed', hãy trừ kho nguyên liệu
    let warnings = [];
    if (reservation.status !== "confirmed") {
      warnings = await deductInventory(reservation);
    }

    // Đánh dấu bàn đã được giữ chỗ
    table.status = "reserved";
    await table.save();

    reservation.table = tableId;
    reservation.status = "confirmed";
    await reservation.save();

    res.status(200).json({
      status: "success",
      message: "Đã xếp bàn thành công và xác nhận đơn đặt",
      warnings: warnings.length > 0 ? warnings : undefined,
      data: { reservation },
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

// 7. Thanh toán giả lập (Mock Payment) dành cho khách hàng
exports.mockPayment = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return next(new AppError("Không tìm thấy đơn đặt bàn này", 404));
    }

    // Bảo vệ: Chỉ người đặt đơn hoặc Admin/Manager mới được thanh toán
    if (
      req.user.role === "customer" &&
      String(reservation.user) !== String(req.user._id)
    ) {
      return next(
        new AppError("Bạn không có quyền thực hiện giao dịch này!", 403),
      );
    }

    if (
      reservation.paymentStatus === "fully_paid" ||
      reservation.paymentStatus === "deposited"
    ) {
      return next(
        new AppError("Đơn hàng này đã được thanh toán trước đó rồi", 400),
      );
    }

    // Giả lập giao dịch thành công:
    // Cập nhật trạng thái thanh toán tùy theo loại thanh toán ban đầu (cọc hay trọn gói)
    if (reservation.paymentType === "full") {
      reservation.paymentStatus = "fully_paid";
    } else {
      reservation.paymentStatus = "deposited";
    }

    await reservation.save();

    res.status(200).json({
      status: "success",
      message: "Thanh toán giả lập thành công!",
      data: { reservation },
    });
  } catch (error) {
    next(error);
  }
};
