import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Layouts & Components
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
// Quiz Pages
import QuizDetail from "./pages/Quiz/QuizDetail";
import TakeQuiz from "./pages/Quiz/TakeQuiz";
import QuizResult from "./pages/Quiz/QuizResult";
import MyQuizzes from "./pages/User/MyQuizzes";
import CreateQuiz from "./pages/User/CreateQuiz";
import EditQuiz from "./pages/User/EditQuiz";
import ManageUsers from "./pages/Admin/ManageUsers";
import ModerateQuizzes from "./pages/Admin/ModerateQuizzes";
import CreateQuizManual from "./pages/User/CreateQuizManual";
import History from "./pages/User/History";
import QuestionBankList from "./pages/Bank/QuestionBankList";
import CreateQuestionBank from "./pages/Bank/CreateQuestionBank";
import GenerateQuizFromBank from "./pages/Bank/GenerateQuizFromBank";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Nhóm Route dùng MainLayout (User bình thường) */}
          <Route path="/" element={<MainLayout />}>
            {/* PUBLIC ROUTES (Ai cũng vào được) */}
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            {/* PROTECTED ROUTES (Phải đăng nhập mới vào được) */}
            <Route element={<ProtectedRoute />}>
              <Route path="quizzes/:id" element={<QuizDetail />} />
              <Route path="quizzes/:id/take" element={<TakeQuiz />} />
              <Route path="quizzes/:id/result" element={<QuizResult />} />

              <Route path="my-quizzes" element={<MyQuizzes />} />
              <Route path="my-quizzes/create" element={<CreateQuiz />} />
              <Route path="my-quizzes/edit/:id" element={<EditQuiz />} />

              <Route
                path="my-quizzes/create-manual"
                element={<CreateQuizManual />}
              />
              <Route path="history" element={<History />} />
            </Route>
            <Route path="banks" element={<QuestionBankList />} />
            <Route path="banks/create" element={<CreateQuestionBank />} />
            <Route
              path="my-quizzes/generate"
              element={<GenerateQuizFromBank />}
            />
          </Route>

          {/* Nhóm Route dùng AdminLayout (Chỉ Admin) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<ManageUsers />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="quizzes" element={<ModerateQuizzes />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
