const path = require("path");
const fs = require("fs");
const multer = require("multer");
const AppError = require("../app-error");
const config = require("../config");

// Cấu hình lưu trữ file bằng Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "img-" + uniqueSuffix + ext);
  },
});

// Lọc định dạng file ảnh (kiểm tra cả MIME lẫn phần mở rộng)
const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (file.mimetype.startsWith("image/") && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError("Chỉ chấp nhận file hình ảnh (jpg, jpeg, png, webp, gif)!", 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Tối đa 5MB
});

exports.uploadSingle = upload.single("image");

exports.uploadResponse = (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Vui lòng chọn 1 file hình ảnh để tải lên", 400));
  }

  // Dùng backendUrl cố định thay vì req.get("host") để tránh Host header injection
  const fileUrl = `${config.backendUrl}/uploads/${req.file.filename}`;

  res.status(200).json({
    status: "success",
    message: "Tải ảnh lên thành công!",
    url: fileUrl,
    filename: req.file.filename,
  });
};
