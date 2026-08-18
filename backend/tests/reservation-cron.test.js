jest.mock("../app/models/reservation.model", () => ({
  find: jest.fn(),
}));
jest.mock("../app/models/setting.model", () => ({
  findOne: jest.fn(),
}));
jest.mock("../app/socket", () => ({
  emitEvent: jest.fn(),
}));
jest.mock("../app/utils/notifier", () => ({
  notifyReservationNoShow: jest.fn(),
}));
jest.mock("../app/utils/audit", () => ({
  logAction: jest.fn(),
}));

const Reservation = require("../app/models/reservation.model");
const RestaurantSetting = require("../app/models/setting.model");
const { emitEvent } = require("../app/socket");
const notifier = require("../app/utils/notifier");
const { scanAndExpireNoShowReservations } = require("../app/jobs/reservation-cron");

describe("Reservation Cron - scanAndExpireNoShowReservations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Không có đơn quá hạn -> trả về count 0", async () => {
    RestaurantSetting.findOne.mockResolvedValue({
      reservation: { gracePeriodMinutes: 15 },
    });
    Reservation.find.mockResolvedValue([]);

    const result = await scanAndExpireNoShowReservations();
    expect(result.count).toBe(0);
    expect(result.reservations).toEqual([]);
    expect(emitEvent).not.toHaveBeenCalled();
  });

  test("Có đơn CONFIRMED quá hạn -> chuyển sang NO_SHOW và giải phóng bàn", async () => {
    RestaurantSetting.findOne.mockResolvedValue({
      reservation: { gracePeriodMinutes: 15 },
    });

    const mockReservation = {
      _id: "res123",
      reservationCode: "RES-1001",
      customerName: "Nguyễn Văn A",
      customerPhone: "0901234567",
      customerEmail: "a@gmail.com",
      status: "CONFIRMED",
      startAt: new Date(Date.now() - 30 * 60000), // Quá hạn 30 phút trước
      tables: ["t1", "t2"],
      notes: "Gần cửa sổ",
      save: jest.fn().mockResolvedValue(true),
    };

    Reservation.find.mockResolvedValue([mockReservation]);

    const result = await scanAndExpireNoShowReservations();

    expect(result.count).toBe(1);
    expect(mockReservation.status).toBe("NO_SHOW");
    expect(mockReservation.tables).toEqual([]);
    expect(mockReservation.notes).toContain("[Hệ thống] Tự động hủy do khách không đến nhận bàn");
    expect(mockReservation.save).toHaveBeenCalled();
    expect(notifier.notifyReservationNoShow).toHaveBeenCalledWith(mockReservation);
    expect(emitEvent).toHaveBeenCalledWith("reservations:changed");
    expect(emitEvent).toHaveBeenCalledWith("tables:changed");
  });

  test("Xử lý lỗi kết nối DB mà không làm crash server", async () => {
    RestaurantSetting.findOne.mockRejectedValue(new Error("DB Connection Error"));

    const result = await scanAndExpireNoShowReservations();
    expect(result.count).toBe(0);
    expect(result.error).toBe("DB Connection Error");
  });
});
