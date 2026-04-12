import axiosClient from "./axiosClient";

const adminApi = {
  // Lấy danh sách user (hỗ trợ tìm kiếm)
  getAllUsers: (keyword = "") => {
    return axiosClient.get(`/admin/users?keyword=${keyword}`);
  },

  // Khóa / Mở khóa user
  toggleUserStatus: (id) => {
    return axiosClient.put(`/admin/users/${id}/toggle-status`);
  },

  // Lấy danh sách đề thi đang chờ duyệt
  getPendingQuizzes: () => {
    return axiosClient.get("/admin/quizzes/pending");
  },

  // Duyệt hoặc Từ chối đề thi
  moderateQuiz: (id, action) => {
    // action có giá trị là "approve" hoặc "reject"
    return axiosClient.put(`/admin/quizzes/${id}/moderate`, { action });
  },
  getDashboardStats: () => {
    return axiosClient.get("/admin/stats");
  },
};

export default adminApi;
