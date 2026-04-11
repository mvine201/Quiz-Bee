import Review from "../models/Review.js";
//Thêm đánh giá cho quiz
export const addReview = async (req, res) => {
  try {
    const { quizId, rating, comment } = req.body;
    const review = await Review.create({
      quiz: quizId,
      user: req.user._id,
      rating,
      comment,
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//Lấy tất cả đánh giá của một quiz
export const getQuizReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ quiz: req.params.quizId })
      .populate("user", "username")
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
