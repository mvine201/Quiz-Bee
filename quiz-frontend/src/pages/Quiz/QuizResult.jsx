import { useLocation, Link } from "react-router-dom";

const QuizResult = () => {
  const location = useLocation();
  const result = location.state?.result;
  const quiz = location.state?.quiz; // Lấy thêm quiz để biết nội dung câu hỏi

  if (!result || !quiz) {
    return (
      <div className="text-center mt-10">
        <p>Không tìm thấy dữ liệu kết quả.</p>
        <Link to="/" className="text-blue-500 underline">
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 pb-20">
      {/* KHỐI TỔNG ĐIỂM */}
      <div className="bg-white p-8 rounded-lg shadow-lg text-center border-t-8 border-green-500 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Hoàn thành bài thi!
        </h1>
        <p className="text-gray-500 mb-8">
          Kết quả của bạn đã được hệ thống ghi nhận.
        </p>

        <div className="flex justify-center items-center space-x-12 mb-8">
          <div className="text-center">
            <p className="text-sm text-gray-500 uppercase tracking-wide">
              Tổng Điểm
            </p>
            <p className="text-6xl font-black text-blue-600">
              {result.score}
              <span className="text-2xl text-gray-400">/10</span>
            </p>
          </div>
          <div className="h-16 w-px bg-gray-200"></div>
          <div className="text-center">
            <p className="text-sm text-gray-500 uppercase tracking-wide">
              Số Câu Đúng
            </p>
            <p className="text-4xl font-bold text-green-500">
              {result.correctCount}
              <span className="text-xl text-gray-400">
                /{result.totalQuestions}
              </span>
            </p>
          </div>
        </div>
        <Link
          to="/"
          className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded transition"
        >
          Về Trang Chủ
        </Link>
      </div>

      {/* KHỐI CHI TIẾT ĐÁP ÁN */}
      <div className="bg-white p-8 rounded-lg shadow border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">
          Chi tiết bài làm
        </h2>
        <div className="space-y-6">
          {quiz.questions.map((q, index) => {
            // Tìm kết quả của câu hỏi này trong mảng userAnswers
            const answerDetail = result.userAnswers.find(
              (a) => a.questionId === q._id,
            );
            const selectedOpt = answerDetail
              ? answerDetail.selectedOption
              : null;
            const isCorrect = answerDetail ? answerDetail.isCorrect : false;

            return (
              <div
                key={q._id}
                className={`p-4 rounded-lg border ${isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
              >
                <h3 className="font-semibold text-gray-800 mb-3">
                  Câu {index + 1}: {q.questionText}
                  <span
                    className={`ml-2 text-sm font-bold ${isCorrect ? "text-green-600" : "text-red-600"}`}
                  >
                    {isCorrect ? "✓ Đúng" : "✗ Sai"}
                  </span>
                </h3>
                <div className="space-y-2">
                  {q.options.map((opt, optIndex) => {
                    let optClass = "p-2 rounded border text-gray-700 bg-white";

                    // Nếu là đáp án user chọn
                    if (selectedOpt === optIndex) {
                      optClass = isCorrect
                        ? "p-2 rounded border bg-green-500 text-white font-semibold border-green-600"
                        : "p-2 rounded border bg-red-500 text-white font-semibold border-red-600";
                    }

                    return (
                      <div key={optIndex} className={optClass}>
                        {String.fromCharCode(65 + optIndex)}. {opt}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
