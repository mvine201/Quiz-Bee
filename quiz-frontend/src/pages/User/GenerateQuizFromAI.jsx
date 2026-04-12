// src/pages/User/GenerateQuizFromAI.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import aiApi from "../../services/aiApi";
import quizApi from "../../services/quizApi";

const GenerateQuizFromAI = () => {
  const navigate = useNavigate();

  // State chế độ nhập: "topic" hoặc "file"
  const [activeTab, setActiveTab] = useState("topic");

  // State cho AI
  const [topic, setTopic] = useState("");
  const [file, setFile] = useState(null);
  const [numQuestions, setNumQuestions] = useState(10);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // State lưu kết quả AI trả về để review
  const [previewQuestions, setPreviewQuestions] = useState([]);

  // State cấu hình đề thi chuẩn bị lưu
  const [formData, setFormData] = useState({
    title: "",
    timeLimit: 15,
    attemptsAllowed: 1,
    isPublic: false,
    shuffleQuestions: false,
    shuffleOptions: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  // 1. GỌI AI TẠO CÂU HỎI
  const handleGenerateAI = async (e) => {
    e.preventDefault();
    setIsLoadingAI(true);
    setPreviewQuestions([]); // Reset màn hình review

    try {
      let res;
      if (activeTab === "topic") {
        if (!topic.trim()) return alert("Vui lòng nhập chủ đề!");
        res = await aiApi.generateFromTopic({ topic, numQuestions });
      } else {
        if (!file) return alert("Vui lòng chọn file tài liệu!");
        // File cần > 0 và <= 5MB
        if (file.size > 5 * 1024 * 1024)
          return alert("File không được vượt quá 5MB!");

        const data = new FormData();
        data.append("file", file);
        data.append("numQuestions", numQuestions);
        res = await aiApi.generateFromFile(data);
      }

      setPreviewQuestions(res.questions);
      // Tự động gán tiêu đề gợi ý
      setFormData((prev) => ({
        ...prev,
        title:
          activeTab === "topic"
            ? `Đề thi AI: ${topic}`
            : `Đề thi AI từ tài liệu`,
      }));
    } catch (error) {
      alert(
        error.response?.data?.message || "Lỗi khi gọi AI. Vui lòng thử lại!",
      );
    } finally {
      setIsLoadingAI(false);
    }
  };

  // 2. CÁC HÀM CHỈNH SỬA PREVIEW (Tái sử dụng logic của bạn)
  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...previewQuestions];
    newQuestions[index][field] = value;
    setPreviewQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const newQuestions = [...previewQuestions];
    newQuestions[qIndex].options[optIndex] = value;
    setPreviewQuestions(newQuestions);
  };

  const removeQuestion = (index) => {
    if (window.confirm("Xóa câu hỏi này?")) {
      setPreviewQuestions(previewQuestions.filter((_, i) => i !== index));
    }
  };

  // 3. LƯU ĐỀ THI
  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    if (previewQuestions.length === 0)
      return alert("Chưa có câu hỏi nào để lưu!");

    setIsSaving(true);
    try {
      // Gọi API createQuizManual vì cấu trúc dữ liệu gửi lên y hệt nhau
      await quizApi.createQuizManual({
        ...formData,
        questions: previewQuestions,
      });
      alert("Lưu đề thi AI thành công!");
      navigate("/my-quizzes");
    } catch (error) {
      alert("Lỗi khi lưu đề thi");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 pb-20 px-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <span className="text-4xl">✨</span> Tạo Đề Thi Với Trợ Lý AI
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ================= CỘT TRÁI: ĐIỀU KHIỂN AI & CẤU HÌNH ================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* KHỐI 1: GỌI AI */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-indigo-100">
            <h3 className="font-bold text-lg text-indigo-800 mb-4 border-b pb-2">
              1. Cấp dữ liệu cho AI
            </h3>

            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
              <button
                className={`flex-1 py-2 text-sm font-bold rounded-md transition ${activeTab === "topic" ? "bg-white text-indigo-600 shadow" : "text-gray-500"}`}
                onClick={() => setActiveTab("topic")}
              >
                📝 Nhập Chủ Đề
              </button>
              <button
                className={`flex-1 py-2 text-sm font-bold rounded-md transition ${activeTab === "file" ? "bg-white text-indigo-600 shadow" : "text-gray-500"}`}
                onClick={() => setActiveTab("file")}
              >
                📄 Upload Tài Liệu
              </button>
            </div>

            <form onSubmit={handleGenerateAI} className="space-y-4">
              {activeTab === "topic" ? (
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">
                    Chủ đề bài thi
                  </label>
                  <input
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500"
                    placeholder="VD: Lịch sử Việt Nam thế kỷ 20..."
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">
                    File tài liệu (.pdf, .docx)
                  </label>
                  <input
                    type="file"
                    required
                    accept=".pdf, .docx"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 cursor-pointer border p-2 rounded"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  Số lượng câu hỏi (Max: 100)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoadingAI}
                className={`w-full font-bold py-3 rounded transition shadow-md ${isLoadingAI ? "bg-indigo-300 cursor-not-allowed" : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transform hover:-translate-y-1"}`}
              >
                {isLoadingAI
                  ? "🤖 AI đang suy nghĩ..."
                  : "✨ Bắt Đầu Tạo Bằng AI"}
              </button>
            </form>
          </div>

          {/* KHỐI 2: CẤU HÌNH ĐỀ THI (Chỉ hiện khi đã có câu hỏi) */}
          {previewQuestions.length > 0 && (
            <form
              onSubmit={handleSaveQuiz}
              className="bg-white p-6 rounded-lg shadow-md border border-green-100 sticky top-4"
            >
              <h3 className="font-bold text-lg text-green-700 mb-4 border-b pb-2">
                2. Cấu hình & Lưu Đề Thi
              </h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-bold mb-1 text-gray-700">
                    Tên Đề Thi
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-bold mb-1 text-gray-700">
                      Thời gian (phút)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.timeLimit}
                      onChange={(e) =>
                        setFormData({ ...formData, timeLimit: e.target.value })
                      }
                      className="w-full border p-2 rounded"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-bold mb-1 text-gray-700">
                      Số lần thi
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.attemptsAllowed}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          attemptsAllowed: e.target.value,
                        })
                      }
                      className="w-full border p-2 rounded"
                    />
                  </div>
                </div>

                <div className="space-y-2 p-3 bg-gray-50 rounded border text-sm">
                  <label className="flex items-center cursor-pointer font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) =>
                        setFormData({ ...formData, isPublic: e.target.checked })
                      }
                      className="mr-2"
                    />{" "}
                    Công khai đề thi
                  </label>
                  <label className="flex items-center cursor-pointer font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.shuffleQuestions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shuffleQuestions: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />{" "}
                    Đảo câu hỏi
                  </label>
                  <label className="flex items-center cursor-pointer font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.shuffleOptions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shuffleOptions: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />{" "}
                    Đảo đáp án
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full font-bold py-3 rounded transition shadow-md bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400"
              >
                {isSaving ? "Đang lưu..." : "✅ Lưu & Xuất Bản"}
              </button>
            </form>
          )}
        </div>

        {/* ================= CỘT PHẢI: XEM TRƯỚC VÀ CHỈNH SỬA ================= */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 min-h-[600px]">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Bản Xem Trước Của AI
              </h3>
              {previewQuestions.length > 0 && (
                <span className="bg-indigo-100 text-indigo-800 text-sm font-bold px-3 py-1 rounded-full">
                  Tổng: {previewQuestions.length} câu hỏi
                </span>
              )}
            </div>

            {isLoadingAI ? (
              <div className="flex flex-col items-center justify-center h-64 text-indigo-500 animate-pulse">
                <span className="text-6xl mb-4">🔮</span>
                <p className="font-semibold text-xl mb-2">
                  AI đang phân tích và soạn câu hỏi...
                </p>
                <p className="text-gray-500">
                  Việc này có thể mất từ 10 - 30 giây tùy số lượng câu.
                </p>
              </div>
            ) : previewQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                <span className="text-5xl mb-3">🤖</span>
                <p className="text-lg">
                  Nhập lệnh ở cột trái để AI bắt đầu làm việc
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-yellow-50 text-yellow-800 p-3 rounded text-sm border border-yellow-200">
                  ⚠️ <strong>Lưu ý:</strong> Hãy kiểm tra lại đáp án mà AI đã
                  chọn trước khi lưu. Bạn có thể sửa trực tiếp text hoặc bấm vào
                  vòng tròn để đổi đáp án đúng.
                </div>

                {previewQuestions.map((q, index) => (
                  <div
                    key={index}
                    className="p-5 bg-gray-50 rounded-lg border border-gray-200 shadow-sm relative hover:shadow-md transition"
                  >
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="absolute top-4 right-4 text-red-400 hover:text-red-600 font-bold text-sm"
                    >
                      ❌ Xóa
                    </button>

                    <div className="mb-4 pr-12">
                      <label className="font-bold text-gray-800 mb-1 block">
                        Câu {index + 1}:
                      </label>
                      <textarea
                        value={q.questionText}
                        onChange={(e) =>
                          handleQuestionChange(
                            index,
                            "questionText",
                            e.target.value,
                          )
                        }
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 bg-white"
                        rows="2"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`flex items-center p-2 rounded border transition-colors ${q.correctAnswer === optIdx ? "bg-green-100 border-green-400" : "bg-white border-gray-300"}`}
                        >
                          <input
                            type="radio"
                            name={`ai-correct-${index}`}
                            checked={q.correctAnswer === optIdx}
                            onChange={() =>
                              handleQuestionChange(
                                index,
                                "correctAnswer",
                                optIdx,
                              )
                            }
                            className="w-5 h-5 cursor-pointer text-green-600"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) =>
                              handleOptionChange(index, optIdx, e.target.value)
                            }
                            className={`w-full bg-transparent border-none focus:ring-0 ml-2 p-1 ${q.correctAnswer === optIdx ? "font-bold text-green-900" : "text-gray-700"}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateQuizFromAI;
