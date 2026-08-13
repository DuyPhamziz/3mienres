const RestaurantSetting = require("../models/setting.model");
const AppError = require("../app-error");

// 1. Lấy thông tin cài đặt quy định nhà hàng (Công khai)
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await RestaurantSetting.findOne();
    if (!settings) {
      // Nếu chưa có, tự động khởi tạo bản ghi cài đặt mặc định
      settings = await RestaurantSetting.create({
        restaurantName: "Nhà hàng 3 Miền Cua",
        hotline: "1900 1234",
        reservation: {
          defaultDurationMinutes: 120,
          gracePeriodMinutes: 15,
          maxAdvanceDays: 30,
        },
        table: {
          maxSingleTableCapacity: 20,
          allowCombination: true,
        },
      });
    }

    res.status(200).json({
      status: "success",
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Cập nhật quy định nhà hàng (Chỉ Manager / Admin)
exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await RestaurantSetting.findOne();
    if (!settings) {
      settings = new RestaurantSetting(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    await settings.save();

    res.status(200).json({
      status: "success",
      message: "Cập nhật cài đặt nhà hàng thành công",
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};