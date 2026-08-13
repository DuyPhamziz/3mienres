// Tiện ích phân trang & tìm kiếm chung cho các danh sách.

// Đọc page/limit từ query params và trả về thông tin phân trang an toàn.
exports.getPagination = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  // Mặc định 100 để tương thích với các view hiện có chưa truyền limit (menu, sơ đồ bàn).
  // Các view quản trị muốn phân trang thật sẽ truyền limit nhỏ (ví dụ 10).
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 100));
  return { page, limit, skip: (page - 1) * limit };
};

// Đóng gói meta phân trang cho response.
exports.buildPaginationMeta = (total, page, limit) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit) || 0,
});

// Tạo điều kiện tìm kiếm không phân biệt hoa thường trên nhiều trường.
exports.buildSearchFilter = (search, fields) => {
  if (!search || !search.trim()) return null;
  const regex = { $regex: search.trim(), $options: "i" };
  return { $or: fields.map((f) => ({ [f]: regex })) };
};
