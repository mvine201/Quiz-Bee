import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import quizApi from "../../services/quizApi";

const QuizDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho Form Review
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizData, reviewsData] = await Promise.all([
          quizApi.getQuizById(id),
          quizApi.getQuizReviews(id),
        ]);
        setQuiz(quizData);
        setReviews(reviewsData);
      } catch (err) {
        console.error("Lỗi tải dữ liệu", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmittingReview(true);
    try {
      const newReview = await quizApi.addReview({
        quizId: id,
        rating,
        comment,
      });
      // Thêm review mới vào đầu danh sách
      setReviews([newReview, ...reviews]);
      setComment(""); // Reset form
      setRating(5);
    } catch (err) {
      alert("Lỗi khi gửi đánh giá");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="text-center mt-10">Đang tải...</div>;
  if (!quiz)
    return (
      <div className="text-center mt-10 text-red-500">
        Không tìm thấy đề thi
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto mt-10 pb-20">
      {/* THÔNG TIN ĐỀ THI (Giữ nguyên như cũ) */}
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{quiz.title}</h1>
        {quiz.description && (
          <p className="text-gray-600 mb-6">{quiz.description}</p>
        )}

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
          <ul className="space-y-2 text-gray-700">
            <li>
              ⏱️ Thời gian: <strong>{quiz.timeLimit} phút</strong>
            </li>
            <li>
              📝 Số câu hỏi: <strong>{quiz.questions?.length || 0} câu</strong>
            </li>
            <li>
              🔄 Cho phép thử:{" "}
              <strong>
                {quiz.attemptsAllowed > 0
                  ? quiz.attemptsAllowed + " lần"
                  : "Không giới hạn"}
              </strong>
            </li>
          </ul>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate(`/quizzes/${id}/take`)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-10 rounded-full shadow-lg transition transform hover:scale-105"
          >
            Bắt Đầu Làm Bài
          </button>
        </div>
      </div>

      {/* KHU VỰC ĐÁNH GIÁ (REVIEW) */}
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">
          Đánh giá & Bình luận
        </h2>

        {/* Form viết đánh giá */}
        <form
          onSubmit={handleSubmitReview}
          className="mb-8 bg-gray-50 p-4 rounded border"
        >
          <div className="mb-3 flex items-center gap-4">
            <label className="font-semibold text-gray-700">Chấm điểm:</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="border p-1 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
              <option value="4">⭐⭐⭐⭐ (4/5)</option>
              <option value="3">⭐⭐⭐ (3/5)</option>
              <option value="2">⭐⭐ (2/5)</option>
              <option value="1">⭐ (1/5)</option>
            </select>
          </div>
          <textarea
            required
            placeholder="Bạn thấy đề thi này thế nào? Chia sẻ trải nghiệm của bạn nhé..."
            className="w-full border rounded p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
          <button
            type="submit"
            disabled={submittingReview}
            className={`px-6 py-2 rounded text-white font-semibold transition ${submittingReview ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </form>

        {/* Danh sách bình luận */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-gray-500 italic text-center">
              Chưa có đánh giá nào. Hãy là người đầu tiên!
            </p>
          ) : (
            reviews.map((rev) => (
              <div key={rev._id} className="border-b pb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-gray-800">
                    {rev.user?.username || "Ẩn danh"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(rev.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="text-yellow-400 text-sm mb-2">
                  {"⭐".repeat(rev.rating)}
                </div>
                <p className="text-gray-700 text-sm">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizDetail;
