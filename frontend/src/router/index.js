import { createRouter, createWebHistory } from "vue-router";

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

// Admin / POS Views
import DashboardView from "../views/admin/DashboardView.vue";
import TableGridManagerView from "../views/admin/TableGridManagerView.vue";
import ReservationManagerView from "../views/admin/ReservationManagerView.vue";
import POSDiningSessionView from "../views/admin/POSDiningSessionView.vue";
import MenuManagerView from "../views/admin/MenuManagerView.vue";
import InventoryManagerView from "../views/admin/InventoryManagerView.vue";

const routes = [
  {
    path: "/",
    component: CustomerLayout,
    children: [
      { path: "", name: "home", component: HomeView },
      { path: "thuc-don", name: "menu", component: MenuView },
      { path: "mon-an/:slug", name: "dish-detail", component: DishDetailView },
      { path: "dat-ban", name: "reservation", component: ReservationView },
      { path: "tra-cuu", name: "track-reservation", component: TrackReservationView },
      { path: "hang-thanh-vien", name: "rank-loyalty", component: RankLoyaltyView },
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
      { path: "pos", name: "admin-pos", component: POSDiningSessionView },
      { path: "menu", name: "admin-menu", component: MenuManagerView },
      { path: "inventory", name: "admin-inventory", component: InventoryManagerView },
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
      alert("Bạn không có quyền truy cập vào phân vùng quản trị!");
      return next({ name: "home" });
    }
  }

  next();
});

export default router;
