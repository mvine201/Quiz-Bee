import { createContext, useState, useEffect } from "react";

// Tạo Context
export const AuthContext = createContext();

// Tạo Provider để bọc quanh App
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kiểm tra xem có user trong localStorage không khi load lại trang
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Hàm xử lý khi login thành công
  const loginContext = (userData, token) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
  };

  // Hàm xử lý đăng xuất
  const logoutContext = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login"; // Bắn về trang login
  };

  return (
    <AuthContext.Provider
      value={{ user, loginContext, logoutContext, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
