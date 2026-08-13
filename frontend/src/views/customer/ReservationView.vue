<template>
  <div class="py-5 bg-light min-vh-100">
    <div class="container">
      <div class="text-center max-w-2xl mx-auto mb-4">
        <span class="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill fw-bold mb-2 fs-8">
          <i class="fa-solid fa-calendar-check me-1"></i> {{ langStore.t('reservation.badge') }}
        </span>
        <h1 class="display-5 fw-bold brand-font text-dark">{{ langStore.t('reservation.title') }}</h1>
        <p class="text-muted small mb-0">{{ langStore.t('reservation.subtitle') }}</p>
      </div>

      <!-- VÙNG BẮT BUỘC ĐĂNG NHẬP (AUTH CHECK) -->
      <div v-if="!authStore.isAuthenticated" class="max-w-xl mx-auto glass-card p-5 rounded-5 text-center shadow-lg bg-white border-danger border-opacity-25">
        <div class="p-3 bg-danger bg-opacity-10 text-danger rounded-circle d-inline-block mb-3">
          <i class="fa-solid fa-user-lock display-4"></i>
        </div>
        <h3 class="fw-bold text-dark mb-2">{{ langStore.t('reservation.loginRequired') }}</h3>
        <p class="text-muted small mb-4">
          {{ langStore.t('reservation.loginDesc') }}
        </p>
        <div class="d-flex justify-content-center gap-3">
          <router-link to="/login?redirect=/dat-ban" class="btn btn-primary-crab px-4 py-2.5 fw-bold">
            <i class="fa-solid fa-right-to-bracket me-2"></i> {{ langStore.isEnglish ? 'Login Now' : 'Đăng Nhập Ngay' }}
          </router-link>
          <router-link to="/register" class="btn btn-outline-danger rounded-pill px-4 py-2.5 fw-bold">
            {{ langStore.isEnglish ? 'Register Account' : 'Đăng Ký Thành Viên' }}
          </router-link>
        </div>
      </div>

      <!-- Result Success Box with VietQR Deposit Code -->
      <div v-else-if="successData" class="max-w-2xl mx-auto glass-card p-4 p-md-5 rounded-5 text-center mb-5 border-success shadow-lg bg-white">
        <div class="badge bg-success px-3 py-2 rounded-pill fs-7 mb-3">
          <i class="fa-solid fa-circle-check me-1"></i> {{ langStore.isEnglish ? 'BOOKING SUCCESSFUL' : 'ĐẶT BÀN THÀNH CÔNG' }}
        </div>
        <h2 class="brand-font text-success mb-2">{{ langStore.isEnglish ? 'Booking Code:' : 'Mã Đặt Bàn:' }} {{ successData.data.reservation.reservationCode }}</h2>
        <p class="text-muted mb-4">
          {{ langStore.isEnglish ? '3 Miền Cua Restaurant has registered booking for:' : 'Nhà hàng 3 Miền Cua đã ghi nhận giữ chỗ cho Anh/Chị' }} <strong>{{ successData.data.reservation.customerName }}</strong>!
        </p>

        <!-- Dynamic Combination Notice -->
        <div v-if="successData.isCombinedTable" class="alert alert-warning rounded-4 p-3 mb-4 text-start">
          <div class="d-flex align-items-center gap-3">
            <i class="fa-solid fa-puzzle-piece fs-3 text-warning"></i>
            <div>
              <strong class="d-block text-dark">{{ langStore.isEnglish ? 'Auto table combination notice:' : 'Thông báo ghép bàn tự động:' }}</strong>
              <small class="text-secondary">
                {{ langStore.isEnglish ? `For group of ${successData.data.reservation.guestsCount} guests, system automatically combined adjacent tables!` : `Vì đoàn ${successData.data.reservation.guestsCount} người khá đông, hệ thống đã tự động ghép cụm bàn kề nhau cho bạn!` }}
              </small>
            </div>
          </div>
        </div>

        <!-- VietQR Deposit Payment Box -->
        <div v-if="successData.deposit && successData.deposit.amount > 0" class="p-4 bg-light rounded-4 border mb-4">
          <h5 class="fw-bold brand-font text-danger mb-2">
            <i class="fa-solid fa-qrcode me-2"></i>{{ langStore.isEnglish ? 'Pay Table & Dish Deposit' : 'Thanh Toán Cọc Giữ Bàn & Món Ăn' }}
          </h5>
          <p class="small text-muted mb-3">
            {{ langStore.isEnglish ? `Please scan VietQR code below using Banking app to pay deposit of ${successData.deposit.amount.toLocaleString('vi-VN')}đ` : `Vui lòng quét Mã QR bên dưới bằng ứng dụng Ngân hàng để nộp tiền cọc ${successData.deposit.amount.toLocaleString('vi-VN')}đ` }}
          </p>
          
          <img
            v-if="successData.deposit.qrCodeUrl"
            :src="successData.deposit.qrCodeUrl"
            alt="Mã QR VietQR Đặt Cọc"
            class="img-fluid rounded-3 border shadow-sm mb-3"
            style="max-width: 260px;"
          />

          <div class="small text-secondary bg-white p-3 rounded-3 border text-start mb-3">
            <p class="mb-1"><strong>{{ langStore.isEnglish ? 'Bank:' : 'Ngân hàng nhận:' }}</strong> {{ successData.deposit.bankInfo.bankId }} - {{ successData.deposit.bankInfo.accountName }}</p>
            <p class="mb-1"><strong>{{ langStore.isEnglish ? 'Account No:' : 'Số tài khoản:' }}</strong> {{ successData.deposit.bankInfo.accountNo }}</p>
            <p class="mb-0"><strong>{{ langStore.isEnglish ? 'Transfer Note:' : 'Nội dung chuyển khoản:' }}</strong> <span class="text-danger fw-bold">COC {{ successData.data.reservation.reservationCode }}</span></p>
          </div>

          <!-- Nút Giả lập Nộp Cọc Demo cho Giảng viên / Đồ Án -->
          <button
            type="button"
            @click="handleDemoDepositSuccess"
            class="btn btn-warning rounded-pill px-4 py-2.5 fw-bold shadow-sm w-100 text-dark"
          >
            <i class="fa-solid fa-bolt me-1"></i> [⚡ DEMO TEST] Giả Lập Nộp Cọc Thành Công
          </button>
        </div>

        <div class="d-flex justify-content-center gap-3 flex-wrap">
          <router-link to="/" class="btn btn-primary-crab rounded-pill px-4 fw-bold">
            <i class="fa-solid fa-house me-1"></i> {{ langStore.isEnglish ? 'Back to Home' : 'Về Trang Chủ' }}
          </router-link>
          <router-link :to="`/tra-cuu?code=${successData.data.reservation.reservationCode}`" class="btn btn-outline-danger rounded-pill px-4 fw-semibold">
            {{ langStore.isEnglish ? 'View Status' : 'Xem Trạng Thái Đơn' }}
          </router-link>
          <button @click="resetForm" class="btn btn-outline-secondary rounded-pill px-4 fw-semibold">
            {{ langStore.isEnglish ? 'Book Another Table' : 'Đặt Thêm Đơn Khác' }}
          </button>
        </div>
      </div>

      <!-- MULTI-STEP WIZARD WHEN LOGGED IN -->
      <div v-else class="max-w-5xl mx-auto">
        <!-- WIZARD STEP NAVIGATION BAR -->
        <div class="wizard-header-steps mb-4">
          <div class="d-flex justify-content-between align-items-center position-relative px-2">
            <!-- Step 1 -->
            <div
              @click="goToStep(1)"
              :class="['wizard-step-node cursor-pointer', currentStep === 1 ? 'active' : '', currentStep > 1 ? 'completed' : '']"
            >
              <div class="wizard-step-circle">
                <i v-if="currentStep > 1" class="fa-solid fa-check fs-8"></i>
                <span v-else>1</span>
              </div>
              <span class="wizard-step-label fw-bold">{{ langStore.isEnglish ? '1. Contact Info' : '1. Thông Tin' }}</span>
            </div>

            <div class="wizard-step-line flex-grow-1 mx-2" :class="{ 'active-line': currentStep > 1 }"></div>

            <!-- Step 2 -->
            <div
              @click="goToStep(2)"
              :class="['wizard-step-node cursor-pointer', currentStep === 2 ? 'active' : '', currentStep > 2 ? 'completed' : '']"
            >
              <div class="wizard-step-circle">
                <i v-if="currentStep > 2" class="fa-solid fa-check fs-8"></i>
                <span v-else>2</span>
              </div>
              <span class="wizard-step-label fw-bold">{{ langStore.isEnglish ? '2. Select Table' : '2. Chọn Bàn' }}</span>
            </div>

            <div class="wizard-step-line flex-grow-1 mx-2" :class="{ 'active-line': currentStep > 2 }"></div>

            <!-- Step 3 -->
            <div
              @click="goToStep(3)"
              :class="['wizard-step-node cursor-pointer', currentStep === 3 ? 'active' : '', currentStep > 3 ? 'completed' : '']"
            >
              <div class="wizard-step-circle">
                <i v-if="currentStep > 3" class="fa-solid fa-check fs-8"></i>
                <span v-else>3</span>
              </div>
              <span class="wizard-step-label fw-bold">{{ langStore.isEnglish ? '3. Dishes (Drag & Drop)' : '3. Chọn Món' }}</span>
            </div>

            <div class="wizard-step-line flex-grow-1 mx-2" :class="{ 'active-line': currentStep > 3 }"></div>

            <!-- Step 4 -->
            <div
              @click="goToStep(4)"
              :class="['wizard-step-node cursor-pointer', currentStep === 4 ? 'active' : '']"
            >
              <div class="wizard-step-circle">
                <span>4</span>
              </div>
              <span class="wizard-step-label fw-bold">{{ langStore.isEnglish ? '4. Confirm & Deposit' : '4. Xác Nhận' }}</span>
            </div>
          </div>
        </div>

        <!-- WIZARD STEP CONTENT CONTAINER -->
        <div class="glass-card p-4 p-md-5 rounded-5 shadow-lg border-0 bg-white min-vh-card">
          <!-- STEP 1: CUSTOMER CONTACT INFO -->
          <div v-if="currentStep === 1" class="wizard-panel">
            <h4 class="fw-bold text-danger brand-font mb-4 d-flex align-items-center gap-2">
              <i class="fa-solid fa-address-card"></i>
              {{ langStore.isEnglish ? 'Step 1: Customer Contact Information' : 'Bước 1: Thông Tin Người Đặt Bàn' }}
            </h4>

            <div class="row g-4 mb-4">
              <div class="col-md-6">
                <label class="form-label fw-semibold fs-7 text-dark">{{ langStore.isEnglish ? 'Full Name' : 'Họ và tên người đặt' }} <span class="text-danger">*</span></label>
                <div class="form-control-icon">
                  <input v-model="form.customerName" type="text" class="form-control py-3 fs-7" placeholder="Ví dụ: Nguyễn Văn A" required />
                  <i class="fa-solid fa-user"></i>
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold fs-7 text-dark">{{ langStore.isEnglish ? 'Phone Number' : 'Số điện thoại liên hệ' }} <span class="text-danger">*</span></label>
                <div class="form-control-icon">
                  <input v-model="form.customerPhone" type="tel" class="form-control py-3 fs-7" placeholder="Ví dụ: 0988776655" required />
                  <i class="fa-solid fa-phone"></i>
                </div>
              </div>

              <div class="col-md-12">
                <label class="form-label fw-semibold fs-7 text-dark">{{ langStore.isEnglish ? 'Email (Optional)' : 'Địa chỉ Email (Nhận mã vé đặt bàn)' }}</label>
                <div class="form-control-icon">
                  <input v-model="form.customerEmail" type="email" class="form-control py-3 fs-7" placeholder="email@example.com" />
                  <i class="fa-solid fa-envelope"></i>
                </div>
              </div>
            </div>

            <div v-if="stepError" class="alert alert-danger py-2 px-3 rounded-3 small mb-4">
              <i class="fa-solid fa-circle-exclamation me-1"></i>{{ stepError }}
            </div>

            <div class="d-flex justify-content-end pt-3">
              <button type="button" @click="validateAndNext(1)" class="btn btn-danger btn-lg rounded-pill px-5 fw-bold shadow-sm">
                {{ langStore.isEnglish ? 'Next: Select Table' : 'Tiếp Theo: Chọn Thời Gian & Bàn' }}
                <i class="fa-solid fa-arrow-right ms-2"></i>
              </button>
            </div>
          </div>

          <!-- STEP 2: ARRIVAL TIME & VISUAL TABLE MAP -->
          <div v-else-if="currentStep === 2" class="wizard-panel">
            <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <h4 class="fw-bold text-danger brand-font mb-0 d-flex align-items-center gap-2">
                <i class="fa-solid fa-chair"></i>
                {{ langStore.isEnglish ? 'Step 2: Select Arrival Time & Table' : 'Bước 2: Thời Gian & Sơ Đồ Chọn Bàn Thực Tế' }}
              </h4>

              <!-- Status legend -->
              <div class="d-flex align-items-center gap-3 fs-8 fw-semibold">
                <span class="d-inline-flex align-items-center gap-1"><i class="fa-solid fa-circle text-success fs-9"></i> {{ langStore.isEnglish ? 'Available' : 'Bàn trống' }}</span>
                <span class="d-inline-flex align-items-center gap-1"><i class="fa-solid fa-circle text-secondary fs-9"></i> {{ langStore.isEnglish ? 'Booked' : 'Đã đặt' }}</span>
                <span class="d-inline-flex align-items-center gap-1"><i class="fa-solid fa-circle text-warning fs-9"></i> {{ langStore.isEnglish ? 'Custom/Group' : 'Bàn tùy chỉnh' }}</span>
              </div>
            </div>

            <!-- Arrival Time Input -->
            <div class="mb-4">
              <label class="form-label fw-semibold fs-7 text-dark">{{ langStore.t('reservation.startAt') }} <span class="text-danger">*</span></label>
              <div class="form-control-icon" style="max-width: 320px;">
                <input v-model="form.startAt" type="datetime-local" class="form-control py-2.5" required />
                <i class="fa-solid fa-clock"></i>
              </div>
            </div>

            <!-- Area Filter Tabs -->
            <div class="d-flex align-items-center gap-2 mb-3 overflow-x-auto pb-2">
              <button
                type="button"
                @click="selectedAreaId = 'ALL'"
                :class="['btn btn-sm rounded-pill px-3 fw-semibold', selectedAreaId === 'ALL' ? 'btn-danger' : 'btn-light']"
              >
                {{ langStore.isEnglish ? 'All Areas' : 'Tất Cả Khu Vực' }}
              </button>
              <button
                v-for="area in tableStore.areas"
                :key="area._id"
                type="button"
                @click="selectedAreaId = area._id"
                :class="['btn btn-sm rounded-pill px-3 fw-semibold', selectedAreaId === area._id ? 'btn-danger' : 'btn-light']"
              >
                {{ area.name }}
              </button>
            </div>

            <!-- Visual Table Map Grid -->
            <div class="row g-3 mb-4">
              <!-- Regular Tables -->
              <div
                v-for="table in filteredTables"
                :key="table._id"
                class="col-6 col-sm-4 col-md-3"
              >
                <div
                  @click="selectTable(table)"
                  :class="[
                    'p-3 rounded-4 border text-center transition-all cursor-pointer h-100 d-flex flex-column justify-content-between position-relative',
                    table.status === 'AVAILABLE'
                      ? (selectedTableId === table._id
                          ? 'border-danger bg-danger bg-opacity-10 shadow-sm border-2'
                          : 'border-success bg-white hover-shadow')
                      : 'border-secondary bg-light text-muted opacity-50 pointer-events-none'
                  ]"
                >
                  <!-- Selected Badge -->
                  <span v-if="selectedTableId === table._id" class="position-absolute top-0 end-0 m-2 text-danger">
                    <i class="fa-solid fa-circle-check fs-6"></i>
                  </span>

                  <div>
                    <div class="d-flex align-items-center justify-content-center gap-1 mb-1">
                      <i class="fa-solid fa-chair text-secondary fs-8"></i>
                      <strong class="brand-font text-dark fs-6">Bàn {{ table.tableNumber }}</strong>
                    </div>
                    <small class="d-block text-muted fs-8 mb-2">
                      <i class="fa-solid fa-users me-1"></i>{{ table.capacity }} {{ langStore.isEnglish ? 'seats' : 'chỗ ngồi' }}
                    </small>
                  </div>

                  <div>
                    <span
                      :class="[
                        'badge rounded-pill fs-9 fw-bold px-2 py-1',
                        table.status === 'AVAILABLE'
                          ? (selectedTableId === table._id ? 'bg-danger text-white' : 'bg-success text-white')
                          : 'bg-secondary text-white'
                      ]"
                    >
                      {{ table.status === 'AVAILABLE' ? (selectedTableId === table._id ? 'Đang Chọn' : 'Bàn Trống') : 'Đã Đặt' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Special Custom Table Option Card for Large Groups -->
              <div class="col-6 col-sm-4 col-md-3">
                <div
                  @click="selectCustomTable"
                  :class="[
                    'p-3 rounded-4 border text-center transition-all cursor-pointer h-100 d-flex flex-column justify-content-between',
                    isCustomTable
                      ? 'border-warning bg-warning bg-opacity-15 shadow-sm border-2'
                      : 'border-warning border-dashed bg-warning bg-opacity-5 hover-shadow'
                  ]"
                >
                  <div>
                    <div class="p-2 bg-warning bg-opacity-20 text-warning rounded-circle d-inline-flex mb-1">
                      <i class="fa-solid fa-user-group fs-6 text-dark"></i>
                    </div>
                    <strong class="brand-font d-block text-dark fs-7 mb-1">
                      {{ langStore.isEnglish ? 'Custom / Large Group' : 'Bàn Tùy Chỉnh / Đoàn Đông' }}
                    </strong>
                    <small class="d-block text-muted fs-9 mb-2">
                      {{ langStore.isEnglish ? 'For >10 guests (Auto match)' : 'Dành cho đoàn >10 người' }}
                    </small>
                  </div>

                  <div>
                    <span :class="['badge rounded-pill fs-9 fw-bold px-2 py-1', isCustomTable ? 'bg-dark text-warning' : 'bg-warning text-dark']">
                      {{ isCustomTable ? 'Đã Chọn' : 'Nhập Số Khách' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Custom Guests Input -->
            <div v-if="isCustomTable" class="mb-4 p-3 bg-warning bg-opacity-10 rounded-4 border border-warning">
              <div class="d-flex align-items-center gap-3 flex-wrap">
                <i class="fa-solid fa-puzzle-piece fs-4 text-warning"></i>
                <div class="flex-grow-1">
                  <label class="form-label fw-semibold fs-7 text-dark mb-1">
                    {{ langStore.isEnglish ? 'Enter number of guests for custom group booking:' : 'Nhập chính xác số lượng khách dùng bữa:' }}
                  </label>
                  <div class="d-flex align-items-center gap-2" style="max-width: 240px;">
                    <input
                      v-model.number="form.guestsCount"
                      type="number"
                      min="1"
                      max="100"
                      class="form-control fw-bold text-center"
                      required
                    />
                    <span class="fw-bold text-dark fs-7">{{ langStore.isEnglish ? 'guests' : 'người' }}</span>
                  </div>
                </div>
                <small class="text-secondary max-w-sm">
                  <i class="fa-solid fa-circle-info me-1 text-warning"></i>
                  Hệ thống 3 Miền Cua sẽ tự động chạy thuật toán tìm và ghép cụm bàn kề nhau tối ưu nhất cho đoàn của bạn!
                </small>
              </div>
            </div>

            <!-- Selected Table Info Bar -->
            <div v-else-if="selectedTableId" class="mb-4 p-3 bg-success bg-opacity-10 rounded-4 border border-success border-opacity-25 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div class="d-flex align-items-center gap-2">
                <i class="fa-solid fa-circle-check text-success fs-5"></i>
                <div>
                  <strong class="text-dark fs-7">
                    Đã chọn Bàn {{ getSelectedTableObj?.tableNumber }} (Sức chứa {{ getSelectedTableObj?.capacity }} chỗ)
                  </strong>
                  <small class="text-muted d-block fs-8">Hệ thống sẽ giữ bàn này cho bạn khi tới nhà hàng.</small>
                </div>
              </div>
              <span class="badge bg-success rounded-pill px-3 py-1.5 fw-bold fs-8">Sẵn Sàng</span>
            </div>

            <div v-if="stepError" class="alert alert-danger py-2 px-3 rounded-3 small mb-4">
              <i class="fa-solid fa-circle-exclamation me-1"></i>{{ stepError }}
            </div>

            <!-- Navigation Actions -->
            <div class="d-flex justify-content-between align-items-center pt-3 border-top">
              <button type="button" @click="currentStep = 1" class="btn btn-outline-secondary rounded-pill px-4 fw-bold">
                <i class="fa-solid fa-arrow-left me-2"></i> {{ langStore.isEnglish ? 'Back' : 'Quay Lại' }}
              </button>
              <button type="button" @click="validateAndNext(2)" class="btn btn-danger btn-lg rounded-pill px-5 fw-bold shadow-sm">
                {{ langStore.isEnglish ? 'Next: Pre-order Dishes' : 'Tiếp Theo: Chọn Món Đặt Trước' }}
                <i class="fa-solid fa-arrow-right ms-2"></i>
              </button>
            </div>
          </div>

          <!-- STEP 3: PRE-ORDER DISHES (2-COLUMN INTERACTIVE DRAG & DROP) -->
          <div v-else-if="currentStep === 3" class="wizard-panel">
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <div>
                <h4 class="fw-bold text-danger brand-font mb-0 d-flex align-items-center gap-2">
                  <i class="fa-solid fa-utensils"></i>
                  {{ langStore.isEnglish ? 'Step 3: Select Pre-order Dishes' : 'Bước 3: Chọn Món Ăn Đặt Trước (Pre-order)' }}
                </h4>
                <small class="text-muted">Kéo món từ menu thả vào bàn hoặc nhấp dấu (+) để chọn món</small>
              </div>
              <span class="badge bg-warning text-dark px-3 py-1.5 rounded-pill small fw-bold shadow-sm">
                <i class="fa-solid fa-shield-halved me-1"></i> {{ langStore.isEnglish ? 'Deposit: 50% dish value' : 'Chống Boom Hàng: Cọc 50% tiền món' }}
              </span>
            </div>

            <!-- 2-COLUMN FULL-WIDTH LAYOUT (NO SCROLLING NEEDED) -->
            <div class="row g-4 mb-4">
              <!-- LEFT COLUMN: MENU CATALOG -->
              <div class="col-lg-6">
                <div class="glass-card p-3 rounded-4 border bg-white h-100 shadow-sm">
                  <!-- Search & Filter Bar -->
                  <div class="mb-3">
                    <div class="input-group input-group-sm mb-2">
                      <span class="input-group-text bg-light border-end-0"><i class="fa-solid fa-magnifying-glass text-muted"></i></span>
                      <input
                        v-model="dishSearchQuery"
                        type="text"
                        class="form-control border-start-0 bg-light"
                        :placeholder="langStore.isEnglish ? 'Search dishes...' : 'Tìm tên món ăn...'"
                      />
                    </div>

                    <!-- Category Pills -->
                    <div class="d-flex gap-1 overflow-x-auto pb-1">
                      <button
                        type="button"
                        @click="selectedCategoryId = 'ALL'"
                        :class="['btn btn-sm rounded-pill px-2.5 py-1 fs-8 fw-semibold flex-shrink-0', selectedCategoryId === 'ALL' ? 'btn-danger' : 'btn-light']"
                      >
                        {{ langStore.isEnglish ? 'All' : 'Tất Cả' }}
                      </button>
                      <button
                        v-for="cat in menuStore.categories"
                        :key="cat._id"
                        type="button"
                        @click="selectedCategoryId = cat._id"
                        :class="['btn btn-sm rounded-pill px-2.5 py-1 fs-8 fw-semibold flex-shrink-0', selectedCategoryId === cat._id ? 'btn-danger' : 'btn-light']"
                      >
                        {{ cat.name }}
                      </button>
                    </div>
                  </div>

                  <!-- Dishes Scroll Grid -->
                  <div class="dish-scroll-container space-y-2 pe-1">
                    <div
                      v-for="dish in filteredDishes"
                      :key="dish._id"
                      draggable="true"
                      @dragstart="handleDragStart($event, dish)"
                      class="dish-draggable-card p-2.5 rounded-3 border bg-light d-flex align-items-center justify-content-between gap-2 transition-all hover-shadow"
                    >
                      <div class="d-flex align-items-center gap-2.5 min-w-0">
                        <img
                          v-if="dish.image"
                          :src="getImageUrl(dish.image)"
                          :alt="dish.name"
                          class="rounded-3 object-fit-cover flex-shrink-0"
                          style="width: 44px; height: 44px;"
                        />
                        <div v-else class="p-2 bg-danger bg-opacity-10 text-danger rounded-3 text-center flex-shrink-0" style="width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
                          <i class="fa-solid fa-utensils fs-6"></i>
                        </div>

                        <div class="min-w-0">
                          <strong class="text-dark fs-7 d-block text-truncate">{{ dish.name }}</strong>
                          <div class="d-flex align-items-center gap-2">
                            <small class="text-danger fw-bold fs-8">{{ dish.price.toLocaleString('vi-VN') }}đ</small>
                            <span v-if="dish.region" class="badge bg-secondary bg-opacity-15 text-dark fs-9 px-1.5 py-0.5">
                              {{ dish.region }}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div class="d-flex align-items-center gap-1 flex-shrink-0">
                        <small class="text-muted fs-9 d-none d-sm-inline opacity-75">
                          <i class="fa-solid fa-hand-pointer me-1"></i>Kéo
                        </small>
                        <button
                          type="button"
                          @click="updatePreOrderQuantity(dish._id, 1)"
                          class="btn btn-danger btn-sm rounded-circle p-1 d-flex align-items-center justify-content-center shadow-sm"
                          style="width: 30px; height: 30px;"
                          title="Thêm vào bàn"
                        >
                          <i class="fa-solid fa-plus fs-8"></i>
                        </button>
                      </div>
                    </div>

                    <div v-if="filteredDishes.length === 0" class="text-center py-4 text-muted small">
                      Không tìm thấy món ăn phù hợp
                    </div>
                  </div>
                </div>
              </div>

              <!-- RIGHT COLUMN: DINING TABLE DROPZONE -->
              <div class="col-lg-6">
                <div
                  @dragover.prevent="isDraggingOver = true"
                  @dragleave="isDraggingOver = false"
                  @drop="handleDrop"
                  :class="[
                    'glass-card p-3 p-md-4 rounded-4 border-2 h-100 d-flex flex-column justify-content-between transition-all bg-white shadow-sm',
                    isDraggingOver ? 'border-danger bg-danger bg-opacity-5 shadow-lg scale-102' : 'border-danger border-dashed'
                  ]"
                >
                  <div>
                    <!-- Dropzone Header -->
                    <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                      <h6 class="fw-bold brand-font text-danger mb-0 d-flex align-items-center gap-2">
                        <i class="fa-solid fa-receipt"></i>
                        {{ langStore.isEnglish ? 'Pre-order Bill Preview' : 'Vùng Bàn Ăn — Hóa Đơn Đặt Trước' }}
                      </h6>
                      <span class="badge bg-danger rounded-pill fs-8 fw-bold">
                        {{ selectedDishesCount }} {{ langStore.isEnglish ? 'dishes' : 'món' }}
                      </span>
                    </div>

                    <!-- Selected Dishes List or Empty Placeholder -->
                    <div v-if="selectedDishesList.length === 0" class="dropzone-empty-box text-center py-5 rounded-4 bg-light border border-dashed my-2">
                      <div class="p-3 bg-danger bg-opacity-10 text-danger rounded-circle d-inline-flex mb-2">
                        <i class="fa-solid fa-cloud-arrow-down fs-3"></i>
                      </div>
                      <h6 class="fw-bold text-dark mb-1 fs-7">Bàn Ăn Còn Trống Món</h6>
                      <p class="text-muted fs-8 mb-0 px-3">
                        Kéo món từ menu bên trái thả vào đây<br />hoặc nhấp dấu <strong>(+)</strong> để thêm vào hóa đơn
                      </p>
                    </div>

                    <div v-else class="selected-dishes-scroll space-y-2 pe-1 mb-3">
                      <div
                        v-for="item in selectedDishesList"
                        :key="item.dish._id"
                        class="p-2.5 rounded-3 border bg-white d-flex align-items-center justify-content-between gap-2 shadow-2xs"
                      >
                        <div class="d-flex align-items-center gap-2 min-w-0">
                          <img
                            v-if="item.dish.image"
                            :src="getImageUrl(item.dish.image)"
                            :alt="item.dish.name"
                            class="rounded-2 object-fit-cover flex-shrink-0"
                            style="width: 38px; height: 38px;"
                          />
                          <div class="min-w-0">
                            <strong class="text-dark fs-7 d-block text-truncate">{{ item.dish.name }}</strong>
                            <small class="text-danger fw-bold fs-8">{{ (item.dish.price * item.quantity).toLocaleString('vi-VN') }}đ</small>
                          </div>
                        </div>

                        <!-- Quantity Modifier & Delete -->
                        <div class="d-flex align-items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            @click="updatePreOrderQuantity(item.dish._id, -1)"
                            class="btn btn-outline-secondary btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
                            style="width: 26px; height: 26px;"
                          >
                            <i class="fa-solid fa-minus fs-9"></i>
                          </button>
                          <span class="fw-bold px-1 fs-7 text-dark">{{ item.quantity }}</span>
                          <button
                            type="button"
                            @click="updatePreOrderQuantity(item.dish._id, 1)"
                            class="btn btn-outline-danger btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
                            style="width: 26px; height: 26px;"
                          >
                            <i class="fa-solid fa-plus fs-9"></i>
                          </button>
                          <button
                            type="button"
                            @click="removePreOrderDish(item.dish._id)"
                            class="btn btn-light btn-sm text-danger rounded-circle p-0 ms-1 d-flex align-items-center justify-content-center"
                            style="width: 26px; height: 26px;"
                            title="Xóa món"
                          >
                            <i class="fa-solid fa-trash-can fs-9"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Calculation Summary Box -->
                  <div class="p-3 bg-danger bg-opacity-10 rounded-4 border border-danger border-opacity-25 mt-3">
                    <div class="d-flex justify-content-between fs-8 mb-1 text-dark">
                      <span>{{ langStore.isEnglish ? 'Pre-order dishes total:' : 'Tổng tiền món đặt trước:' }}</span>
                      <strong>{{ preOrderTotal.toLocaleString('vi-VN') }}đ</strong>
                    </div>
                    <div class="d-flex justify-content-between fs-8 mb-1 text-dark">
                      <span>{{ langStore.isEnglish ? 'Dish deposit (50%):' : 'Tiền cọc món ăn (50%):' }}</span>
                      <strong>{{ (preOrderTotal * 0.5).toLocaleString('vi-VN') }}đ</strong>
                    </div>
                    <div class="d-flex justify-content-between fs-8 mb-1 text-dark">
                      <span>{{ langStore.isEnglish ? 'Base table deposit:' : 'Tiền cọc giữ bàn (mặc định):' }}</span>
                      <strong>{{ (form.guestsCount >= 4 || preOrderTotal > 0 ? 100000 : 0).toLocaleString('vi-VN') }}đ</strong>
                    </div>
                    <hr class="my-2" />
                    <div class="d-flex justify-content-between text-danger fw-bold fs-7">
                      <span>{{ langStore.isEnglish ? 'TOTAL DEPOSIT (VIETQR):' : 'TỔNG CỌC CẦN THANH TOÁN:' }}</span>
                      <span class="fs-6">{{ estimatedDeposit.toLocaleString('vi-VN') }}đ</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Navigation Actions -->
            <div class="d-flex justify-content-between align-items-center pt-3 border-top">
              <button type="button" @click="currentStep = 2" class="btn btn-outline-secondary rounded-pill px-4 fw-bold">
                <i class="fa-solid fa-arrow-left me-2"></i> {{ langStore.isEnglish ? 'Back' : 'Quay Lại' }}
              </button>

              <div class="d-flex gap-2">
                <button v-if="selectedDishesCount === 0" type="button" @click="currentStep = 4" class="btn btn-outline-danger rounded-pill px-4 fw-semibold">
                  {{ langStore.isEnglish ? 'Skip Dish Pre-order' : 'Bỏ Qua Chọn Món & Tiếp Tục' }}
                </button>
                <button type="button" @click="currentStep = 4" class="btn btn-danger btn-lg rounded-pill px-5 fw-bold shadow-sm">
                  {{ langStore.isEnglish ? 'Next: Review & Confirm' : 'Tiếp Theo: Ghi Chú & Xác Nhận' }}
                  <i class="fa-solid fa-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- STEP 4: NOTES & FINAL CONFIRMATION -->
          <div v-else-if="currentStep === 4" class="wizard-panel">
            <h4 class="fw-bold text-danger brand-font mb-4 d-flex align-items-center gap-2">
              <i class="fa-solid fa-clipboard-check"></i>
              {{ langStore.isEnglish ? 'Step 4: Special Notes & Confirmation' : 'Bước 4: Ghi Chú & Hoàn Tất Đặt Bàn' }}
            </h4>

            <!-- Booking Summary Review Card -->
            <div class="p-4 bg-light rounded-4 border mb-4">
              <h6 class="fw-bold brand-font text-dark mb-3">
                <i class="fa-solid fa-list-check me-2 text-danger"></i>
                {{ langStore.isEnglish ? 'Booking Summary Review' : 'Tóm Tắt Đơn Đặt Bàn' }}
              </h6>

              <div class="row g-3 small mb-3">
                <div class="col-md-6">
                  <span class="text-muted d-block">{{ langStore.isEnglish ? 'Customer:' : 'Người đặt:' }}</span>
                  <strong class="text-dark fs-7">{{ form.customerName }} ({{ form.customerPhone }})</strong>
                </div>
                <div class="col-md-6">
                  <span class="text-muted d-block">{{ langStore.isEnglish ? 'Arrival time:' : 'Thời gian đến:' }}</span>
                  <strong class="text-dark fs-7">{{ form.startAt ? new Date(form.startAt).toLocaleString('vi-VN') : 'Chưa chọn' }}</strong>
                </div>
                <div class="col-md-6">
                  <span class="text-muted d-block">{{ langStore.isEnglish ? 'Selected Table:' : 'Bàn chọn:' }}</span>
                  <strong v-if="isCustomTable" class="text-warning fs-7">Bàn tùy chỉnh cho {{ form.guestsCount }} người (Tự động ghép)</strong>
                  <strong v-else-if="selectedTableId" class="text-success fs-7">Bàn {{ getSelectedTableObj?.tableNumber }} ({{ getSelectedTableObj?.capacity }} chỗ)</strong>
                  <strong v-else class="text-dark fs-7">{{ form.guestsCount }} người</strong>
                </div>
                <div class="col-md-6">
                  <span class="text-muted d-block">{{ langStore.isEnglish ? 'Pre-order dishes:' : 'Món đặt trước:' }}</span>
                  <strong class="text-dark fs-7">{{ selectedDishesCount }} món</strong>
                </div>
              </div>

              <!-- List of pre-order dishes preview -->
              <div v-if="selectedDishesList.length > 0" class="pt-2 border-top">
                <small class="fw-bold text-dark d-block mb-1">Món ăn đã chọn:</small>
                <ul class="list-unstyled mb-0 small text-secondary">
                  <li v-for="item in selectedDishesList" :key="item.dish._id" class="d-flex justify-content-between py-0.5">
                    <span>• {{ item.dish.name }} x{{ item.quantity }}</span>
                    <strong class="text-dark">{{ (item.dish.price * item.quantity).toLocaleString('vi-VN') }}đ</strong>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Total Deposit Required Banner -->
            <div class="p-3 bg-danger text-white rounded-4 shadow-sm mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <small class="d-block text-white-50 fs-8">{{ langStore.isEnglish ? 'REQUIRED VIETQR DEPOSIT:' : 'TỔNG TIỀN CỌC CẦN THANH TOÁN QUA VIETQR:' }}</small>
                <strong class="fs-4 brand-font">{{ estimatedDeposit.toLocaleString('vi-VN') }}đ</strong>
              </div>
              <span class="badge bg-white text-danger px-3 py-2 rounded-pill fw-bold fs-8">
                <i class="fa-solid fa-qrcode me-1"></i> VietQR Auto Gen
              </span>
            </div>

            <!-- Special Notes Input -->
            <div class="mb-4">
              <label class="form-label fw-semibold fs-7 text-dark">{{ langStore.t('reservation.step4') }}</label>
              <textarea
                v-model="form.notes"
                class="form-control rounded-3 p-3 fs-7"
                rows="3"
                :placeholder="langStore.isEnglish ? 'e.g. Need window table, baby chair, birthday celebration...' : 'Ví dụ: Cần bàn gần cửa sổ, có ghế trẻ em, tiệc sinh nhật...'"
              ></textarea>
            </div>

            <div v-if="errorMsg" class="alert alert-danger mb-4 p-3 rounded-3 small d-flex align-items-center gap-2">
              <i class="fa-solid fa-circle-exclamation fs-5"></i>
              <div>{{ errorMsg }}</div>
            </div>

            <!-- Navigation Actions -->
            <div class="d-flex justify-content-between align-items-center pt-3 border-top">
              <button type="button" @click="currentStep = 3" class="btn btn-outline-secondary rounded-pill px-4 fw-bold">
                <i class="fa-solid fa-arrow-left me-2"></i> {{ langStore.isEnglish ? 'Back to Dishes' : 'Quay Lại Sửa Món' }}
              </button>
              <button
                type="button"
                @click="handleSubmit"
                :disabled="reservationStore.loading"
                class="btn btn-primary-crab btn-lg px-5 py-3 rounded-pill fw-bold shadow-lg"
              >
                <span v-if="reservationStore.loading" class="spinner-border spinner-border-sm me-2"></span>
                <span v-else><i class="fa-solid fa-paper-plane me-2"></i> {{ langStore.isEnglish ? 'Confirm & Get VietQR Deposit Code' : 'XÁC NHẬN ĐẶT BÀN & NHẬN MÃ VIETQR' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useReservationStore } from "../../stores/reservationStore";
import { useAuthStore } from "../../stores/authStore";
import { useMenuStore } from "../../stores/menuStore";
import { useTableStore } from "../../stores/tableStore";
import { useLangStore } from "../../stores/langStore";
import { toast } from "../../composables/useToast";
import { getImageUrl } from "../../utils/imageHelper";

const router = useRouter();
const reservationStore = useReservationStore();
const authStore = useAuthStore();
const menuStore = useMenuStore();
const tableStore = useTableStore();
const langStore = useLangStore();

const currentStep = ref(1);
const stepError = ref("");
const errorMsg = ref("");
const successData = ref(null);
const preOrderDishesMap = reactive({});

const selectedAreaId = ref("ALL");
const selectedTableId = ref(null);
const isCustomTable = ref(false);

const dishSearchQuery = ref("");
const selectedCategoryId = ref("ALL");
const isDraggingOver = ref(false);

const form = reactive({
  customerName: authStore.user?.name || "",
  customerPhone: authStore.user?.phone || "",
  customerEmail: authStore.user?.email || "",
  guestsCount: 4,
  startAt: "",
  notes: "",
});

onMounted(async () => {
  const nextHour = new Date();
  nextHour.setDate(nextHour.getDate() + 1);
  nextHour.setHours(19, 0, 0, 0);
  form.startAt = nextHour.toISOString().slice(0, 16);

  await Promise.all([
    menuStore.fetchCategories(),
    menuStore.fetchDishes(),
    tableStore.fetchAreas(),
    tableStore.fetchTables(),
  ]);

  const firstAvailable = tableStore.tables.find((t) => t.status === "AVAILABLE");
  if (firstAvailable) {
    selectTable(firstAvailable);
  }
});

/* ── Wizard Step Navigation & Validation ── */
const goToStep = (step) => {
  if (step === 2 && !validateStep1()) return;
  if (step === 3 && (!validateStep1() || !validateStep2())) return;
  if (step === 4 && (!validateStep1() || !validateStep2())) return;
  stepError.value = "";
  currentStep.value = step;
};

const validateStep1 = () => {
  stepError.value = "";
  if (!form.customerName.trim() || !form.customerPhone.trim()) {
    stepError.value = "Vui lòng nhập đầy đủ Họ tên và Số điện thoại liên hệ!";
    return false;
  }
  return true;
};

const validateStep2 = () => {
  stepError.value = "";
  if (!form.startAt) {
    stepError.value = "Vui lòng chọn thời gian đến ăn!";
    return false;
  }
  if (!selectedTableId.value && !isCustomTable.value) {
    stepError.value = "Vui lòng chọn 1 bàn trống trên sơ đồ hoặc chọn 'Bàn Tùy Chỉnh'!";
    return false;
  }
  return true;
};

const validateAndNext = (fromStep) => {
  if (fromStep === 1) {
    if (validateStep1()) {
      currentStep.value = 2;
    }
  } else if (fromStep === 2) {
    if (validateStep2()) {
      currentStep.value = 3;
    }
  }
};

/* ── Table Selection Helpers ── */
const filteredTables = computed(() => {
  if (selectedAreaId.value === "ALL") {
    return tableStore.tables;
  }
  return tableStore.tables.filter((t) => t.area === selectedAreaId.value || t.area?._id === selectedAreaId.value);
});

const getSelectedTableObj = computed(() => {
  if (!selectedTableId.value) return null;
  return tableStore.tables.find((t) => t._id === selectedTableId.value);
});

const selectTable = (table) => {
  if (table.status !== "AVAILABLE") return;
  selectedTableId.value = table._id;
  isCustomTable.value = false;
  form.guestsCount = table.capacity || 4;
};

const selectCustomTable = () => {
  isCustomTable.value = true;
  selectedTableId.value = null;
  if (form.guestsCount < 10) form.guestsCount = 12;
};

/* ── Dishes Drag & Drop / Selection Helpers ── */
const filteredDishes = computed(() => {
  let result = menuStore.dishes || [];
  if (selectedCategoryId.value !== "ALL") {
    result = result.filter((d) => d.category === selectedCategoryId.value || d.category?._id === selectedCategoryId.value);
  }
  if (dishSearchQuery.value.trim()) {
    const q = dishSearchQuery.value.trim().toLowerCase();
    result = result.filter((d) => d.name.toLowerCase().includes(q));
  }
  return result;
});

const handleDragStart = (evt, dish) => {
  evt.dataTransfer.setData("text/plain", dish._id);
  evt.dataTransfer.effectAllowed = "copy";
};

const handleDrop = (evt) => {
  isDraggingOver.value = false;
  const dishId = evt.dataTransfer.getData("text/plain");
  if (dishId) {
    updatePreOrderQuantity(dishId, 1);
  }
};

const updatePreOrderQuantity = (dishId, delta) => {
  const current = preOrderDishesMap[dishId] || 0;
  const next = Math.max(0, current + delta);
  if (next === 0) {
    delete preOrderDishesMap[dishId];
  } else {
    preOrderDishesMap[dishId] = next;
  }
};

const removePreOrderDish = (dishId) => {
  delete preOrderDishesMap[dishId];
};

const selectedDishesList = computed(() => {
  const list = [];
  for (const [dishId, qty] of Object.entries(preOrderDishesMap)) {
    const dish = menuStore.dishes.find((d) => d._id === dishId);
    if (dish && qty > 0) {
      list.push({ dish, quantity: qty });
    }
  }
  return list;
});

const selectedDishesCount = computed(() => {
  return selectedDishesList.value.reduce((sum, item) => sum + item.quantity, 0);
});

const preOrderTotal = computed(() => {
  let sum = 0;
  for (const item of selectedDishesList.value) {
    sum += item.dish.price * item.quantity;
  }
  return sum;
});

const estimatedDeposit = computed(() => {
  const dishDeposit = Math.round(preOrderTotal.value * 0.5);
  const baseDeposit = form.guestsCount >= 4 || preOrderTotal.value > 0 ? 100000 : 0;
  return dishDeposit + baseDeposit;
});

const handleSubmit = async () => {
  errorMsg.value = "";
  try {
    const preOrderDishes = Object.entries(preOrderDishesMap).map(([dish, quantity]) => ({
      dish,
      quantity,
    }));

    const payload = {
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      customerEmail: form.customerEmail,
      guestsCount: form.guestsCount,
      startAt: new Date(form.startAt).toISOString(),
      preOrderDishes,
      notes: form.notes,
    };

    if (selectedTableId.value) {
      payload.tableId = selectedTableId.value;
    }

    const res = await reservationStore.createReservation(payload);
    successData.value = res;
  } catch (err) {
    errorMsg.value = err.message;
  }
};

const handleDemoDepositSuccess = async () => {
  if (!successData.value?.data?.reservation?._id) return;
  try {
    const res = await reservationStore.demoConfirmDeposit(successData.value.data.reservation._id);
    if (successData.value.deposit) {
      successData.value.deposit.status = "PAID";
    }
    toast.success("Thanh toán cọc thành công! Đang tự động quay về trang chủ...");
    setTimeout(() => {
      router.push("/");
    }, 1500);
  } catch (err) {
    toast.error(err.message || "Không thể nộp cọc!");
  }
};

const resetForm = () => {
  successData.value = null;
  currentStep.value = 1;
  form.notes = "";
  Object.keys(preOrderDishesMap).forEach((k) => delete preOrderDishesMap[k]);
};
</script>

<style scoped>
.min-vh-card {
  min-height: 480px;
}
.wizard-header-steps {
  background: #ffffff;
  padding: 1rem 1.5rem;
  border-radius: 100px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.wizard-step-node {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.5;
  transition: all 0.3s ease;
}
.wizard-step-node.active,
.wizard-step-node.completed {
  opacity: 1;
}
.wizard-step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}
.wizard-step-node.active .wizard-step-circle {
  background: #d32f2f;
  color: #ffffff;
  box-shadow: 0 0 0 4px rgba(211, 47, 47, 0.2);
}
.wizard-step-node.completed .wizard-step-circle {
  background: #16a34a;
  color: #ffffff;
}
.wizard-step-label {
  font-size: 0.82rem;
  color: #1e293b;
}
.wizard-step-line {
  height: 3px;
  background: #e2e8f0;
  border-radius: 2px;
  transition: all 0.3s ease;
}
.wizard-step-line.active-line {
  background: #d32f2f;
}
.dish-scroll-container {
  max-height: 380px;
  overflow-y: auto;
}
.selected-dishes-scroll {
  max-height: 260px;
  overflow-y: auto;
}
.dish-draggable-card {
  cursor: grab;
}
.dish-draggable-card:active {
  cursor: grabbing;
}
.border-dashed {
  border-style: dashed !important;
}
.scale-102 {
  transform: scale(1.02);
}
.transition-all {
  transition: all 0.2s ease-in-out;
}
.hover-shadow:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.fs-9 {
  font-size: 0.72rem;
}
</style>
