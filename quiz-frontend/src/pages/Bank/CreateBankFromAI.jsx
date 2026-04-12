import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import aiApi from "../../services/aiApi";
import bankApi from "../../services/bankApi";

const CreateBankFromAI = () => {
  const navigate = useNavigate();

  // State chế độ nhập
  const [activeTab, setActiveTab] = useState("topic");

  // State cho AI
  const [topic, setTopic] = useState("");
  const [file, setFile] = useState(null);
  const [numQuestions, setNumQuestions] = useState(10);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // State review và lưu trữ
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [bankInfo, setBankInfo] = useState({ title: "", description: "" });
  const [isSaving, setIsSaving] = useState(false);

  // 1. GỌI AI
  const handleGenerateAI = async (e) => {
    e.preventDefault();
    setIsLoadingAI(true);
    setPreviewQuestions([]);

    try {
      let res;
      if (activeTab === "topic") {
        if (!topic.trim()) return alert("Vui lòng nhập chủ đề!");
        res = await aiApi.generateFromTopic({ topic, numQuestions });
      } else {
        if (!file) return alert("Vui lòng chọn file tài liệu!");
        if (file.size > 5 * 1024 * 1024)
          return alert("File không được vượt quá 5MB!");

        const data = new FormData();
        data.append("file", file);
        data.append("numQuestions", numQuestions);
        res = await aiApi.generateFromFile(data);
      }

      setPreviewQuestions(res.questions);
      // Gợi ý tên Ngân hàng
      setBankInfo({
        title:
          activeTab === "topic"
            ? `Ngân hàng AI: ${topic}`
            : `Ngân hàng AI từ tài liệu`,
        description: `Tạo tự động bởi AI với ${numQuestions} câu hỏi.`,
      });
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi AI. Vui lòng thử lại!");
    } finally {
      setIsLoadingAI(false);
    }
  };

  // 2. CHỈNH SỬA PREVIEW
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
    if (window.confirm("Xóa câu hỏi này khỏi danh sách?")) {
      setPreviewQuestions(previewQuestions.filter((_, i) => i !== index));
    }
  };

  // 3. LƯU VÀO NGÂN HÀNG CÂU HỎI
  const handleSaveBank = async (e) => {
    e.preventDefault();
    if (previewQuestions.length === 0) return alert("Chưa có câu hỏi nào!");

    setIsSaving(true);
    try {
      await bankApi.createBank({
        ...bankInfo,
        questions: previewQuestions,
      });
      alert("🎉 Lưu Ngân hàng câu hỏi thành công!");
      navigate("/banks"); // Trở về danh sách ngân hàng
    } catch (error) {
      alert("Lỗi khi lưu Ngân hàng");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 pb-20 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <span className="text-4xl">🏦</span> Tạo Ngân Hàng Bằng AI
        </h2>
        <Link
          to="/banks"
          className="text-indigo-600 font-semibold hover:underline"
        >
          ⬅️ Quay lại Kho Ngân Hàng
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ================= CỘT TRÁI: GỌI AI & LƯU NGÂN HÀNG ================= */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-indigo-100">
            <h3 className="font-bold text-lg text-indigo-800 mb-4 border-b pb-2">
              1. Lệnh cho AI
            </h3>
            <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
              <button
                className={`flex-1 py-2 text-sm font-bold rounded-md transition ${activeTab === "topic" ? "bg-white text-indigo-600 shadow" : "text-gray-500"}`}
                onClick={() => setActiveTab("topic")}
              >
                📝 Chủ Đề
              </button>
              <button
                className={`flex-1 py-2 text-sm font-bold rounded-md transition ${activeTab === "file" ? "bg-white text-indigo-600 shadow" : "text-gray-500"}`}
                onClick={() => setActiveTab("file")}
              >
                📄 File (PDF/Doc)
              </button>
            </div>

            <form onSubmit={handleGenerateAI} className="space-y-4">
              {activeTab === "topic" ? (
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">
                    Chủ đề mong muốn
                  </label>
                  <input
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500"
                    placeholder="VD: Marketing căn bản..."
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">
                    Tài liệu tham khảo
                  </label>
                  <input
                    type="file"
                    required
                    accept=".pdf, .docx"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full border p-2 rounded"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  Số lượng câu (Max: 100)
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
                className="w-full font-bold py-3 rounded text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
              >
                {isLoadingAI ? "🤖 Đang phân tích..." : "✨ Tạo Câu Hỏi"}
              </button>
            </form>
          </div>

          {previewQuestions.length > 0 && (
            <form
              onSubmit={handleSaveBank}
              className="bg-white p-6 rounded-lg shadow-md border border-green-100 sticky top-4"
            >
              <h3 className="font-bold text-lg text-green-700 mb-4 border-b pb-2">
                2. Lưu Ngân Hàng
              </h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-bold mb-1 text-gray-700">
                    Tên Ngân Hàng
                  </label>
                  <input
                    type="text"
                    required
                    value={bankInfo.title}
                    onChange={(e) =>
                      setBankInfo({ ...bankInfo, title: e.target.value })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-gray-700">
                    Mô tả thêm
                  </label>
                  <textarea
                    value={bankInfo.description}
                    onChange={(e) =>
                      setBankInfo({ ...bankInfo, description: e.target.value })
                    }
                    className="w-full border p-2 rounded"
                    rows="3"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full font-bold py-3 rounded bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400"
              >
                {isSaving ? "Đang lưu..." : "💾 Lưu Vào Kho"}
              </button>
            </form>
          )}
        </div>

        {/* ================= CỘT PHẢI: REVIEW (Giữ nguyên logic sửa câu hỏi) ================= */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 min-h-[600px]">
            <h3 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">
              Bản Xem Trước Của AI
            </h3>

            {isLoadingAI ? (
              <div className="text-center py-20 text-indigo-500 animate-pulse font-semibold">
                Đang tổng hợp kiến thức... Xin chờ giây lát!
              </div>
            ) : previewQuestions.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                Chưa có câu hỏi nào.
              </div>
            ) : (
              <div className="space-y-6">
                {previewQuestions.map((q, index) => (
                  <div
                    key={index}
                    className="p-5 bg-gray-50 rounded-lg border shadow-sm relative"
                  >
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="absolute top-4 right-4 text-red-400 font-bold text-sm"
                    >
                      ❌ Xóa
                    </button>
                    <div className="mb-4 pr-12">
                      <label className="font-bold block mb-1">
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
                        className="w-full border p-2 rounded"
                        rows="2"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`flex items-center p-2 rounded border ${q.correctAnswer === optIdx ? "bg-green-100 border-green-400" : "bg-white"}`}
                        >
                          <input
                            type="radio"
                            checked={q.correctAnswer === optIdx}
                            onChange={() =>
                              handleQuestionChange(
                                index,
                                "correctAnswer",
                                optIdx,
                              )
                            }
                            className="w-5 h-5"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) =>
                              handleOptionChange(index, optIdx, e.target.value)
                            }
                            className="w-full bg-transparent border-none ml-2 p-1"
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

export default CreateBankFromAI;
