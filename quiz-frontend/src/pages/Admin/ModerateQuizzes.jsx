import { useState, useEffect } from "react";
import adminApi from "../../services/adminApi";

const ModerateQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingQuizzes();
  }, []);

  const fetchPendingQuizzes = async () => {
    try {
      const data = await adminApi.getPendingQuizzes();
      setQuizzes(data);
    } catch (error) {
      alert("Lỗi tải danh sách đề thi");
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id, action) => {
    const actionText = action === "approve" ? "DUYỆT" : "TỪ CHỐI";
    if (!window.confirm(`Bạn có chắc muốn ${actionText} đề thi này?`)) return;

    try {
      await adminApi.moderateQuiz(id, action);
      // Xóa đề thi vừa duyệt khỏi danh sách pending
      setQuizzes(quizzes.filter((q) => q._id !== id));
    } catch (error) {
      alert("Lỗi khi kiểm duyệt");
    }
  };

  if (loading) return <div>Đang tải danh sách chờ duyệt...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Kiểm Duyệt Đề Thi
      </h1>

      {quizzes.length === 0 ? (
        <div className="bg-green-50 text-green-700 p-6 rounded-lg border border-green-200 text-center">
          🎉 Hiện tại không có đề thi nào đang chờ duyệt.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="bg-white p-6 rounded-lg shadow border border-gray-200"
            >
              <h3 className="text-xl font-bold mb-2">{quiz.title}</h3>
              <div className="text-sm text-gray-600 mb-4 space-y-1">
                <p>
                  👤 Tác giả:{" "}
                  <strong>{quiz.author?.username || "Không rõ"}</strong>
                </p>
                <p>🕒 Thời gian: {quiz.timeLimit} phút</p>
                <p>
                  📅 Ngày tạo:{" "}
                  {new Date(quiz.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleModerate(quiz._id, "approve")}
                  className="flex-1 bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700 transition"
                >
                  ✅ Duyệt
                </button>
                <button
                  onClick={() => handleModerate(quiz._id, "reject")}
                  className="flex-1 bg-red-100 text-red-600 font-bold py-2 rounded hover:bg-red-200 transition"
                >
                  ❌ Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModerateQuizzes;
