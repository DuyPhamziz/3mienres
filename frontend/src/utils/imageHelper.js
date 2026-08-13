export function getImageUrl(path) {
  if (!path || path === "default-dish.jpg") {
    return "https://images.unsplash.com/photo-1559737605-3416694e7769?auto=format&fit=crop&w=600&q=80";
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (path.startsWith("/")) {
    return `http://localhost:3000${path}`;
  }
  return `http://localhost:3000/uploads/${path}`;
}
