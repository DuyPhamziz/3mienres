const express = require("express");
const reservationController = require("../controllers/reservation.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

// Public booking and lookup.
router.post("/", reservationController.createReservation);
router.get("/track/:code", reservationController.trackReservation);

router.use(protect);

router.patch("/:id/cancel", reservationController.cancelReservation);
router.patch("/:id/reschedule", reservationController.rescheduleReservation);
router.get("/my-history", reservationController.getMyReservations);

router.use(restrictTo("staff", "manager", "admin"));

router.get("/", reservationController.getAllReservations);
router.patch("/:id/assign-tables", reservationController.assignTables);
router.patch("/:id/confirm-deposit", reservationController.confirmDeposit);

module.exports = router;
