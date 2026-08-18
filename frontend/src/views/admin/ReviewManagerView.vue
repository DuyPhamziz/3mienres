<template>
  <div class="review-manager-view">
    <!-- ═══ 1. HEADER ═══ -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h4 class="fw-bold brand-font text-dark mb-1">
          <i class="fa-solid fa-star-half-stroke text-danger me-2"></i>Quản Lý Đánh Giá & Hộp Thư Góp Ý
        </h4>
        <p class="text-secondary small mb-0">
          Theo dõi cảm nhận thực khách về món ăn, phản hồi trực tiếp và xử lý các ý kiến đóng góp nâng cao dịch vụ.
        </p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <button @click="refreshData" class="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-semibold">
          <i class="fa-solid fa-rotate me-1" :class="{ 'fa-spin': reviewStore.loading }"></i> Làm mới
        </button>
      </div>
    </div>

    <!-- ═══ 2. KPI SUMMARY CARDS ═══ -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3">
        <div class="card border-0 rounded-4 shadow-2xs p-3 bg-white h-100 border-start border-4 border-warning">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="text-muted fs-8 d-block mb-1">Điểm Đánh Giá Món</span>
              <h3 class="fw-bold text-dark mb-0">{{ stats.avgRating || '5.0' }} <span class="fs-6 text-warning">★</span></h3>
            </div>
            <div class="p-2.5 rounded-circle bg-warning bg-opacity-15 text-warning">
              <i class="fa-solid fa-star fs-5"></i>
            </div>
          </div>
          <small class="text-muted fs-9 mt-2 d-block">Trên {{ stats.totalReviews || 0 }} lượt đánh giá</small>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="card border-0 rounded-4 shadow-2xs p-3 bg-white h-100 border-start border-4 border-danger">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="text-muted fs-8 d-block mb-1">Tổng Lượt Đánh Giá</span>
              <h3 class="fw-bold text-danger mb-0">{{ stats.totalReviews || 0 }}</h3>
            </div>
            <div class="p-2.5 rounded-circle bg-danger bg-opacity-15 text-danger">
              <i class="fa-solid fa-utensils fs-5"></i>
            </div>
          </div>
          <small class="text-muted fs-9 mt-2 d-block">{{ stats.visibleCount || 0 }} hiển thị · {{ stats.hiddenCount || 0 }} đã ẩn</small>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="card border-0 rounded-4 shadow-2xs p-3 bg-white h-100 border-start border-4 border-info">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="text-muted fs-8 d-block mb-1">Góp Ý Mới Cần Xử Lý</span>
              <h3 class="fw-bold text-info mb-0">{{ feedbackStats.pending || 0 }}</h3>
            </div>
            <div class="p-2.5 rounded-circle bg-info bg-opacity-15 text-info">
              <i class="fa-solid fa-envelope-open-text fs-5"></i>
            </div>
          </div>
          <small class="text-muted fs-9 mt-2 d-block">Khách gửi phản hồi dịch vụ</small>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="card border-0 rounded-4 shadow-2xs p-3 bg-white h-100 border-start border-4 border-success">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="text-muted fs-8 d-block mb-1">Góp Ý Đã Giải Quyết</span>
              <h3 class="fw-bold text-success mb-0">{{ feedbackStats.resolved || 0 }}</h3>
            </div>
            <div class="p-2.5 rounded-circle bg-success bg-opacity-15 text-success">
              <i class="fa-solid fa-circle-check fs-5"></i>
            </div>
          </div>
          <small class="text-muted fs-9 mt-2 d-block">Đã tiếp nhận & hoàn tất</small>
        </div>
      </div>
    </div>

    <!-- ═══ 3. TAB SWITCHER ═══ -->
    <div class="d-flex gap-2 border-bottom pb-3 mb-4">
      <button
        @click="activeTab = 'reviews'"
        :class="['btn rounded-pill px-4 fw-bold fs-7', activeTab === 'reviews' ? 'btn-danger shadow-sm' : 'btn-light']"
      >
        <i class="fa-solid fa-utensils me-1.5"></i>Đánh Giá Món Ăn
        <span class="badge bg-white text-danger ms-1.5 rounded-pill">{{ stats.totalReviews || 0 }}</span>
      </button>

      <button
        @click="activeTab = 'feedbacks'"
        :class="['btn rounded-pill px-4 fw-bold fs-7', activeTab === 'feedbacks' ? 'btn-danger shadow-sm' : 'btn-light']"
      >
        <i class="fa-solid fa-comments me-1.5"></i>Hộp Thư Góp Ý Dịch Vụ
        <span v-if="feedbackStats.pending > 0" class="badge bg-warning text-dark ms-1.5 rounded-pill">
          {{ feedbackStats.pending }} mới
        </span>
      </button>
    </div>

    <!-- ═══ TAB 1: ĐÁNH GIÁ MÓN ĂN (REVIEWS) ═══ -->
    <div v-if="activeTab === 'reviews'">
      <!-- Filter Bar -->
      <div class="card border-0 rounded-4 shadow-2xs p-3 bg-white mb-3">
        <div class="row g-2 align-items-center">
          <div class="col-md-3">
            <select v-model="reviewFilter.rating" @change="loadReviews(1)" class="form-select form-select-sm rounded-3">
              <option value="">-- Tất cả số sao --</option>
              <option value="5">5 Sao (Xuất sắc)</option>
              <option value="4">4 Sao (Tốt)</option>
              <option value="3">3 Sao (Bình thường)</option>
              <option value="2">2 Sao (Chưa hài lòng)</option>
              <option value="1">1 Sao (Kém)</option>
            </select>
          </div>

          <div class="col-md-3">
            <select v-model="reviewFilter.status" @change="loadReviews(1)" class="form-select form-select-sm rounded-3">
              <option value="">-- Tất cả trạng thái --</option>
              <option value="VISIBLE">Đang hiển thị</option>
              <option value="HIDDEN">Đã ẩn (Spam)</option>
            </select>
          </div>

          <div class="col-md-6 text-md-end">
            <span class="text-muted small">
              Hiển thị <strong>{{ reviewStore.allReviews.length }}</strong> / <strong>{{ reviewStore.reviewMeta.total }}</strong> đánh giá
            </span>
          </div>
        </div>
      </div>

      <!-- Reviews Table -->
      <div class="card border-0 rounded-4 shadow-2xs bg-white overflow-hidden mb-3">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0" style="font-size: 0.82rem;">
            <thead class="bg-light text-secondary">
              <tr>
                <th style="width: 180px;">Khách Hàng</th>
                <th style="width: 200px;">Món Ăn</th>
                <th style="width: 110px;" class="text-center">Số Sao</th>
                <th>Nội Dung Đánh Giá & Phản Hồi</th>
                <th style="width: 110px;" class="text-center">Trạng Thái</th>
                <th style="width: 140px;" class="text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in reviewStore.allReviews" :key="r._id">
                <td>
                  <strong class="text-dark d-block">{{ r.user?.name || 'Khách Vãng Lai' }}</strong>
                  <small class="text-muted fs-9">{{ r.user?.phone || r.user?.email || 'N/A' }}</small>
                  <small class="text-muted fs-9 d-block mt-0.5">
                    {{ new Date(r.createdAt).toLocaleDateString('vi-VN') }}
                  </small>
                </td>

                <td>
                  <div class="d-flex align-items-center gap-2">
                    <img
                      :src="getImageUrl(r.dish?.image)"
                      :alt="r.dish?.name"
                      class="rounded-3 object-fit-cover flex-shrink-0"
                      style="width: 38px; height: 38px;"
                      onerror="this.src='/images/dishes/default-dish.jpg'"
                    />
                    <div class="min-w-0">
                      <strong class="text-dark text-truncate d-block">{{ r.dish?.name || 'Món ăn' }}</strong>
                      <span class="text-danger fs-9 fw-semibold">{{ r.dish?.price?.toLocaleString('vi-VN') }}đ</span>
                    </div>
                  </div>
                </td>

                <td class="text-center">
                  <span class="badge bg-warning bg-opacity-20 text-dark rounded-pill px-2.5 py-1 fw-bold">
                    {{ r.rating }} <i class="fa-solid fa-star text-warning fs-9"></i>
                  </span>
                </td>

                <td>
                  <p class="text-dark mb-1 leading-relaxed">"{{ r.comment }}"</p>
                  <!-- Admin Reply Box (if any) -->
                  <div v-if="r.reply?.comment" class="p-2 rounded-3 bg-light border-start border-3 border-danger small">
                    <div class="d-flex align-items-center gap-1.5 mb-0.5 text-danger fw-bold fs-9">
                      <i class="fa-solid fa-reply"></i>
                      <span>Phản hồi từ Nhà Hàng:</span>
                      <span class="text-muted fw-normal" v-if="r.reply.repliedAt">
                        ({{ new Date(r.reply.repliedAt).toLocaleDateString('vi-VN') }})
                      </span>
                    </div>
                    <span class="text-secondary fst-italic">{{ r.reply.comment }}</span>
                  </div>
                </td>

                <td class="text-center">
                  <span
                    :class="[
                      'badge rounded-pill px-2.5 py-1 fs-9 fw-bold',
                      r.status === 'VISIBLE' ? 'bg-success bg-opacity-15 text-success' : 'bg-secondary bg-opacity-15 text-secondary'
                    ]"
                  >
                    {{ r.status === 'VISIBLE' ? 'Hiển thị' : 'Đã ẩn' }}
                  </span>
                </td>

                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <button
                      @click="openReplyModal(r)"
                      class="btn btn-outline-danger btn-sm rounded-pill px-2 py-1 me-1"
                      title="Phản hồi đánh giá"
                    >
                      <i class="fa-solid fa-reply me-1"></i>{{ r.reply?.comment ? 'Sửa PH' : 'Phản Hồi' }}
                    </button>
                    <button
                      @click="handleToggleStatus(r)"
                      class="btn btn-light btn-sm rounded-circle me-1"
                      :title="r.status === 'VISIBLE' ? 'Ẩn đánh giá' : 'Hiện đánh giá'"
                    >
                      <i :class="r.status === 'VISIBLE' ? 'fa-solid fa-eye-slash text-secondary' : 'fa-solid fa-eye text-success'"></i>
                    </button>
                    <button
                      @click="confirmDeleteReview(r)"
                      class="btn btn-light btn-sm rounded-circle text-danger"
                      title="Xóa đánh giá"
                    >
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="reviewStore.allReviews.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="fa-regular fa-comment-dots fs-1 opacity-40 mb-2 d-block"></i>
                  Chưa có đánh giá món ăn nào phù hợp với bộ lọc.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="reviewStore.reviewMeta.totalPages > 1" class="d-flex justify-content-between align-items-center p-3 border-top">
          <small class="text-muted">Trang {{ reviewStore.reviewMeta.page }} / {{ reviewStore.reviewMeta.totalPages }}</small>
          <div class="d-flex gap-1">
            <button
              @click="loadReviews(reviewStore.reviewMeta.page - 1)"
              :disabled="reviewStore.reviewMeta.page <= 1"
              class="btn btn-sm btn-light rounded-pill px-3"
            >
              Trước
            </button>
            <button
              @click="loadReviews(reviewStore.reviewMeta.page + 1)"
              :disabled="reviewStore.reviewMeta.page >= reviewStore.reviewMeta.totalPages"
              class="btn btn-sm btn-light rounded-pill px-3"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ TAB 2: HỘP THƯ GÓP Ý DỊCH VỤ (FEEDBACKS) ═══ -->
    <div v-if="activeTab === 'feedbacks'">
      <!-- Filter Bar -->
      <div class="card border-0 rounded-4 shadow-2xs p-3 bg-white mb-3">
        <div class="row g-2 align-items-center">
          <div class="col-md-3">
            <select v-model="feedbackFilter.status" @change="loadFeedbacks(1)" class="form-select form-select-sm rounded-3">
              <option value="">-- Tất cả trạng thái --</option>
              <option value="PENDING">Mới nhận (Chờ xem)</option>
              <option value="REVIEWED">Đã tiếp nhận</option>
              <option value="RESOLVED">Đã xử lý xong</option>
            </select>
          </div>

          <div class="col-md-3">
            <select v-model="feedbackFilter.category" @change="loadFeedbacks(1)" class="form-select form-select-sm rounded-3">
              <option value="">-- Tất cả chủ đề --</option>
              <option value="SERVICE">Phục vụ & Nhân viên</option>
              <option value="FOOD">Chất lượng món ăn</option>
              <option value="ATMOSPHERE">Không gian & Vệ sinh</option>
              <option value="PRICING">Giá cả & Khuyến mãi</option>
              <option value="OTHER">Góp ý khác</option>
            </select>
          </div>

          <div class="col-md-6 text-md-end">
            <span class="text-muted small">
              Hiển thị <strong>{{ reviewStore.allFeedbacks.length }}</strong> / <strong>{{ reviewStore.feedbackMeta.total }}</strong> góp ý
            </span>
          </div>
        </div>
      </div>

      <!-- Feedbacks Table -->
      <div class="card border-0 rounded-4 shadow-2xs bg-white overflow-hidden mb-3">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0" style="font-size: 0.82rem;">
            <thead class="bg-light text-secondary">
              <tr>
                <th style="width: 190px;">Khách Hàng & Liên Hệ</th>
                <th style="width: 140px;">Chủ Đề</th>
                <th style="width: 100px;" class="text-center">Đánh Giá</th>
                <th>Nội Dung Góp Ý & Ghi Chú Xử Lý</th>
                <th style="width: 130px;" class="text-center">Trạng Thái</th>
                <th style="width: 130px;" class="text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="fb in reviewStore.allFeedbacks" :key="fb._id">
                <td>
                  <strong class="text-dark d-block">{{ fb.name }}</strong>
                  <a :href="'tel:' + fb.phone" class="text-danger text-decoration-none fw-semibold fs-9 d-block">
                    <i class="fa-solid fa-phone me-1"></i>{{ fb.phone }}
                  </a>
                  <small class="text-muted fs-9 d-block">{{ fb.email || 'Không có email' }}</small>
                  <small class="text-muted fs-9 d-block mt-0.5">{{ new Date(fb.createdAt).toLocaleDateString('vi-VN') }}</small>
                </td>

                <td>
                  <span :class="['badge rounded-pill px-2.5 py-1 fs-9 fw-bold', categoryBadgeClass(fb.category)]">
                    {{ categoryLabel(fb.category) }}
                  </span>
                </td>

                <td class="text-center">
                  <span class="badge bg-warning bg-opacity-20 text-dark rounded-pill px-2 py-1 fw-bold">
                    {{ fb.rating }} <i class="fa-solid fa-star text-warning fs-9"></i>
                  </span>
                </td>

                <td>
                  <p class="text-dark mb-1 leading-relaxed">{{ fb.content }}</p>
                  <!-- Admin Note (if any) -->
                  <div v-if="fb.adminNote" class="p-2 rounded-3 bg-light border-start border-3 border-info small">
                    <div class="text-info fw-bold fs-9 mb-0.5">
                      <i class="fa-solid fa-clipboard-check me-1"></i>Ghi chú nội bộ:
                    </div>
                    <span class="text-secondary">{{ fb.adminNote }}</span>
                  </div>
                </td>

                <td class="text-center">
                  <span :class="['badge rounded-pill px-2.5 py-1 fs-9 fw-bold', feedbackStatusClass(fb.status)]">
                    {{ feedbackStatusLabel(fb.status) }}
                  </span>
                </td>

                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <button
                      @click="openProcessModal(fb)"
                      class="btn btn-outline-danger btn-sm rounded-pill px-2.5 py-1 me-1"
                      title="Xử lý góp ý"
                    >
                      <i class="fa-solid fa-pen-to-square me-1"></i>Xử Lý
                    </button>
                    <button
                      @click="confirmDeleteFeedback(fb)"
                      class="btn btn-light btn-sm rounded-circle text-danger"
                      title="Xóa góp ý"
                    >
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="reviewStore.allFeedbacks.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="fa-regular fa-envelope-open fs-1 opacity-40 mb-2 d-block"></i>
                  Hộp thư góp ý hiện đang trống.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="reviewStore.feedbackMeta.totalPages > 1" class="d-flex justify-content-between align-items-center p-3 border-top">
          <small class="text-muted">Trang {{ reviewStore.feedbackMeta.page }} / {{ reviewStore.feedbackMeta.totalPages }}</small>
          <div class="d-flex gap-1">
            <button
              @click="loadFeedbacks(reviewStore.feedbackMeta.page - 1)"
              :disabled="reviewStore.feedbackMeta.page <= 1"
              class="btn btn-sm btn-light rounded-pill px-3"
            >
              Trước
            </button>
            <button
              @click="loadFeedbacks(reviewStore.feedbackMeta.page + 1)"
              :disabled="reviewStore.feedbackMeta.page >= reviewStore.feedbackMeta.totalPages"
              class="btn btn-sm btn-light rounded-pill px-3"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL 1: PHẢN HỒI ĐÁNH GIÁ MÓN ĂN ═══ -->
    <div v-if="selectedReview" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 480px;">
        <div class="modal-content rounded-5 p-3 p-md-4 shadow-lg border-0">
          <div class="modal-header border-0 pb-1">
            <div>
              <h5 class="modal-title fw-bold brand-font text-danger mb-0">
                <i class="fa-solid fa-reply text-warning me-2"></i>Phản Hồi Đánh Giá Của Khách
              </h5>
              <small class="text-muted fs-8">Món: <strong>{{ selectedReview.dish?.name }}</strong> · Khách: {{ selectedReview.user?.name || 'Khách' }}</small>
            </div>
            <button @click="selectedReview = null" type="button" class="btn-close" :disabled="modalLoading"></button>
          </div>

          <div class="modal-body py-3">
            <!-- Review Content Box -->
            <div class="p-3 bg-light rounded-4 border mb-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="badge bg-warning text-dark rounded-pill fs-9 fw-bold">{{ selectedReview.rating }} ★</span>
                <small class="text-muted fs-9">{{ new Date(selectedReview.createdAt).toLocaleDateString('vi-VN') }}</small>
              </div>
              <p class="small text-secondary mb-0 leading-relaxed">"{{ selectedReview.comment }}"</p>
            </div>

            <!-- Reply Input -->
            <div class="mb-3">
              <label class="form-label fw-bold fs-7 text-dark mb-1">Nội dung phản hồi chính thức từ Nhà Hàng *</label>
              <textarea
                v-model="replyText"
                rows="4"
                class="form-control rounded-3 fs-7"
                placeholder="Ví dụ: Cảm ơn quý khách đã yêu thích món ăn! Nhà hàng 3 Miền Cua rất hân hạnh được phục vụ quý khách lần tới ạ..."
                required
              ></textarea>
            </div>
          </div>

          <div class="modal-footer border-0 pt-1">
            <button @click="selectedReview = null" class="btn btn-light rounded-pill px-4" :disabled="modalLoading">Hủy</button>
            <button
              @click="submitReply"
              class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm"
              :disabled="modalLoading || !replyText.trim()"
            >
              <span v-if="modalLoading" class="spinner-border spinner-border-sm me-1.5" role="status"></span>
              <i v-else class="fa-solid fa-paper-plane me-1.5"></i>
              Gửi Phản Hồi
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL 2: XỬ LÝ GÓP Ý & GHI CHÚ NỘI BỘ ═══ -->
    <div v-if="selectedFeedback" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 500px;">
        <div class="modal-content rounded-5 p-3 p-md-4 shadow-lg border-0">
          <div class="modal-header border-0 pb-1">
            <div>
              <h5 class="modal-title fw-bold brand-font text-danger mb-0">
                <i class="fa-solid fa-clipboard-check text-warning me-2"></i>Tiếp Nhận & Xử Lý Góp Ý
              </h5>
              <small class="text-muted fs-8">Khách: <strong>{{ selectedFeedback.name }}</strong> ({{ selectedFeedback.phone }})</small>
            </div>
            <button @click="selectedFeedback = null" type="button" class="btn-close" :disabled="modalLoading"></button>
          </div>

          <div class="modal-body py-3">
            <!-- Feedback Content Box -->
            <div class="p-3 bg-light rounded-4 border mb-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span :class="['badge rounded-pill px-2 py-0.5 fs-9 fw-bold', categoryBadgeClass(selectedFeedback.category)]">
                  {{ categoryLabel(selectedFeedback.category) }}
                </span>
                <span class="badge bg-warning text-dark rounded-pill fs-9 fw-bold">{{ selectedFeedback.rating }} ★</span>
              </div>
              <p class="small text-secondary mb-0 leading-relaxed">"{{ selectedFeedback.content }}"</p>
            </div>

            <!-- Select Status -->
            <div class="mb-3">
              <label class="form-label fw-bold fs-7 text-dark mb-1">Trạng thái xử lý *</label>
              <select v-model="processStatus" class="form-select rounded-3 fs-7">
                <option value="PENDING">Mới nhận (PENDING)</option>
                <option value="REVIEWED">Đã tiếp nhận (REVIEWED)</option>
                <option value="RESOLVED">Đã xử lý & gọi lại khách (RESOLVED)</option>
              </select>
            </div>

            <!-- Admin Note Input -->
            <div class="mb-3">
              <label class="form-label fw-bold fs-7 text-dark mb-1">Ghi chú nội bộ</label>
              <textarea
                v-model="processNote"
                rows="3"
                class="form-control rounded-3 fs-7"
                placeholder="Ví dụ: Đã gọi điện cảm ơn khách và tặng voucher 10% cho lần ghé thăm tiếp theo..."
              ></textarea>
            </div>
          </div>

          <div class="modal-footer border-0 pt-1">
            <button @click="selectedFeedback = null" class="btn btn-light rounded-pill px-4" :disabled="modalLoading">Đóng</button>
            <button
              @click="submitProcessFeedback"
              class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm"
              :disabled="modalLoading"
            >
              <span v-if="modalLoading" class="spinner-border spinner-border-sm me-1.5" role="status"></span>
              <i v-else class="fa-solid fa-check me-1.5"></i>
              Lưu Cập Nhật
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ CONFIRM DELETE MODAL ═══ -->
    <ConfirmModal
      :show="showConfirmDelete"
      :title="confirmTitle"
      :message="confirmMessage"
      confirm-text="Xóa vĩnh viễn"
      cancel-text="Hủy"
      confirm-variant="danger"
      :loading="modalLoading"
      @cancel="showConfirmDelete = false"
      @confirm="executeConfirmedDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useReviewStore } from "../../stores/reviewStore";
import { toast } from "../../composables/useToast";
import { getImageUrl } from "../../utils/imageHelper";
import ConfirmModal from "../../components/common/ConfirmModal.vue";

const reviewStore = useReviewStore();

const activeTab = ref("reviews");
const stats = ref({ avgRating: 5.0, totalReviews: 0, visibleCount: 0, hiddenCount: 0 });
const feedbackStats = ref({ total: 0, pending: 0, reviewed: 0, resolved: 0 });

const reviewFilter = reactive({ rating: "", status: "" });
const feedbackFilter = reactive({ status: "", category: "" });

const selectedReview = ref(null);
const replyText = ref("");

const selectedFeedback = ref(null);
const processStatus = ref("REVIEWED");
const processNote = ref("");

const modalLoading = ref(false);

// Confirm Delete State
const showConfirmDelete = ref(false);
const confirmTitle = ref("");
const confirmMessage = ref("");
const pendingDeleteAction = ref(null);

const loadReviews = async (page = 1) => {
  const params = { page, limit: 10 };
  if (reviewFilter.rating) params.rating = reviewFilter.rating;
  if (reviewFilter.status) params.status = reviewFilter.status;
  await reviewStore.fetchAllReviews(params);
};

const loadFeedbacks = async (page = 1) => {
  const params = { page, limit: 10 };
  if (feedbackFilter.status) params.status = feedbackFilter.status;
  if (feedbackFilter.category) params.category = feedbackFilter.category;
  await reviewStore.fetchAllFeedbacks(params);
};

const loadStats = async () => {
  const s1 = await reviewStore.fetchReviewStats();
  if (s1) stats.value = s1;
  const s2 = await reviewStore.fetchFeedbackStats();
  if (s2) feedbackStats.value = s2;
};

const refreshData = async () => {
  await Promise.all([loadStats(), loadReviews(1), loadFeedbacks(1)]);
  toast.success("Đã làm mới dữ liệu đánh giá & góp ý!");
};

// ═══ REVIEW ACTIONS ═══
const openReplyModal = (r) => {
  selectedReview.value = r;
  replyText.value = r.reply?.comment || "";
};

const submitReply = async () => {
  if (!selectedReview.value || !replyText.value.trim()) return;
  modalLoading.value = true;
  try {
    await reviewStore.replyReview(selectedReview.value._id, replyText.value.trim());
    toast.success("Gửi phản hồi thành công!");
    selectedReview.value = null;
    await loadReviews(reviewStore.reviewMeta.page);
  } catch (err) {
    toast.error(err.message);
  } finally {
    modalLoading.value = false;
  }
};

const handleToggleStatus = async (r) => {
  try {
    const newStatus = r.status === "VISIBLE" ? "HIDDEN" : "VISIBLE";
    await reviewStore.toggleReviewStatus(r._id, newStatus);
    toast.success(`Đã chuyển trạng thái sang ${newStatus === "VISIBLE" ? "HIỂN THỊ" : "ẨN"}`);
    await Promise.all([loadStats(), loadReviews(reviewStore.reviewMeta.page)]);
  } catch (err) {
    toast.error(err.message);
  }
};

const confirmDeleteReview = (r) => {
  confirmTitle.value = "Xác nhận xóa đánh giá";
  confirmMessage.value = `Bạn có chắc chắn muốn xóa đánh giá của '${r.user?.name || 'Khách'}' cho món '${r.dish?.name}'?`;
  pendingDeleteAction.value = async () => {
    try {
      await reviewStore.deleteReview(r._id);
      toast.success("Đã xóa đánh giá món ăn");
      await Promise.all([loadStats(), loadReviews(reviewStore.reviewMeta.page)]);
    } catch (err) {
      toast.error(err.message);
    }
  };
  showConfirmDelete.value = true;
};

// ═══ FEEDBACK ACTIONS ═══
const openProcessModal = (fb) => {
  selectedFeedback.value = fb;
  processStatus.value = fb.status || "REVIEWED";
  processNote.value = fb.adminNote || "";
};

const submitProcessFeedback = async () => {
  if (!selectedFeedback.value) return;
  modalLoading.value = true;
  try {
    await reviewStore.updateFeedbackStatus(selectedFeedback.value._id, {
      status: processStatus.value,
      adminNote: processNote.value.trim(),
    });
    toast.success("Cập nhật trạng thái góp ý thành công!");
    selectedFeedback.value = null;
    await Promise.all([loadStats(), loadFeedbacks(reviewStore.feedbackMeta.page)]);
  } catch (err) {
    toast.error(err.message);
  } finally {
    modalLoading.value = false;
  }
};

const confirmDeleteFeedback = (fb) => {
  confirmTitle.value = "Xác nhận xóa góp ý";
  confirmMessage.value = `Bạn có chắc chắn muốn xóa thư góp ý từ khách hàng '${fb.name}' (${fb.phone})?`;
  pendingDeleteAction.value = async () => {
    try {
      await reviewStore.deleteFeedback(fb._id);
      toast.success("Đã xóa thư góp ý");
      await Promise.all([loadStats(), loadFeedbacks(reviewStore.feedbackMeta.page)]);
    } catch (err) {
      toast.error(err.message);
    }
  };
  showConfirmDelete.value = true;
};

const executeConfirmedDelete = async () => {
  if (pendingDeleteAction.value) {
    modalLoading.value = true;
    try {
      await pendingDeleteAction.value();
    } finally {
      modalLoading.value = false;
      pendingDeleteAction.value = null;
      showConfirmDelete.value = false;
    }
  }
};

// ═══ HELPERS ═══
const categoryLabel = (cat) => {
  const map = {
    SERVICE: "Thái độ phục vụ",
    FOOD: "Chất lượng món ăn",
    ATMOSPHERE: "Không gian / Vệ sinh",
    PRICING: "Giá cả / Ưu đãi",
    OTHER: "Góp ý khác",
  };
  return map[cat] || cat || "Góp ý";
};

const categoryBadgeClass = (cat) => {
  switch (cat) {
    case "SERVICE": return "bg-primary bg-opacity-15 text-primary";
    case "FOOD": return "bg-danger bg-opacity-15 text-danger";
    case "ATMOSPHERE": return "bg-success bg-opacity-15 text-success";
    case "PRICING": return "bg-warning bg-opacity-20 text-dark";
    default: return "bg-secondary bg-opacity-15 text-secondary";
  }
};

const feedbackStatusLabel = (s) => {
  switch (s) {
    case "PENDING": return "Mới nhận";
    case "REVIEWED": return "Đã tiếp nhận";
    case "RESOLVED": return "Đã xử lý";
    default: return s;
  }
};

const feedbackStatusClass = (s) => {
  switch (s) {
    case "PENDING": return "bg-warning bg-opacity-20 text-dark";
    case "REVIEWED": return "bg-info bg-opacity-15 text-info";
    case "RESOLVED": return "bg-success bg-opacity-15 text-success";
    default: return "bg-secondary bg-opacity-15 text-secondary";
  }
};

onMounted(() => {
  loadStats();
  loadReviews(1);
  loadFeedbacks(1);
});
</script>

<style scoped>
.shadow-2xs {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.leading-relaxed {
  line-height: 1.5;
}
</style>
