const mongoose = require("mongoose");
const Area = require("./app/models/area.model");
const Table = require("./app/models/table.model");
const TableConnection = require("./app/models/table-connection.model");
const Category = require("./app/models/category.model");
const Dish = require("./app/models/dish.model");
const slugify = require("./app/utils/slugify");
const config = require("./app/config");

async function seedMore() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("🚀 BẮT ĐẦU ĐỔ THÊM DỮ LIỆU PHONG PHÚ VÀO DATABASE 3MIEN...");

    // 1. TẠO KHU VỰC NHÀ HÀNG (AREAS)
    const areaT1 = await Area.findOneAndUpdate(
      { name: "Tầng 1 - Sảnh Chính" },
      { name: "Tầng 1 - Sảnh Chính", description: "Không gian máy lạnh ấm cúng, gần bể hải sản tươi sống", isActive: true },
      { upsert: true, returnDocument: "after" }
    );

    const areaVIP = await Area.findOneAndUpdate(
      { name: "Tầng 2 - Phòng VIP" },
      { name: "Tầng 2 - Phòng VIP", description: "Phòng VIP riêng tư có Karaoke, máy chiếu phù hợp họp mặt tiệc", isActive: true },
      { upsert: true, returnDocument: "after" }
    );

    const areaRoof = await Area.findOneAndUpdate(
      { name: "Sân Thượng - Rooftop View" },
      { name: "Sân Thượng - Rooftop View", description: "Không gian mở thoáng mát ngắm cảnh đêm thành phố", isActive: true },
      { upsert: true, returnDocument: "after" }
    );

    const areaGarden = await Area.findOneAndUpdate(
      { name: "Khu Sân Vườn" },
      { name: "Khu Sân Vườn", description: "Khu vực sảnh sân vườn thiên nhiên rợp bóng mát", isActive: true },
      { upsert: true, returnDocument: "after" }
    );

    console.log("✅ Đã tạo 4 Khu vực nhà hàng!");

    // 2. TẠO DANH SÁCH BÀN ĂN (TABLES)
    const tablesData = [
      // Tầng 1
      { tableNumber: "B01", capacity: 4, area: areaT1._id },
      { tableNumber: "B02", capacity: 4, area: areaT1._id },
      { tableNumber: "B03", capacity: 6, area: areaT1._id },
      { tableNumber: "B04", capacity: 10, area: areaT1._id },
      { tableNumber: "B05", capacity: 20, area: areaT1._id },
      { tableNumber: "B06", capacity: 20, area: areaT1._id },
      { tableNumber: "B07", capacity: 2, area: areaT1._id },
      { tableNumber: "B08", capacity: 4, area: areaT1._id },

      // Phòng VIP
      { tableNumber: "VIP01", capacity: 8, area: areaVIP._id },
      { tableNumber: "VIP02", capacity: 12, area: areaVIP._id },
      { tableNumber: "VIP03", capacity: 16, area: areaVIP._id },

      // Rooftop
      { tableNumber: "RT01", capacity: 4, area: areaRoof._id },
      { tableNumber: "RT02", capacity: 4, area: areaRoof._id },
      { tableNumber: "RT03", capacity: 6, area: areaRoof._id },

      // Sân Vườn
      { tableNumber: "SV01", capacity: 6, area: areaGarden._id },
      { tableNumber: "SV02", capacity: 8, area: areaGarden._id },
    ];

    const tableMap = {};
    for (let t of tablesData) {
      const savedTable = await Table.findOneAndUpdate(
        { tableNumber: t.tableNumber },
        { ...t, status: "AVAILABLE", isActive: true },
        { upsert: true, returnDocument: "after" }
      );
      tableMap[t.tableNumber] = savedTable._id;
    }
    console.log("✅ Đã tạo 16 Bàn ăn đa dạng sức chứa!");

    // 3. TẠO CÁC CẶP BÀN KỀ NHAU (TABLE CONNECTIONS)
    const connectionsData = [
      { a: "B01", b: "B02", note: "2 Bàn 4 chỗ kề nhau Tầng 1" },
      { a: "B02", b: "B03", note: "Bàn 4 chỗ ghép Bàn 6 chỗ sảnh Tầng 1" },
      { a: "B03", b: "B04", note: "Bàn 6 chỗ ghép Bàn 10 chỗ Tầng 1" },
      { a: "B05", b: "B06", note: "2 Bàn đại tiệc 20 chỗ kề nhau" },
      { a: "RT01", b: "RT02", note: "2 Bàn đôi sân thượng kề nhau" },
      { a: "SV01", b: "SV02", note: "2 Bàn sân vườn ghép đoàn 14 người" },
    ];

    for (let c of connectionsData) {
      if (tableMap[c.a] && tableMap[c.b]) {
        await TableConnection.findOneAndUpdate(
          { tableA: tableMap[c.a], tableB: tableMap[c.b] },
          { tableA: tableMap[c.a], tableB: tableMap[c.b], note: c.note, isActive: true },
          { upsert: true }
        );
      }
    }
    console.log("✅ Đã tạo 6 Liên kết cặp bàn kề nhau!");

    // 4. TẠO DANH MỤC MÓN ĂN (CATEGORIES)
    const catCua = await Category.findOneAndUpdate(
      { name: "Đặc Sản Cua Cà Mau" },
      { name: "Đặc Sản Cua Cà Mau", slug: slugify("Đặc Sản Cua Cà Mau"), description: "Cua Cà Mau tươi sống bắt tại bể chế biến theo yêu cầu", image: "crab.jpg" },
      { upsert: true, returnDocument: "after" }
    );

    const catLau = await Category.findOneAndUpdate(
      { name: "Món Lẩu 3 Miền" },
      { name: "Món Lẩu 3 Miền", slug: slugify("Món Lẩu 3 Miền"), description: "Các loại lẩu đặc trưng thanh ngọt cay nồng 3 miền", image: "hotpot.jpg" },
      { upsert: true, returnDocument: "after" }
    );

    const catNuong = await Category.findOneAndUpdate(
      { name: "Món Nướng Đậm Vị" },
      { name: "Món Nướng Đậm Vị", slug: slugify("Món Nướng Đậm Vị"), description: "Hải sản nướng mỡ hành, nướng phô mai, sa tế cay thơm", image: "grill.jpg" },
      { upsert: true, returnDocument: "after" }
    );

    const catHaiSan = await Category.findOneAndUpdate(
      { name: "Hải Sản Tươi Sống" },
      { name: "Hải Sản Tươi Sống", slug: slugify("Hải Sản Tươi Sống"), description: "Tôm hùm, tôm càng, ghẹ xanh, hàu tươi nướng bơ tỏi", image: "seafood.jpg" },
      { upsert: true, returnDocument: "after" }
    );

    const catKiem = await Category.findOneAndUpdate(
      { name: "Món Kèm & Đồ Uống" },
      { name: "Món Kèm & Đồ Uống", slug: slugify("Món Kèm & Đồ Uống"), description: "Bánh mì, bún tươi, bia lạnh, giải khát", image: "drink.jpg" },
      { upsert: true, returnDocument: "after" }
    );

    console.log("✅ Đã tạo 5 Danh mục món ăn (Món Cua, Món Lẩu, Món Nướng, Hải Sản, Đồ Uống)!");

    // 5. TẠO DANH SÁCH MÓN ĂN PHONG PHÚ (DISHES)
    const dishesList = [
      // Món Cua
      { name: "Cua Rang Me Cà Mau", price: 350000, region: "Nam", category: catCua._id, description: "Cua Cà Mau tươi chắc thịt rang sốt me chua ngọt đậm vị Nam Bộ.", isFeatured: true, image: "https://images.unsplash.com/photo-1559737605-3416694e7769?auto=format&fit=crop&w=600&q=80" },
      { name: "Cua Sốt Tiêu Xanh", price: 380000, region: "Trung", category: catCua._id, description: "Cua Cà Mau sốt tiêu xanh cay nồng ấm đượm vị biển Miền Trung.", isFeatured: true, image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80" },
      { name: "Cua Hấp Nước Dừa Xiêm", price: 360000, region: "Nam", category: catCua._id, description: "Cua hấp nước dừa xiêm ngọt thanh tự nhiên giữ trọn vị gạch cua.", isFeatured: false, image: "https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=600&q=80" },
      { name: "Cua Nướng Phô Mai Béo Ngậy", price: 390000, region: "Nam", category: catNuong._id, description: "Cua nướng phủ lớp phô mai Mozzarella đút lò béo ngậy thơm lừng.", isFeatured: true, image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80" },

      // Món Lẩu
      { name: "Lẩu Cua Đồng Bắc Bộ", price: 290000, region: "Bắc", category: catLau._id, description: "Lẩu cua đồng chuẩn vị Bắc với riêu cua béo ngậy, ăn kèm rau mồng tơi và bánh đa.", isFeatured: true, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80" },
      { name: "Lẩu Thái Hải Sản Cay Nồng", price: 320000, region: "Nam", category: catLau._id, description: "Lẩu Thái chua cay đậm vị ăn kèm tôm, mực, nghêu tươi ngọt.", isFeatured: false, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80" },
      { name: "Lẩu Cá Kèo Lá Giang", price: 260000, region: "Nam", category: catLau._id, description: "Lẩu cá kèo lá giang vị chua thanh đậm chất miền Tây sông nước.", isFeatured: false, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80" },

      // Món Nướng
      { name: "Tôm Hùm Nướng Bơ Tỏi", price: 450000, region: "Nam", category: catNuong._id, description: "Tôm hùm bông nướng sốt bơ tỏi thơm nức mũi, thịt tôm giòn ngọt.", isFeatured: true, image: "https://images.unsplash.com/photo-1553240799-36bbf332a5c3?auto=format&fit=crop&w=600&q=80" },
      { name: "Mực Ống Nướng Sa Tế Cay", price: 220000, region: "Trung", category: catNuong._id, description: "Mực ống nướng ướp sa tế ớt hiểm cay nồng đậm vị miền Trung.", isFeatured: false, image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80" },
      { name: "Hàu Sữa Nướng Mỡ Hành", price: 150000, region: "Nam", category: catNuong._id, description: "Hàu sữa nướng mỡ hành béo ngậy rắc đậu phụng rang giòn.", isFeatured: false, image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80" },
      { name: "Ốc Hương Nướng Muối Ớt", price: 240000, region: "Trung", category: catNuong._id, description: "Ốc hương nướng muối ớt cay giòn sần sật.", isFeatured: false, image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=600&q=80" },

      // Hải Sản Tươi Sống
      { name: "Ghẹ Xanh Cần Giờ Hấp Sả", price: 310000, region: "Nam", category: catHaiSan._id, description: "Ghẹ xanh thịt chắc ngọt hấp sả ớt tươi ăn kèm muối tiêu chanh.", isFeatured: false, image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80" },
      { name: "Tôm Càng Xanh Hấp Bia", price: 280000, region: "Nam", category: catHaiSan._id, description: "Tôm càng xanh hấp bia thơm ngon giòn ngọt.", isFeatured: false, image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80" },
      { name: "Chả Cua Cố Đô Huế", price: 180000, region: "Trung", category: catHaiSan._id, description: "Chả cua quết dẻo thơm lừng đặc sản cố đô Huế.", isFeatured: false, image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80" },

      // Đồ Uống & Kèm
      { name: "Bánh Mì Chấm Sốt Me", price: 25000, region: "Nam", category: catKiem._id, description: "Bánh mì giòn rụm chấm sốt me cua đậm đà.", isFeatured: false, image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80" },
      { name: "Bún Tươi Tẩy", price: 20000, region: "Bắc", category: catKiem._id, description: "Bún tươi ăn kèm lẩu.", isFeatured: false, image: "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?auto=format&fit=crop&w=600&q=80" },
      { name: "Bia Sài Gòn Chill (Chai)", price: 28000, region: "Nam", category: catKiem._id, description: "Bia ướp lạnh sảng khoái.", isFeatured: false, image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=600&q=80" },
      { name: "Nước Dừa Tươi Ba Trái", price: 35000, region: "Nam", category: catKiem._id, description: "Nước dừa tươi mẻ nguyên trái.", isFeatured: false, image: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=600&q=80" },
    ];

    for (let d of dishesList) {
      await Dish.findOneAndUpdate(
        { name: d.name },
        {
          ...d,
          slug: slugify(d.name),
          image: d.image,
          availability: true,
        },
        { upsert: true }
      );
    }
    console.log("✅ Đã tạo 18 Món ăn đặc sản (Cua, Lẩu, Nướng, Hải Sản, Đồ Uống)!");

    console.log("🎉 ĐÃ ĐỔ THÊM DỮ LIỆU VÀO DATABASE 3MIEN THÀNH CÔNG 100%!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi seed thêm dữ liệu:", err);
    process.exit(1);
  }
}

seedMore();
