// Đường dẫn gốc định nghĩa cố định cho ảnh món ăn
const BASE_UPLOADS_URL = "/uploads/dishes/";

export function getImageUrl(imageNameOrPath) {
  if (!imageNameOrPath || imageNameOrPath === "default-dish.jpg") {
    return `${BASE_UPLOADS_URL}cua-rang-me-ca-mau.jpg`;
  }

  // Nếu là URL tuyệt đối đầy đủ (http/https)
  if (imageNameOrPath.startsWith("http://") || imageNameOrPath.startsWith("https://")) {
    return imageNameOrPath;
  }

  // Trích xuất tên file thuần túy (filename)
  const fileName = imageNameOrPath.split("/").pop();

  // Ghép: Đường dẫn gốc + Tên hình
  return `${BASE_UPLOADS_URL}${fileName}`;
}
