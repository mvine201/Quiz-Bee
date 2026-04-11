import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bankApi from "../../services/bankApi";
import quizApi from "../../services/quizApi"; // Dùng nhờ hàm parseFile

const CreateQuestionBank = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Parse file giống hệt tạo Đề thi
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setPreviewQuestions([]);
    setIsLoadingPreview(true);

    try {
      const form = new FormData();
      form.append("file", selectedFile);
      const res = await quizApi.parseFile(form);
      setPreviewQuestions(res.questions);
    } catch (error) {
      alert("Lỗi khi đọc file. Vui lòng kiểm tra lại định dạng.");
      e.target.value = null;
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const removeQuestion = (index) => {
    if (window.confirm("Xóa câu này khỏi danh sách import?")) {
      setPreviewQuestions(previewQuestions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (previewQuestions.length === 0) {
      return alert("Ngân hàng phải có ít nhất 1 câu hỏi!");
    }

    setIsSaving(true);
    try {
      await bankApi.createBank({
        ...formData,
        questions: previewQuestions,
      });
      alert("Tạo Ngân hàng câu hỏi thành công!");
      navigate("/banks");
    } catch (error) {
      alert("Lỗi khi lưu Ngân hàng");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 pb-20 px-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Tạo Ngân Hàng Câu Hỏi Mới
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form nhập liệu (Cột trái) */}
        <div className="lg:col-span-4 space-y-6">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow-md border sticky top-4"
          >
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2 text-gray-700">
                Tên Ngân Hàng
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500"
                placeholder="VD: Ngân hàng Toán Đại Số"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2 text-gray-700">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500"
                rows="3"
                placeholder="Ghi chú về ngân hàng này..."
              ></textarea>
            </div>

            <div className="mb-6 p-4 bg-indigo-50 rounded border border-indigo-100">
              <label className="block text-sm font-bold mb-2 text-indigo-900">
                Import Câu Hỏi (Excel/Word/Txt)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".xlsx, .xls, .docx, .txt"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={
                isSaving || previewQuestions.length === 0 || isLoadingPreview
              }
              className="w-full font-bold py-3 rounded transition shadow-md bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-400"
            >
              {isSaving ? "Đang lưu..." : "✅ Lưu Ngân Hàng"}
            </button>
          </form>
        </div>

        {/* Cột phải: Xem trước câu hỏi */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 rounded-lg shadow-md border min-h-[500px]">
            <h3 className="text-xl font-bold border-b pb-2 mb-4">
              Danh sách câu hỏi ({previewQuestions.length})
            </h3>

            {isLoadingPreview && (
              <div className="text-center py-10 animate-pulse text-indigo-500">
                Đang đọc file...
              </div>
            )}
            {!isLoadingPreview && previewQuestions.length === 0 && (
              <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded bg-gray-50">
                Vui lòng tải file lên để import câu hỏi vào ngân hàng.
              </div>
            )}

            <div className="space-y-4">
              {previewQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-50 rounded border relative"
                >
                  <button
                    type="button"
                    onClick={() => removeQuestion(idx)}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                  >
                    ❌
                  </button>
                  <p className="font-bold text-gray-800 mb-2">
                    Câu {idx + 1}:{" "}
                    <span className="font-normal">{q.questionText}</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2 rounded border ${q.correctAnswer === oIdx ? "bg-green-100 border-green-400 font-bold" : "bg-white"}`}
                      >
                        {String.fromCharCode(65 + oIdx)}. {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuestionBank;
