/**
 * Tiện ích xuất dữ liệu ra file Excel / CSV hỗ trợ đầy đủ tiếng Việt có dấu (UTF-8 BOM)
 */

export function exportToCSV(columns, data, filename = "Bao-Cao.csv") {
  if (!data || data.length === 0) {
    alert("Không có dữ liệu để xuất file!");
    return;
  }

  // Tiêu đề cột
  const headers = columns.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(",");

  // Các dòng dữ liệu
  const rows = data.map((item) => {
    return columns
      .map((col) => {
        let val = "";
        if (typeof col.key === "function") {
          val = col.key(item);
        } else {
          val = item[col.key] !== undefined && item[col.key] !== null ? item[col.key] : "";
        }
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(",");
  });

  // Nối nội dung kèm UTF-8 BOM (\uFEFF) để Excel tự nhận diện font tiếng Việt
  const csvContent = "\uFEFF" + [headers, ...rows].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
