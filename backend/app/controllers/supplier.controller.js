const Supplier = require("../models/supplier.model");
const ImportReceipt = require("../models/import-receipt.model");
const AppError = require("../app-error");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");
const { escapeRegex } = require("../utils/escapeRegex");

// 1. Tạo nhà cung cấp mới (Chỉ Manager / Admin)
exports.createSupplier = async (req, res, next) => {
  try {
    const { supplierCode, name, contactPerson, phone, email, address, category, rating, bankName, bankAccountNumber, bankAccountName, status, note } = req.body;

    if (!name || !phone) {
      return next(new AppError("Vui lòng cung cấp Tên nhà cung cấp và Số điện thoại", 400));
    }

    const existing = await Supplier.findOne({ name: { $regex: new RegExp(`^${escapeRegex(name.trim())}$`, "i") } });
    if (existing) {
      return next(new AppError(`Nhà cung cấp '${name}' đã tồn tại trong hệ thống`, 409));
    }

    const count = await Supplier.countDocuments();
    const autoCode = supplierCode ? supplierCode.trim().toUpperCase() : `NCC-${String(count + 1).padStart(3, "0")}`;

    const newSupplier = await Supplier.create({
      supplierCode: autoCode,
      name: name.trim(),
      contactPerson: contactPerson ? contactPerson.trim() : "",
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : "",
      address: address ? address.trim() : "Chưa cập nhật",
      category: category || "SEAFOOD",
      rating: Number(rating) || 5,
      bankName: bankName ? bankName.trim() : "",
      bankAccountNumber: bankAccountNumber ? bankAccountNumber.trim() : "",
      bankAccountName: bankAccountName ? bankAccountName.trim() : "",
      status: status || "active",
      note: note ? note.trim() : "",
    });

    res.status(201).json({
      status: "success",
      message: "Tạo nhà cung cấp mới thành công",
      data: { supplier: newSupplier },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Lấy danh sách tất cả các nhà cung cấp
exports.getAllSuppliers = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { phone: { $regex: search.trim(), $options: "i" } },
        { supplierCode: { $regex: search.trim(), $options: "i" } },
        { contactPerson: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const { page, limit, skip } = getPagination(req.query);
    const total = await Supplier.countDocuments(filter);

    const suppliers = await Supplier.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: "success",
      results: suppliers.length,
      ...buildPaginationMeta(total, page, limit),
      data: { suppliers },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Cập nhật nhà cung cấp
exports.updateSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { supplierCode, name, contactPerson, phone, email, address, category, rating, bankName, bankAccountNumber, bankAccountName, status, note } = req.body;

    const supplier = await Supplier.findById(id);
    if (!supplier) return next(new AppError("Không tìm thấy nhà cung cấp", 404));

    if (name && name.trim().toLowerCase() !== supplier.name.toLowerCase()) {
      const duplicate = await Supplier.findOne({ name: { $regex: new RegExp(`^${escapeRegex(name.trim())}$`, "i") }, _id: { $ne: id } });
      if (duplicate) return next(new AppError(`Nhà cung cấp '${name}' đã tồn tại`, 409));
      supplier.name = name.trim();
    }

    if (supplierCode !== undefined) supplier.supplierCode = supplierCode.trim().toUpperCase();
    if (contactPerson !== undefined) supplier.contactPerson = contactPerson.trim();
    if (phone) supplier.phone = phone.trim();
    if (email !== undefined) supplier.email = email.trim().toLowerCase();
    if (address !== undefined) supplier.address = address.trim();
    if (category) supplier.category = category;
    if (rating !== undefined) supplier.rating = Number(rating) || 5;
    if (bankName !== undefined) supplier.bankName = bankName.trim();
    if (bankAccountNumber !== undefined) supplier.bankAccountNumber = bankAccountNumber.trim();
    if (bankAccountName !== undefined) supplier.bankAccountName = bankAccountName.trim();
    if (status) supplier.status = status;
    if (note !== undefined) supplier.note = note.trim();

    await supplier.save();

    res.status(200).json({
      status: "success",
      message: "Cập nhật nhà cung cấp thành công",
      data: { supplier },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Xóa nhà cung cấp
exports.deleteSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Supplier.findByIdAndDelete(id);
    if (!deleted) return next(new AppError("Không tìm thấy nhà cung cấp để xóa", 404));

    res.status(200).json({
      status: "success",
      message: "Xóa nhà cung cấp thành công",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// 5. Thống kê KPI Nhà cung cấp
exports.getSupplierStats = async (req, res, next) => {
  try {
    const totalSuppliers = await Supplier.countDocuments();
    const activeSuppliers = await Supplier.countDocuments({ status: "active" });
    const receipts = await ImportReceipt.find({}, "totalAmount");
    const totalImportValue = receipts.reduce((sum, r) => sum + (r.totalAmount || 0), 0);

    res.status(200).json({
      status: "success",
      data: {
        totalSuppliers,
        activeSuppliers,
        totalImportValue,
      },
    });
  } catch (error) {
    next(error);
  }
};
