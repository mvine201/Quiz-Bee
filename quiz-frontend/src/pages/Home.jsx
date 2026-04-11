import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import quizApi from "../services/quizApi";

const Home = () => {
  const { user } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Gọi API lấy danh sách đề thi khi người dùng ĐÃ ĐĂNG NHẬP
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!user) return; // Không có user thì không gọi API

      setLoading(true);
      try {
        const data = await quizApi.getPublicQuizzes();
        setQuizzes(data);
      } catch (err) {
        setError("Không thể tải danh sách đề thi.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [user]);

  return (
    <div className="mt-8">
      {/* TIÊU ĐỀ TRANG */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Hệ Thống Thi Trắc Nghiệm
        </h1>
        <p className="text-gray-600">
          Ôn tập và kiểm tra kiến thức của bạn mọi lúc, mọi nơi.
        </p>
      </div>

      {/* HIỂN THỊ NỘI DUNG TÙY THEO TRẠNG THÁI ĐĂNG NHẬP */}
      {!user ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center max-w-2xl mx-auto border border-gray-100">
          <h2 className="text-2xl font-semibold mb-4">Bạn chưa đăng nhập</h2>
          <p className="text-gray-600 mb-6">
            Vui lòng đăng nhập hoặc đăng ký tài khoản để xem các đề thi đang có
            sẵn trên hệ thống.
          </p>
          <div className="space-x-4">
            <Link
              to="/login"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold border-l-4 border-blue-600 pl-3 mb-6">
            Đề thi mới nhất
          </h2>

          {loading && (
            <p className="text-center text-gray-500">Đang tải đề thi...</p>
          )}
          {error && <p className="text-center text-red-500">{error}</p>}

          {/* LƯỚI ĐỀ THI (GRID) */}
          {!loading && !error && quizzes.length === 0 && (
            <p className="text-center text-gray-500">
              Chưa có đề thi nào được công khai.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="p-6">
                  <h3
                    className="text-xl font-bold text-gray-800 mb-2 truncate"
                    title={quiz.title}
                  >
                    {quiz.title}
                  </h3>
                  <div className="text-sm text-gray-600 mb-4 space-y-1">
                    <p>
                      🕒 Thời gian:{" "}
                      <span className="font-semibold">
                        {quiz.timeLimit} phút
                      </span>
                    </p>
                    <p>✍️ Tác giả: {quiz.author?.username || "Ẩn danh"}</p>
                    <p>
                      🔄 Số lần thi:{" "}
                      {quiz.attemptsAllowed > 0
                        ? quiz.attemptsAllowed
                        : "Không giới hạn"}
                    </p>
                  </div>
                  <Link
                    to={`/quizzes/${quiz._id}`}
                    className="block w-full text-center bg-blue-50 text-blue-600 font-semibold py-2 rounded border border-blue-200 hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
