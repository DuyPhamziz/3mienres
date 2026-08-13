// Hàm chuyển đổi tiêu đề / tên món ăn tiếng Việt thành URL Slug chuẩn SEO
const slugify = (text) => {
  if (!text) return "";

  return text
    .toString()
    .toLowerCase()
    .normalize("NFD") // Tách dấu ra khỏi ký tự gốc
    .replace(/[\u0300-\u036f]/g, "") // Xóa bỏ các dấu thanh tiếng Việt
    .replace(/[đĐ]/g, "d") // Chuyển đ -> d
    .replace(/([^0-9a-z-\s])/g, "") // Xóa ký tự đặc biệt
    .replace(/(\s+)/g, "-") // Chuyển khoảng trắng thành dấu gạch ngang
    .replace(/-+/g, "-") // Xóa nhiều dấu gạch ngang liên tiếp
    .replace(/^-+|-+$/g, ""); // Xóa gạch ngang ở đầu và cuối chuỗi
};

module.exports = slugify;