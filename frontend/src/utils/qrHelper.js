import QRCode from "qrcode";
import jsQR from "jsqr";

/**
 * Tạo Data URL dạng base64 từ chuỗi văn bản (ví dụ mã đặt bàn)
 */
export async function generateQRCodeDataUrl(text, options = {}) {
  try {
    return await QRCode.toDataURL(text, {
      width: options.width || 300,
      margin: options.margin || 2,
      color: {
        dark: options.darkColor || "#1e293b",
        light: options.lightColor || "#ffffff",
      },
      errorCorrectionLevel: "H",
    });
  } catch (err) {
    console.error("Lỗi tạo mã QR DataURL:", err);
    return "";
  }
}

/**
 * Tải file ảnh mã QR đơn thuần
 */
export async function downloadSimpleQR(code, filename) {
  try {
    const dataUrl = await generateQRCodeDataUrl(code, { width: 400 });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename || `QR_CheckIn_${code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error("Lỗi tải mã QR:", err);
    return false;
  }
}

/**
 * Tạo và tải về Thẻ Check-in Đặt Bàn Đầy Đủ (Check-in Pass) dạng ảnh PNG chất lượng cao
 */
export async function downloadCheckInCard(reservation, filename) {
  try {
    const code = reservation.reservationCode || "RES-SAMPLE";
    const name = reservation.customerName || "Quý khách";
    const phone = reservation.customerPhone || "";
    const guests = reservation.guestsCount || 1;
    const time = reservation.startAt
      ? new Date(reservation.startAt).toLocaleString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "Tại quầy";
    const tables =
      reservation.tables && reservation.tables.length > 0
        ? reservation.tables.map((t) => `Bàn ${t.tableNumber || t}`).join(", ")
        : "Sắp xếp khi đến";

    // 1. Tạo ảnh QR Code base64
    const qrDataUrl = await generateQRCodeDataUrl(code, { width: 280, margin: 1 });
    const qrImg = new Image();
    await new Promise((resolve, reject) => {
      qrImg.onload = resolve;
      qrImg.onerror = reject;
      qrImg.src = qrDataUrl;
    });

    // 2. Vẽ Thẻ Check-in lên Canvas (kích thước 600 x 820)
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 820;
    const ctx = canvas.getContext("2d");

    // Nền trắng viền bo
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 600, 820);

    // Header đỏ thương hiệu
    const gradient = ctx.createLinearGradient(0, 0, 600, 0);
    gradient.addColorStop(0, "#b91c1c");
    gradient.addColorStop(1, "#dc2626");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 140);

    // Tiêu đề nhà hàng
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("NHÀ HÀNG 3 MIỀN CUA", 300, 55);

    ctx.font = "600 15px 'Segoe UI', Arial, sans-serif";
    ctx.fillStyle = "#fecaca";
    ctx.fillText("THẺ CHECK-IN XÁC NHẬN ĐẶT BÀN", 300, 88);

    ctx.font = "italic 13px 'Segoe UI', Arial, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Hotline: 1900 3388 • Ẩm Thực 3 Miền Đậm Vị", 300, 115);

    // Khung trắng chứa mã QR
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 6;
    ctx.fillRect(150, 160, 300, 300);
    ctx.shadowColor = "transparent";

    // Viền khung QR
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(150, 160, 300, 300);

    // Vẽ QR code vào giữa
    ctx.drawImage(qrImg, 160, 170, 280, 280);

    // Mã đặt bàn nổi bật bên dưới QR
    ctx.fillStyle = "#b91c1c";
    ctx.font = "bold 28px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(code, 300, 495);

    // Đường gạch ngang đứt đoạn phân cách
    ctx.beginPath();
    ctx.setLineDash([6, 6]);
    ctx.moveTo(40, 525);
    ctx.lineTo(560, 525);
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);

    // Thông tin đặt bàn chi tiết
    ctx.textAlign = "left";
    const drawInfoRow = (label, value, y) => {
      ctx.font = "600 15px 'Segoe UI', Arial, sans-serif";
      ctx.fillStyle = "#64748b";
      ctx.fillText(label, 60, y);

      ctx.font = "bold 16px 'Segoe UI', Arial, sans-serif";
      ctx.fillStyle = "#1e293b";
      ctx.fillText(value, 230, y);
    };

    drawInfoRow("Khách hàng:", name, 565);
    drawInfoRow("Số điện thoại:", phone || "—", 600);
    drawInfoRow("Thời gian hẹn:", time, 635);
    drawInfoRow("Số lượng khách:", `${guests} người`, 670);
    drawInfoRow("Bàn dự kiến:", tables, 705);

    // Footer hướng dẫn
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 745, 600, 75);

    ctx.fillStyle = "#64748b";
    ctx.font = "italic 13px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      "Quý khách vui lòng xuất trình thẻ này tại quầy để nhân viên check-in tức thì.",
      300,
      775
    );
    ctx.font = "12px 'Segoe UI', Arial, sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("Hệ Thống Quản Lý Nhà Hàng 3 Miền Cua", 300, 800);

    // 3. Tải xuống file ảnh
    const finalDataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = finalDataUrl;
    link.download = filename || `The_CheckIn_${code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error("Lỗi tạo thẻ Check-in card:", err);
    return false;
  }
}

/**
 * Đọc và giải mã mã QR từ file ảnh (File/Blob) hoặc Image element
 */
export async function decodeQRFromImageFile(imageFile) {
  return new Promise((resolve, reject) => {
    if (!imageFile) {
      return reject(new Error("Vui lòng chọn một file ảnh"));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code && code.data) {
            resolve({
              success: true,
              data: code.data.trim(),
              location: code.location,
              previewUrl: e.target.result,
            });
          } else {
            // Thử invert màu nếu ảnh chụp ngược sáng
            const codeInvert = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "onlyInvert",
            });
            if (codeInvert && codeInvert.data) {
              resolve({
                success: true,
                data: codeInvert.data.trim(),
                location: codeInvert.location,
                previewUrl: e.target.result,
              });
            } else {
              // Thử trích xuất mã RES-XXXXXX từ tên file nếu người dùng dùng ảnh mẫu
              const matchName = imageFile.name ? imageFile.name.match(/RES-[A-Za-z0-9]+/i) : null;
              if (matchName) {
                resolve({
                  success: true,
                  data: matchName[0].toUpperCase(),
                  previewUrl: e.target.result,
                  fallbackFromName: true,
                });
              } else {
                resolve({
                  success: false,
                  message: "Không tìm thấy hoặc không thể đọc được mã QR trong ảnh này.",
                  previewUrl: e.target.result,
                });
              }
            }
          }
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error("Không thể tải file ảnh"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Không thể đọc file"));
    reader.readAsDataURL(imageFile);
  });
}
