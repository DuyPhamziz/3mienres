const fs = require('fs');
const path = require('path');
const puppeteer = require('../backend/node_modules/puppeteer');
const mongoose = require('../backend/node_modules/mongoose');
const config = require('../backend/app/config');
const User = require('../backend/app/models/user.model');
const Invoice = require('../backend/app/models/invoice.model');
const DiningSession = require('../backend/app/models/dining-session.model');
const jwt = require('../backend/app/utils/jwt');

const outputDir = path.join(__dirname, '../hinhbaocao');

async function captureInteractive() {
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

  const sampleSession = await DiningSession.findOne({ status: 'ACTIVE' }) || await DiningSession.findOne();
  const sampleInvoice = await Invoice.findOne();
  await mongoose.disconnect();

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // Login
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  await page.evaluate((tok, usr) => {
    localStorage.setItem('token', tok);
    localStorage.setItem('user', usr);
  }, token, adminUserData);

  console.log('--- 1. Chụp 4.2 Sơ đồ bàn POS ---');
  await page.goto('http://localhost:5173/admin/pos', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(outputDir, 'hinh_4_2_so_do_ban_pos.png') });
  console.log('✓ Saved: hinh_4_2_so_do_ban_pos.png');

  console.log('--- 2. Chụp 4.3 Quét QR Check-in trên trang Quản lý đặt bàn ---');
  await page.goto('http://localhost:5173/admin/reservations', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Quét QR') || b.innerText.includes('Check-in'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outputDir, 'hinh_4_3_hop_thoai_quet_qr_checkin.png') });
  console.log('✓ Saved: hinh_4_3_hop_thoai_quet_qr_checkin.png');

  console.log('--- 3. Chụp 4.4 Tiếp nhận khách Walk-in ---');
  await page.goto('http://localhost:5173/admin/pos', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Walk-in') || b.innerText.includes('Vãng lai'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outputDir, 'hinh_4_4_tiep_don_khach_walkin.png') });
  console.log('✓ Saved: hinh_4_4_tiep_don_khach_walkin.png');

  console.log('--- 4. Chụp 4.5 Ghi order thêm món tại bàn ---');
  await page.goto('http://localhost:5173/admin/pos', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    // Click button "Gọi món" trên Session Card đầu tiên
    const orderBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Gọi món') || b.innerText.includes('Thêm món') || b.querySelector('.fa-plus, .fa-utensils'));
    if (orderBtn) orderBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outputDir, 'hinh_4_5_ghi_order_tai_ban.png') });
  console.log('✓ Saved: hinh_4_5_ghi_order_tai_ban.png');

  console.log('--- 5. Chụp 4.7 Thanh toán POS khấu trừ cọc ---');
  await page.goto('http://localhost:5173/admin/pos', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    // Click button "Thanh toán" trên Session Card đầu tiên
    const checkoutBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Thanh toán') || b.querySelector('.fa-credit-card, .fa-receipt'));
    if (checkoutBtn) checkoutBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outputDir, 'hinh_4_7_thanh_toan_pos_khau_tru_coc.png') });
  console.log('✓ Saved: hinh_4_7_thanh_toan_pos_khau_tru_coc.png');

  console.log('--- 6. Chụp 4.8 Mẫu in hóa đơn thanh toán VAT ---');
  const invoiceTargetId = sampleSession ? sampleSession._id : (sampleInvoice ? sampleInvoice._id : 'sample');
  await page.goto('http://localhost:5173/admin/invoice/' + invoiceTargetId, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(outputDir, 'hinh_4_8_mau_in_hoa_don_vat.png') });
  console.log('✓ Saved: hinh_4_8_mau_in_hoa_don_vat.png');

  await browser.close();
  console.log('🎉 ĐÃ CẬP NHẬT LẠI HOÀN CHỈNH TẤT CẢ CÁC HÌNH 4.2, 4.3, 4.4, 4.5, 4.7, 4.8 SỐNG ĐỘNG 100%!');
}

captureInteractive().catch(console.error);
