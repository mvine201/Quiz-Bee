import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import bankApi from "../../services/bankApi";

const QuestionBankList = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const data = await bankApi.getMyBanks();
      setBanks(data);
    } catch (err) {
      alert("Lỗi khi tải danh sách ngân hàng câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa ngân hàng này không? Tất cả câu hỏi bên trong sẽ bị xóa!",
      )
    )
      return;
    try {
      await bankApi.deleteBank(id);
      setBanks(banks.filter((b) => b._id !== id));
      alert("Đã xóa thành công!");
    } catch (err) {
      alert("Lỗi khi xóa ngân hàng");
    }
  };

  if (loading) return <div className="text-center mt-10">Đang tải...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 border-l-4 border-indigo-600 pl-3">
          Ngân Hàng Câu Hỏi
        </h2>

        <Link
          to="/banks/create"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded transition flex items-center gap-2 shadow-sm"
        >
          <span>➕</span> Tạo Ngân Hàng Mới
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banks.length === 0 ? (
          <div className="col-span-full text-center py-10 bg-white rounded shadow text-gray-500">
            Bạn chưa có ngân hàng câu hỏi nào. Hãy tạo một cái mới!
          </div>
        ) : (
          banks.map((bank) => (
            <div
              key={bank._id}
              className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition"
            >
              <h3
                className="text-xl font-bold text-gray-800 mb-2 truncate"
                title={bank.title}
              >
                {bank.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
                {bank.description || "Không có mô tả"}
              </p>

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                  {bank.questions?.length || 0} câu hỏi
                </span>
                <button
                  onClick={() => handleDelete(bank._id)}
                  className="text-red-500 hover:text-red-700 text-sm font-semibold"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuestionBankList;
