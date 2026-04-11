import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

const AdminLayout = () => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // Đợi Context load xong user từ localStorage
  if (loading)
    return (
      <div className="text-center mt-20">Đang kiểm tra quyền truy cập...</div>
    );

  // Nếu chưa đăng nhập hoặc không phải admin thì đá về trang chủ
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Hàm check active menu
  const isActive = (path) =>
    location.pathname.includes(path)
      ? "bg-blue-800 border-l-4 border-yellow-400"
      : "hover:bg-blue-700 border-l-4 border-transparent";

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6 text-center border-b border-blue-800">
          <h2 className="text-2xl font-black text-yellow-400">ADMIN PANEL</h2>
          <p className="text-sm text-blue-200 mt-1">
            Xin chào, {user.username}
          </p>
        </div>
        <nav className="flex-1 mt-6 flex flex-col space-y-1">
          <Link
            to="/admin/users"
            className={`px-6 py-4 transition-colors ${isActive("/admin/users")}`}
          >
            👥 Quản lý Người dùng
          </Link>
          <Link
            to="/admin/quizzes"
            className={`px-6 py-4 transition-colors ${isActive("/admin/quizzes")}`}
          >
            📝 Kiểm duyệt Đề thi
          </Link>
        </nav>
        <div className="p-4">
          <Link
            to="/"
            className="block w-full text-center bg-gray-800 hover:bg-gray-700 py-2 rounded transition"
          >
            ⬅️ Về Trang Chủ
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
