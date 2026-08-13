// Tiện ích sinh mã code ngẫu nhiên, đảm bảo DUY NHẤT trong collection tương ứng.
// Dùng chung cho Reservation (RES-), Order (ORD-), DiningSession (SES-) và Invoice (INV-).

// Sinh mã dạng `<prefix>-<random>` và kiểm tra trùng lặp tới khi duy nhất.
exports.generateUniqueCode = async (
  Model,
  prefix,
  field = "code",
  { min = 100000, max = 999999 } = {},
) => {
  let code;
  let isUnique = false;
  while (!isUnique) {
    code = `${prefix}-${Math.floor(min + Math.random() * (max - min + 1))}`;
    const existing = await Model.findOne({ [field]: code });
    if (!existing) isUnique = true;
  }
  return code;
};

// Sinh mã hóa đơn có chứa ngày tháng: INV-YYYYMMDD-XXXX
exports.generateInvoiceCode = async (Invoice, date = new Date()) => {
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  return exports.generateUniqueCode(Invoice, `INV-${dateStr}`, "invoiceCode", {
    min: 1000,
    max: 9999,
  });
};
