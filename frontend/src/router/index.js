import { createRouter, createWebHistory } from "vue-router";
import { toast } from "../composables/useToast";

// Layouts
import CustomerLayout from "../layouts/CustomerLayout.vue";
import AdminLayout from "../layouts/AdminLayout.vue";

// Customer Views
import HomeView from "../views/customer/HomeView.vue";
import MenuView from "../views/customer/MenuView.vue";
import DishDetailView from "../views/customer/DishDetailView.vue";
import ReservationView from "../views/customer/ReservationView.vue";
import TrackReservationView from "../views/customer/TrackReservationView.vue";
import RankLoyaltyView from "../views/customer/RankLoyaltyView.vue";
import LoginView from "../views/customer/LoginView.vue";
import RegisterView from "../views/customer/RegisterView.vue";
import GuestOrderView from "../views/customer/GuestOrderView.vue";
import ProfileView from "../views/customer/ProfileView.vue";

// Admin / POS Views
import DashboardView from "../views/admin/DashboardView.vue";
import TableGridManagerView from "../views/admin/TableGridManagerView.vue";
import ReservationManagerView from "../views/admin/ReservationManagerView.vue";
import ReservationCalendarView from "../views/admin/ReservationCalendarView.vue";
import POSDiningSessionView from "../views/admin/POSDiningSessionView.vue";
import MenuManagerView from "../views/admin/MenuManagerView.vue";
import InventoryManagerView from "../views/admin/InventoryManagerView.vue";
import SupplierManagerView from "../views/admin/SupplierManagerView.vue";
import KitchenView from "../views/admin/KitchenView.vue";
import PrintInvoiceView from "../views/admin/PrintInvoiceView.vue";
import VoucherManagerView from "../views/admin/VoucherManagerView.vue";
import StaffManagerView from "../views/admin/StaffManagerView.vue";
import AuditLogView from "../views/admin/AuditLogView.vue";
import SettingsView from "../views/admin/SettingsView.vue";
import ReviewManagerView from "../views/admin/ReviewManagerView.vue";
import UserManagerView from "../views/admin/UserManagerView.vue";

const routes = [
  {
    path: "/",
    component: CustomerLayout,
    children: [
      { path: "", name: "home", component: HomeView },
      { path: "thuc-don", name: "menu", component: MenuView },
      { path: "mon-an/:slug", name: "dish-detail", component: DishDetailView },
      { path: "dat-ban", name: "reservation", component: ReservationView },
      { path: "tra-cuu", name: "track-order", component: TrackReservationView },
      { path: "hang-thanh-vien", name: "loyalty", component: RankLoyaltyView },
      { path: "thuc-don-tai-ban", name: "guest-order", component: GuestOrderView },
      { path: "tai-khoan", name: "profile", component: ProfileView, meta: { requiresAuth: true } },
      { path: "login", name: "login", component: LoginView },
      { path: "register", name: "register", component: RegisterView },
    ],
  },
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true, roles: ["staff", "manager", "admin"] },
    children: [
      { path: "", name: "admin-dashboard", component: DashboardView },
      { path: "tables", name: "admin-tables", component: TableGridManagerView },
      { path: "reservations", name: "admin-reservations", component: ReservationManagerView },
      { path: "calendar", name: "admin-calendar", component: ReservationCalendarView },
      { path: "pos", name: "admin-pos", component: POSDiningSessionView },
      { path: "kitchen", name: "admin-kitchen", component: KitchenView },
      { path: "menu", name: "admin-menu", component: MenuManagerView },
      { path: "reviews", name: "admin-reviews", component: ReviewManagerView },
      { path: "inventory", name: "admin-inventory", component: InventoryManagerView },
      { path: "suppliers", name: "admin-suppliers", component: SupplierManagerView },
      { path: "vouchers", name: "admin-vouchers", component: VoucherManagerView },
      { path: "users", name: "admin-users", component: UserManagerView, meta: { roles: ["admin", "manager"] } },
      { path: "staff", name: "admin-staff", component: StaffManagerView, meta: { roles: ["admin"] } },
      { path: "audit-logs", name: "admin-audit", component: AuditLogView, meta: { roles: ["admin"] } },
      { path: "settings", name: "admin-settings", component: SettingsView, meta: { roles: ["admin"] } },
      { path: "invoice/:sessionId", name: "admin-invoice-print", component: PrintInvoiceView },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

// Guard kiểm tra đăng nhập & quyền truy cập
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (to.meta.requiresAuth) {
    if (!token || !user) {
      return next({ name: "login", query: { redirect: to.fullPath } });
    }
    if (to.meta.roles && !to.meta.roles.includes(user.role)) {
      toast.error("Bạn không có quyền truy cập vào phân vùng quản trị!");
      return next({ name: "home" });
    }
  }

  next();
});

export default router;
