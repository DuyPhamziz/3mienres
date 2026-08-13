import { reactive } from "vue";

// Hệ thống toast toàn cục (dùng chung cho mọi view, không cần Pinia).
export const toastState = reactive({ list: [] });

let id = 0;

function push(type, message, title) {
  const toastItem = { id: ++id, type, message, title };
  toastState.list.push(toastItem);
  setTimeout(() => remove(toastItem.id), 4500);
  return toastItem.id;
}

export function remove(id) {
  const idx = toastState.list.findIndex((t) => t.id === id);
  if (idx !== -1) toastState.list.splice(idx, 1);
}

export const toast = {
  success: (message, title = "Thành công") => push("success", message, title),
  error: (message, title = "Lỗi") => push("error", message, title),
  info: (message, title = "Thông tin") => push("info", message, title),
  warning: (message, title = "Cảnh báo") => push("warning", message, title),
};
