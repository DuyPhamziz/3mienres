const fs = require('fs');
const path = require('path');
const puppeteer = require('../backend/node_modules/puppeteer');
const mongoose = require('../backend/node_modules/mongoose');
const config = require('../backend/app/config');
const User = require('../backend/app/models/user.model');
const jwt = require('../backend/app/utils/jwt');

const outputDir = path.join(__dirname, '../hinhbaocao');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

async function runCapture() {
  await mongoose.connect(config.mongoUri);
  let admin = await User.findOne({ role: 'admin' });
  if (!admin) admin = await User.findOne();
  const token = jwt.signAccessToken(admin._id);
  const adminUserData = JSON.stringify({
    _id: admin._id,
    fullName: admin.fullName || 'Quản trị viên',
    phone: admin.phone,
    email: admin.email,
    role: admin.role
  });
  await mongoose.disconnect();

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // Set localStorage for Admin
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  await page.evaluate((tok, usr) => {
    localStorage.setItem('token', tok);
    localStorage.setItem('user', usr);
  }, token, adminUserData);

  const take = async (name, url, waitTime = 1200, action = null) => {
    console.log('Capturing:', name, '->', url);
    await page.goto(url, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, waitTime));
    if (action) {
      await action(page);
      await new Promise(r => setTimeout(r, 600));
    }
    const dest = path.join(outputDir, name);
    await page.screenshot({ path: dest, fullPage: false });
    console.log('✓ Saved:', name);
  };

  // --- I. GIAO DIỆN QUẢN TRỊ VIÊN ---
  await take('hinh_4_1_dashboard_doanh_thu_realtime.png', 'http://localhost:5173/admin');
  await take('hinh_4_2_so_do_ban_pos.png', 'http://localhost:5173/admin/pos');
  
  // 4.3 QR Checkin modal
  await take('hinh_4_3_hop_thoai_quet_qr_checkin.png', 'http://localhost:5173/admin/pos', 1000, async (p) => {
    await p.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Quét QR Check-in') || b.innerText.includes('Check-in'));
      if (btn) btn.click();
    });
  });

  // 4.4 Walk-in modal
  await take('hinh_4_4_tiep_don_khach_walkin.png', 'http://localhost:5173/admin/pos', 1000, async (p) => {
    await p.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Khách Vãng Lai') || b.innerText.includes('Vãng lai') || b.innerText.includes('Walk-in'));
      if (btn) btn.click();
    });
  });

  // 4.5 POS Table order detail
  await take('hinh_4_5_ghi_order_tai_ban.png', 'http://localhost:5173/admin/pos', 1000, async (p) => {
    await p.evaluate(() => {
      const tableCard = document.querySelector('.pos-table-card, .table-card') || Array.from(document.querySelectorAll('.card')).find(c => c.innerText.includes('Bàn'));
      if (tableCard) tableCard.click();
    });
  });

  await take('hinh_4_6_man_hinh_dieu_phoi_bep.png', 'http://localhost:5173/admin/kitchen');
  
  // 4.7 Checkout Modal
  await take('hinh_4_7_thanh_toan_pos_khau_tru_coc.png', 'http://localhost:5173/admin/pos', 1000, async (p) => {
    await p.evaluate(() => {
      const payBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Thanh Toán') || b.innerText.includes('Tính tiền'));
      if (payBtn) payBtn.click();
    });
  });

  await take('hinh_4_8_mau_in_hoa_don_vat.png', 'http://localhost:5173/admin/pos', 1000);
  await take('hinh_4_9_quan_ly_phong_ban_ghep_ban.png', 'http://localhost:5173/admin/tables');
  await take('hinh_4_10_quan_ly_don_dat_ban.png', 'http://localhost:5173/admin/reservations');
  await take('hinh_4_11_quan_ly_thuc_don_mon_an.png', 'http://localhost:5173/admin/menu');
  await take('hinh_4_12_quan_ly_kho_nguyen_lieu_canh_bao.png', 'http://localhost:5173/admin/inventory');
  await take('hinh_4_13_quan_ly_nha_cung_cap_nhap_kho.png', 'http://localhost:5173/admin/suppliers');
  await take('hinh_4_14_quan_ly_khuyen_mai_voucher.png', 'http://localhost:5173/admin/vouchers');
  await take('hinh_4_15_quan_ly_nhan_su_phan_quyen.png', 'http://localhost:5173/admin/staff');
  await take('hinh_4_16_nhat_ky_kiem_toan_audit_logs.png', 'http://localhost:5173/admin/audit-logs');
  await take('hinh_4_17_cai_dat_he_thong_nha_hang.png', 'http://localhost:5173/admin/settings');

  // --- II. GIAO DIỆN NGƯỜI DÙNG & KHÁCH HÀNG ---
  await take('hinh_4_18_trang_chu_website_3_mien_cua.png', 'http://localhost:5173/');
  await take('hinh_4_19_thuc_don_mon_an_3_mien.png', 'http://localhost:5173/thuc-don');
  await take('hinh_4_20_chi_tiet_mon_an_va_danh_gia.png', 'http://localhost:5173/mon-an/cua-rang-me-ca-mau');

  // 4.21 - 4.24 Reservation Wizard 4 steps with AUTH LOGGED IN
  await take('hinh_4_21_dat_ban_buoc_1_thong_tin_khach.png', 'http://localhost:5173/dat-ban');
  
  await take('hinh_4_22_dat_ban_buoc_2_chon_ban_truc_quan.png', 'http://localhost:5173/dat-ban', 1000, async (p) => {
    await p.evaluate(() => {
      const step2Btn = Array.from(document.querySelectorAll('.wizard-step-node'))[1];
      if (step2Btn) step2Btn.click();
      else {
        const next = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Tiếp tục') || b.innerText.includes('Bước 2') || b.innerText.includes('Chọn bàn'));
        if (next) next.click();
      }
    });
  });

  await take('hinh_4_23_dat_ban_buoc_3_keo_tha_mon_an.png', 'http://localhost:5173/dat-ban', 1000, async (p) => {
    await p.evaluate(() => {
      const step3Btn = Array.from(document.querySelectorAll('.wizard-step-node'))[2];
      if (step3Btn) step3Btn.click();
      else {
        const next = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Chọn món') || b.innerText.includes('Bước 3'));
        if (next) next.click();
      }
    });
  });

  await take('hinh_4_24_dat_ban_buoc_4_thanh_toan_coc_vietqr.png', 'http://localhost:5173/dat-ban', 1000, async (p) => {
    await p.evaluate(() => {
      const step4Btn = Array.from(document.querySelectorAll('.wizard-step-node'))[3];
      if (step4Btn) step4Btn.click();
      else {
        const next = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Thanh toán') || b.innerText.includes('Xác nhận') || b.innerText.includes('Bước 4'));
        if (next) next.click();
      }
    });
  });

  await take('hinh_4_25_khach_hang_goi_mon_tai_ban_qr.png', 'http://localhost:5173/goi-mon?session=SES-839201');
  await take('hinh_4_26_tra_cuu_don_va_xuat_ve_qr.png', 'http://localhost:5173/tra-cuu');
  await take('hinh_4_27_hang_thanh_vien_tich_luy.png', 'http://localhost:5173/hang-thanh-vien');
  await take('hinh_4_30_ho_so_ca_nhan.png', 'http://localhost:5173/ho-so');

  // Clear auth for login/register
  await page.evaluate(() => localStorage.clear());
  await take('hinh_4_28_dang_ky_tai_khoan.png', 'http://localhost:5173/register');
  await take('hinh_4_29_dang_nhap_tai_khoan.png', 'http://localhost:5173/login');

  await browser.close();
  console.log('\n🎉 ĐÃ CHỤP VÀ LƯU THÀNH CÔNG TẤT CẢ 30 HÌNH ẢNH VÀO THƯ MỤC hinhbaocao/ !');
}

runCapture().catch(console.error);
