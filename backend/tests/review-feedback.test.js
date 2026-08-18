const Feedback = require("../app/models/feedback.model");
const Review = require("../app/models/review.model");

describe("Review & Feedback Unit Tests", () => {
  test("Feedback Schema có các trường bắt buộc và enum hợp lệ", () => {
    const feedback = new Feedback({
      name: "Nguyễn Văn A",
      phone: "0901234567",
      content: "Món lẩu cua rất ngon, nhân viên phục vụ tận tình!",
      category: "SERVICE",
      rating: 5,
    });

    const validationError = feedback.validateSync();
    expect(validationError).toBeUndefined();
    expect(feedback.status).toBe("PENDING");
    expect(feedback.category).toBe("SERVICE");
    expect(feedback.rating).toBe(5);
  });

  test("Feedback Schema báo lỗi khi thiếu tên, sđt hoặc nội dung", () => {
    const invalidFeedback = new Feedback({});
    const validationError = invalidFeedback.validateSync();
    expect(validationError).toBeDefined();
    expect(validationError.errors.name).toBeDefined();
    expect(validationError.errors.phone).toBeDefined();
    expect(validationError.errors.content).toBeDefined();
  });

  test("Review Schema cho phép gắn reply từ Nhà Hàng và trạng thái VISIBLE/HIDDEN", () => {
    const review = new Review({
      user: "660000000000000000000001",
      dish: "660000000000000000000002",
      rating: 5,
      comment: "Cua sốt me tuyệt vời, đậm đà!",
      status: "VISIBLE",
      reply: {
        comment: "Cảm ơn quý khách đã yêu thích món ăn của 3 Miền Cua ạ!",
        repliedAt: new Date(),
      },
    });

    const validationError = review.validateSync();
    expect(validationError).toBeUndefined();
    expect(review.status).toBe("VISIBLE");
    expect(review.reply.comment).toContain("Cảm ơn");
  });
});
