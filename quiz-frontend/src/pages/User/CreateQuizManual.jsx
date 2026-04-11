import { useState } from "react";
import { useNavigate } from "react-router-dom";
import quizApi from "../../services/quizApi";

const CreateQuizManual = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [quizInfo, setQuizInfo] = useState({
    title: "",
    description: "",
    timeLimit: 15,
    attemptsAllowed: 0,
    isPublic: false,
    shuffleQuestions: false,
    shuffleAnswers: false,
  });

  const [questions, setQuestions] = useState([
    {
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 10,
    },
  ]);

  // Thêm câu hỏi mới
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        points: 10,
      },
    ]);
  };

  // Xóa câu hỏi
  const removeQuestion = (index) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuizChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setQuizInfo({ ...quizInfo, [e.target.name]: value });
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[optIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await quizApi.createQuizManual({ ...quizInfo, questions });
      alert("Tạo đề thi thành công!");
      navigate("/my-quizzes");
    } catch (error) {
      alert("Lỗi khi tạo đề thi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 pb-20">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">
        Tạo Đề Thi Thủ Công
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* THÔNG TIN CHUNG */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-600">
          <h3 className="text-xl font-bold mb-4">1. Thông tin chung</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-1">
                Tiêu đề đề thi
              </label>
              <input
                type="text"
                name="title"
                required
                value={quizInfo.title}
                onChange={handleQuizChange}
                className="w-full border p-2 rounded"
                placeholder="VD: Toán cao cấp - Chương 1"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">
                Thời gian (phút)
              </label>
              <input
                type="number"
                name="timeLimit"
                min="1"
                value={quizInfo.timeLimit}
                onChange={handleQuizChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">
                Số lần thi (0 = không giới hạn)
              </label>
              <input
                type="number"
                name="attemptsAllowed"
                min="0"
                value={quizInfo.attemptsAllowed}
                onChange={handleQuizChange}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isPublic"
                checked={quizInfo.isPublic}
                onChange={handleQuizChange}
              />{" "}
              Công khai
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="shuffleQuestions"
                checked={quizInfo.shuffleQuestions}
                onChange={handleQuizChange}
              />{" "}
              Đảo câu hỏi
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="shuffleAnswers"
                checked={quizInfo.shuffleAnswers}
                onChange={handleQuizChange}
              />{" "}
              Đảo đáp án
            </label>
          </div>
        </div>

        {/* DANH SÁCH CÂU HỎI */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold">2. Danh sách câu hỏi</h3>
          {questions.map((q, qIndex) => (
            <div
              key={qIndex}
              className="bg-white p-6 rounded-lg shadow border relative"
            >
              <button
                type="button"
                onClick={() => removeQuestion(qIndex)}
                className="absolute top-4 right-4 text-red-500 font-bold"
              >
                Xóa câu
              </button>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1">
                  Câu hỏi {qIndex + 1}
                </label>
                <textarea
                  value={q.questionText}
                  onChange={(e) =>
                    handleQuestionChange(qIndex, "questionText", e.target.value)
                  }
                  required
                  className="w-full border p-2 rounded"
                  rows="2"
                  placeholder="Nhập nội dung câu hỏi..."
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options.map((opt, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={q.correctAnswer === optIndex}
                      onChange={() =>
                        handleQuestionChange(qIndex, "correctAnswer", optIndex)
                      }
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) =>
                        handleOptionChange(qIndex, optIndex, e.target.value)
                      }
                      required
                      className="w-full border p-2 rounded text-sm"
                      placeholder={`Đáp án ${optIndex + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={addQuestion}
            className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            + Thêm câu hỏi
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-10 py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition"
          >
            {loading ? "Đang lưu..." : "Lưu & Xuất Bản Đề Thi"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuizManual;
