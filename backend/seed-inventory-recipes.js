const mongoose = require("mongoose");
const config = require("./app/config");
const Dish = require("./app/models/dish.model");
const Ingredient = require("./app/models/ingredient.model");
const Recipe = require("./app/models/recipe.model");
const Supplier = require("./app/models/supplier.model");
const ImportReceipt = require("./app/models/import-receipt.model");
const User = require("./app/models/user.model");

async function seedInventoryAndRecipes() {
  try {
    console.log("🚀 Đang kết nối tới MongoDB để nạp dữ liệu nguyên liệu, công thức, nhà cung cấp...");
    await mongoose.connect(config.mongoUri);

    // 1. TẠO NHÀ CUNG CẤP UY TÍN
    const suppliersData = [
      {
        supplierCode: "NCC-CAMAU-01",
        name: "Vựa Cua Biển Năm Căn Cà Mau (Sáu Đạt)",
        contactPerson: "Nguyễn Văn Đạt",
        phone: "0909888999",
        email: "cuabiencamau@gmail.com",
        address: "Thị Trấn Năm Căn, Huyện Năm Căn, Tỉnh Cà Mau",
        category: "SEAFOOD",
        rating: 5,
        bankName: "Vietcombank",
        bankAccountNumber: "0123456789",
        bankAccountName: "NGUYEN VAN DAT",
        status: "active",
        note: "Chuyên cung cấp Cua Cà Mau loại 1 (cua gạch son, cua y yếm vuông) vận chuyển tươi sống hàng ngày.",
      },
      {
        supplierCode: "NCC-HAISAN-02",
        name: "Công Ty Hải Sản Tươi Sống Cần Giờ - Sài Gòn",
        contactPerson: "Trần Thị Mai",
        phone: "0918777666",
        email: "haisancangio@saigonsea.vn",
        address: "Đường Rừng Sác, Huyện Cần Giờ, TP. Hồ Chí Minh",
        category: "SEAFOOD",
        rating: 5,
        bankName: "Techcombank",
        bankAccountNumber: "19033445566",
        bankAccountName: "CTY HAI SAN CAN GIO",
        status: "active",
        note: "Cung cấp ghẹ xanh, tôm càng xanh, tôm hùm bông, hàu sữa và ốc hương tươi sống.",
      },
      {
        supplierCode: "NCC-RAU-03",
        name: "Hợp Tác Xã Nông Sản Rau Sạch Đà Lạt & Củ Chi",
        contactPerson: "Lê Hoàng Phúc",
        phone: "0933112233",
        email: "rausachdalat@gmail.com",
        address: "Phường 11, TP. Đà Lạt, Tỉnh Lâm Đồng",
        category: "VEGETABLE",
        rating: 5,
        bankName: "MBBank",
        bankAccountNumber: "093311223399",
        bankAccountName: "LE HOANG PHUC",
        status: "active",
        note: "Rau mồng tơi, rau đắng, lá giang, bắp chuối bào chuẩn VietGAP giao sáng sớm mỗi ngày.",
      },
      {
        supplierCode: "NCC-GIAVI-04",
        name: "Cơ Sở Nước Mắm Cốt & Tiêu Xanh Phú Quốc",
        contactPerson: "Phạm Quốc Tuấn",
        phone: "0944556677",
        email: "nuocmamphuquoc@phuquoc.vn",
        address: "Dương Đông, TP. Phú Quốc, Tỉnh Kiên Giang",
        category: "SPICE",
        rating: 5,
        bankName: "BIDV",
        bankAccountNumber: "6868999999",
        bankAccountName: "PHAM QUOC TUAN",
        status: "active",
        note: "Nước mắm cá cơm 40 độ đạm, tiêu chín sọ và tiêu xanh tươi hái tận vườn.",
      },
      {
        supplierCode: "NCC-DOUONG-05",
        name: "Đại Lý Đồ Uống & Nông Sản Dừa Xiêm Bến Tre",
        contactPerson: "Bùi Văn Nam",
        phone: "0988776655",
        email: "duaxiembentre@gmail.com",
        address: "Huyện Giồng Trôm, Tỉnh Bến Tre",
        category: "BEVERAGE",
        rating: 5,
        bankName: "VietinBank",
        bankAccountNumber: "1020088888",
        bankAccountName: "BUI VAN NAM",
        status: "active",
        note: "Cung cấp dừa xiêm ngọt thanh nguyên trái, bia và nước giải khát số lượng lớn.",
      },
    ];

    const supplierMap = {};
    for (const sup of suppliersData) {
      const saved = await Supplier.findOneAndUpdate(
        { name: sup.name },
        sup,
        { upsert: true, returnDocument: "after" }
      );
      supplierMap[sup.supplierCode] = saved._id;
    }
    console.log("✅ Đã cập nhật 5 Nhà cung cấp chiến lược!");

    // 2. TẠO DANH SÁCH NGUYÊN LIỆU PHONG PHÚ MAPPING VỚI THỰC ĐƠN
    const ingredientsData = [
      // Hải sản
      { name: "Cua Cà Mau Tươi Sống", category: "meat", unit: "kg", stockQuantity: 45.0, minStockLevel: 10.0 },
      { name: "Ghẹ Xanh Cần Giờ", category: "meat", unit: "kg", stockQuantity: 25.0, minStockLevel: 8.0 },
      { name: "Tôm Càng Xanh Sống", category: "meat", unit: "kg", stockQuantity: 20.0, minStockLevel: 6.0 },
      { name: "Tôm Hùm Bông Tươi", category: "meat", unit: "kg", stockQuantity: 12.0, minStockLevel: 4.0 },
      { name: "Mực Ống Tươi Phú Quốc", category: "meat", unit: "kg", stockQuantity: 18.0, minStockLevel: 5.0 },
      { name: "Hàu Sữa Cần Giờ", category: "meat", unit: "kg", stockQuantity: 35.0, minStockLevel: 10.0 },
      { name: "Ốc Hương Biển Tươi", category: "meat", unit: "kg", stockQuantity: 15.0, minStockLevel: 5.0 },
      { name: "Cá Kèo Sống Miền Tây", category: "meat", unit: "kg", stockQuantity: 14.0, minStockLevel: 4.0 },
      { name: "Cua Đồng Tươi Xay Nhuyễn", category: "meat", unit: "kg", stockQuantity: 22.0, minStockLevel: 6.0 },
      { name: "Thịt Cua Bóc Sẵn Nguyên Chất", category: "meat", unit: "kg", stockQuantity: 10.0, minStockLevel: 3.0 },
      { name: "Giò Sống Heo Tươi", category: "meat", unit: "kg", stockQuantity: 12.0, minStockLevel: 3.0 },

      // Rau củ & Quả
      { name: "Rau Mồng Tơi Tươi", category: "vegetable", unit: "kg", stockQuantity: 15.0, minStockLevel: 4.0 },
      { name: "Lá Giang Tươi Rừng", category: "vegetable", unit: "kg", stockQuantity: 10.0, minStockLevel: 3.0 },
      { name: "Rau Đắng Miền Tây", category: "vegetable", unit: "kg", stockQuantity: 8.0, minStockLevel: 2.5 },
      { name: "Bắp Chuối Bào Sạch", category: "vegetable", unit: "kg", stockQuantity: 12.0, minStockLevel: 3.0 },
      { name: "Cà Chua Đà Lạt", category: "vegetable", unit: "kg", stockQuantity: 20.0, minStockLevel: 5.0 },
      { name: "Nấm Rơm Tươi", category: "vegetable", unit: "kg", stockQuantity: 10.0, minStockLevel: 3.0 },
      { name: "Hành Lá & Rau Răm", category: "vegetable", unit: "kg", stockQuantity: 8.0, minStockLevel: 2.0 },
      { name: "Đậu Hũ Chiên Sẵn", category: "vegetable", unit: "miếng", stockQuantity: 80, minStockLevel: 20 },

      // Gia vị & Hương liệu
      { name: "Me Vắt Chua Nguyên Chất", category: "spice", unit: "kg", stockQuantity: 15.0, minStockLevel: 4.0 },
      { name: "Tiêu Xanh Tươi Phú Quốc", category: "spice", unit: "kg", stockQuantity: 6.0, minStockLevel: 1.5 },
      { name: "Bơ Lạt Nhập Khẩu", category: "spice", unit: "kg", stockQuantity: 8.0, minStockLevel: 2.0 },
      { name: "Phô Mai Mozzarella Bào", category: "spice", unit: "kg", stockQuantity: 10.0, minStockLevel: 2.5 },
      { name: "Tỏi Tươi Băm Nhuyễn", category: "spice", unit: "kg", stockQuantity: 12.0, minStockLevel: 3.0 },
      { name: "Sả Cây Tươi Đập Dập", category: "spice", unit: "kg", stockQuantity: 18.0, minStockLevel: 5.0 },
      { name: "Ớt Hiểm & Ớt Sừng", category: "spice", unit: "kg", stockQuantity: 6.0, minStockLevel: 1.5 },
      { name: "Nước Mắm Cốt Cá Cơm", category: "spice", unit: "lít", stockQuantity: 25.0, minStockLevel: 5.0 },
      { name: "Đường Cát Trắng", category: "spice", unit: "kg", stockQuantity: 30.0, minStockLevel: 8.0 },
      { name: "Muối Ớt Tây Ninh Thơm", category: "spice", unit: "kg", stockQuantity: 10.0, minStockLevel: 2.0 },
      { name: "Sa Tế Tôm Cay Thơm", category: "spice", unit: "kg", stockQuantity: 8.0, minStockLevel: 2.0 },
      { name: "Đậu Phộng Rang Giòn", category: "spice", unit: "kg", stockQuantity: 10.0, minStockLevel: 2.0 },

      // Kèm & Giải khát
      { name: "Bánh Mì Giòn Đặc Ruột", category: "other", unit: "ổ", stockQuantity: 60, minStockLevel: 20 },
      { name: "Bún Tươi Sợi Nhỏ", category: "other", unit: "kg", stockQuantity: 30.0, minStockLevel: 10.0 },
      { name: "Dừa Xiêm Bến Tre (Trái)", category: "drink", unit: "quả", stockQuantity: 50, minStockLevel: 15 },
      { name: "Bia Sài Gòn Chill (Chai)", category: "drink", unit: "chai", stockQuantity: 120, minStockLevel: 30 },
    ];

    const ingredientMap = {};
    for (const ing of ingredientsData) {
      const saved = await Ingredient.findOneAndUpdate(
        { name: ing.name },
        ing,
        { upsert: true, returnDocument: "after" }
      );
      ingredientMap[ing.name] = saved;
    }
    console.log(`✅ Đã tạo & cập nhật ${ingredientsData.length} nguyên liệu trong kho!`);

    // 3. TẠO CÔNG THỨC ĐỊNH LƯỢNG CHI TIẾT (RECIPES) CHO 18 MÓN ĂN
    const recipesDefinitions = [
      {
        dishName: "Cua Rang Me Cà Mau",
        ingredients: [
          { name: "Cua Cà Mau Tươi Sống", quantity: 0.5 },
          { name: "Me Vắt Chua Nguyên Chất", quantity: 0.08 },
          { name: "Tỏi Tươi Băm Nhuyễn", quantity: 0.02 },
          { name: "Đường Cát Trắng", quantity: 0.03 },
          { name: "Nước Mắm Cốt Cá Cơm", quantity: 0.02 },
        ],
        instructions: "Cua chặt miếng vừa ăn, sốt me phi thơm tỏi đun sệt chua ngọt thấm đều thịt cua.",
      },
      {
        dishName: "Cua Sốt Tiêu Xanh",
        ingredients: [
          { name: "Cua Cà Mau Tươi Sống", quantity: 0.5 },
          { name: "Tiêu Xanh Tươi Phú Quốc", quantity: 0.06 },
          { name: "Bơ Lạt Nhập Khẩu", quantity: 0.03 },
          { name: "Tỏi Tươi Băm Nhuyễn", quantity: 0.02 },
        ],
        instructions: "Tiêu xanh đập dập sốt bơ tỏi sánh mịn, áo đều lên cua cay nồng đậm vị.",
      },
      {
        dishName: "Cua Hấp Nước Dừa Xiêm",
        ingredients: [
          { name: "Cua Cà Mau Tươi Sống", quantity: 0.5 },
          { name: "Dừa Xiêm Bến Tre (Trái)", quantity: 1.0 },
          { name: "Sả Cây Tươi Đập Dập", quantity: 0.05 },
        ],
        instructions: "Hấp cua cùng nước dừa xiêm ngọt thanh tự nhiên giữ trọn vị ngọt gạch cua.",
      },
      {
        dishName: "Cua Nướng Phô Mai Béo Ngậy",
        ingredients: [
          { name: "Cua Cà Mau Tươi Sống", quantity: 0.5 },
          { name: "Phô Mai Mozzarella Bào", quantity: 0.1 },
          { name: "Bơ Lạt Nhập Khẩu", quantity: 0.03 },
        ],
        instructions: "Phủ phô mai mozzarella đút lò chảy vàng óng thơm lừng.",
      },
      {
        dishName: "Lẩu Cua Đồng Bắc Bộ",
        ingredients: [
          { name: "Cua Đồng Tươi Xay Nhuyễn", quantity: 0.4 },
          { name: "Đậu Hũ Chiên Sẵn", quantity: 4 },
          { name: "Cà Chua Đà Lạt", quantity: 0.2 },
          { name: "Rau Mồng Tơi Tươi", quantity: 0.3 },
          { name: "Bún Tươi Sợi Nhỏ", quantity: 0.3 },
        ],
        instructions: "Nấu riêu cua đồng đóng tảng thơm béo ăn kèm mồng tơi tươi mát.",
      },
      {
        dishName: "Lẩu Thái Hải Sản Cay Nồng",
        ingredients: [
          { name: "Tôm Càng Xanh Sống", quantity: 0.2 },
          { name: "Mực Ống Tươi Phú Quốc", quantity: 0.2 },
          { name: "Nấm Rơm Tươi", quantity: 0.15 },
          { name: "Sả Cây Tươi Đập Dập", quantity: 0.05 },
          { name: "Bún Tươi Sợi Nhỏ", quantity: 0.3 },
        ],
        instructions: "Nước lẩu Thái chua cay thơm nồng sả ớt hòa quyện hải sản tươi sống.",
      },
      {
        dishName: "Lẩu Cá Kèo Lá Giang",
        ingredients: [
          { name: "Cá Kèo Sống Miền Tây", quantity: 0.4 },
          { name: "Lá Giang Tươi Rừng", quantity: 0.15 },
          { name: "Rau Đắng Miền Tây", quantity: 0.2 },
          { name: "Bắp Chuối Bào Sạch", quantity: 0.2 },
          { name: "Bún Tươi Sợi Nhỏ", quantity: 0.3 },
        ],
        instructions: "Vò nát lá giang nấu nước lẩu chua thanh, thả cá kèo sống béo ngọt.",
      },
      {
        dishName: "Tôm Hùm Nướng Bơ Tỏi",
        ingredients: [
          { name: "Tôm Hùm Bông Tươi", quantity: 0.4 },
          { name: "Bơ Lạt Nhập Khẩu", quantity: 0.05 },
          { name: "Tỏi Tươi Băm Nhuyễn", quantity: 0.03 },
        ],
        instructions: "Chẻ đôi tôm hùm, quết bơ tỏi nướng than hoa thơm nức mũi.",
      },
      {
        dishName: "Mực Ống Nướng Sa Tế Cay",
        ingredients: [
          { name: "Mực Ống Tươi Phú Quốc", quantity: 0.35 },
          { name: "Sa Tế Tôm Cay Thơm", quantity: 0.04 },
          { name: "Ớt Hiểm & Ớt Sừng", quantity: 0.01 },
        ],
        instructions: "Khứa vảy rồng mực ống, ướp sa tế nướng giòn ngọt.",
      },
      {
        dishName: "Hàu Sữa Nướng Mỡ Hành",
        ingredients: [
          { name: "Hàu Sữa Cần Giờ", quantity: 1.0 },
          { name: "Hành Lá & Rau Răm", quantity: 0.08 },
          { name: "Đậu Phộng Rang Giòn", quantity: 0.04 },
        ],
        instructions: "Nướng hàu chín tới rưới mỡ hành sôi sùng sục và đậu phộng thơm bùi.",
      },
      {
        dishName: "Ốc Hương Nướng Muối Ớt",
        ingredients: [
          { name: "Ốc Hương Biển Tươi", quantity: 0.3 },
          { name: "Muối Ớt Tây Ninh Thơm", quantity: 0.03 },
        ],
        instructions: "Ốc hương ướp muối ớt nướng than hồng giòn ngọt đậm đà.",
      },
      {
        dishName: "Ghẹ Xanh Cần Giờ Hấp Sả",
        ingredients: [
          { name: "Ghẹ Xanh Cần Giờ", quantity: 0.5 },
          { name: "Sả Cây Tươi Đập Dập", quantity: 0.08 },
        ],
        instructions: "Hấp sả giữ trọn vị biển mặn mòi, chấm muối tiêu chanh.",
      },
      {
        dishName: "Tôm Càng Xanh Hấp Bia",
        ingredients: [
          { name: "Tôm Càng Xanh Sống", quantity: 0.4 },
          { name: "Sả Cây Tươi Đập Dập", quantity: 0.05 },
        ],
        instructions: "Hấp bia giúp tôm càng thơm ngọt, gạch tôm béo ngậy.",
      },
      {
        dishName: "Chả Cua Cố Đô Huế",
        ingredients: [
          { name: "Thịt Cua Bóc Sẵn Nguyên Chất", quantity: 0.15 },
          { name: "Giò Sống Heo Tươi", quantity: 0.15 },
          { name: "Hành Lá & Rau Răm", quantity: 0.02 },
        ],
        instructions: "Quết thịt cua cùng giò sống dai giòn, chiên vàng ươm.",
      },
      {
        dishName: "Bánh Mì Chấm Sốt Me",
        ingredients: [
          { name: "Bánh Mì Giòn Đặc Ruột", quantity: 2 },
          { name: "Me Vắt Chua Nguyên Chất", quantity: 0.03 },
        ],
        instructions: "Bánh mì nướng giòn ăn kèm nước sốt me chua ngọt.",
      },
      {
        dishName: "Bún Tươi Tẩy",
        ingredients: [
          { name: "Bún Tươi Sợi Nhỏ", quantity: 0.5 },
        ],
        instructions: "Bún tươi chần nước sôi ăn kèm lẩu.",
      },
      {
        dishName: "Bia Sài Gòn Chill (Chai)",
        ingredients: [
          { name: "Bia Sài Gòn Chill (Chai)", quantity: 1 },
        ],
        instructions: "Bia ướp lạnh phục vụ trực tiếp kèm đá.",
      },
      {
        dishName: "Nước Dừa Tươi Ba Trái",
        ingredients: [
          { name: "Dừa Xiêm Bến Tre (Trái)", quantity: 1 },
        ],
        instructions: "Chặt dừa xiêm tươi phục vụ nguyên trái.",
      },
    ];

    for (const r of recipesDefinitions) {
      const dish = await Dish.findOne({ name: r.dishName });
      if (!dish) continue;

      const lines = [];
      for (const item of r.ingredients) {
        const ing = ingredientMap[item.name];
        if (ing) {
          lines.push({
            ingredient: ing._id,
            quantityRequired: item.quantity,
          });
        }
      }

      if (lines.length > 0) {
        await Recipe.findOneAndUpdate(
          { dish: dish._id },
          { dish: dish._id, ingredients: lines, instructions: r.instructions },
          { upsert: true }
        );
      }
    }
    console.log(`✅ Đã thiết lập công thức định lượng (Recipe) cho toàn bộ ${recipesDefinitions.length} món ăn!`);

    // 4. TẠO PHIẾU NHẬP KHO MẪU (IMPORT RECEIPTS)
    const adminUser = await User.findOne({ role: "admin" });
    const sampleReceipts = [
      {
        receiptCode: "NK-20260818-001",
        supplier: supplierMap["NCC-CAMAU-01"],
        items: [
          { ingredient: ingredientMap["Cua Cà Mau Tươi Sống"]._id, quantity: 30, importPrice: 220000 },
          { ingredient: ingredientMap["Thịt Cua Bóc Sẵn Nguyên Chất"]._id, quantity: 10, importPrice: 280000 },
        ],
        totalAmount: 30 * 220000 + 10 * 280000,
        importedBy: adminUser ? adminUser._id : null,
        paymentStatus: "paid",
        notes: "Nhập lô Cua Năm Căn Cà Mau phục vụ đại tiệc cuối tuần",
      },
      {
        receiptCode: "NCC-20260818-002",
        supplier: supplierMap["NCC-HAISAN-02"],
        items: [
          { ingredient: ingredientMap["Ghẹ Xanh Cần Giờ"]._id, quantity: 20, importPrice: 190000 },
          { ingredient: ingredientMap["Tôm Càng Xanh Sống"]._id, quantity: 15, importPrice: 180000 },
          { ingredient: ingredientMap["Hàu Sữa Cần Giờ"]._id, quantity: 25, importPrice: 45000 },
        ],
        totalAmount: 20 * 190000 + 15 * 180000 + 25 * 45000,
        importedBy: adminUser ? adminUser._id : null,
        paymentStatus: "paid",
        notes: "Nhập hải sản tươi sống sáng sớm từ vựa Cần Giờ",
      },
    ];

    for (const rec of sampleReceipts) {
      await ImportReceipt.findOneAndUpdate(
        { receiptCode: rec.receiptCode },
        rec,
        { upsert: true }
      );
    }
    console.log("✅ Đã tạo các phiếu nhập kho thực tế mẫu!");

    console.log("🎉 ĐÃ ĐỔ THÀNH CÔNG DỮ LIỆU NGUYÊN LIỆU, CÔNG THỨC VÀ NHÀ CUNG CẤP 100%!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi khi nạp dữ liệu nguyên liệu:", error);
    process.exit(1);
  }
}

seedInventoryAndRecipes();
