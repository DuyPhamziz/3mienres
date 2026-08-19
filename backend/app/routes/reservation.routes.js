const express = require("express");
const reservationController = require("../controllers/reservation.controller");
const reservationAdminController = require("../controllers/reservation-admin.controller");
const { protect, optionalProtect, restrictTo } = require("../utils/auth");

const router = express.Router();

// Public booking and lookup
router.post("/", optionalProtect, reservationController.createReservation);
router.get("/track/:code", reservationController.trackReservation);

router.use(protect);

router.patch("/:id/cancel", reservationController.cancelReservation);
router.patch("/:id/reschedule", reservationController.rescheduleReservation);
router.post("/:id/demo-confirm-deposit", reservationAdminController.demoConfirmDeposit);
router.get("/my-history", reservationController.getMyReservations);

router.use(restrictTo("staff", "manager", "admin"));

router.get("/", reservationAdminController.getAllReservations);
router.post("/scan-no-show", reservationAdminController.triggerNoShowScan);
router.patch("/:id/assign-tables", reservationAdminController.assignTables);
router.patch("/:id/confirm-deposit", reservationAdminController.confirmDeposit);
router.patch("/:id/approve-reschedule", reservationAdminController.approveReschedule);
router.patch("/:id/reject-reschedule", reservationAdminController.rejectReschedule);
router.patch("/:id/no-show", reservationAdminController.markNoShow);

module.exports = router;
