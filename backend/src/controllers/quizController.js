import Quiz from "../models/Quiz.js";
import QuizResult from "../models/QuizResult.js";
import xlsx from "xlsx";
import mammoth from "mammoth";

// helper shuffle
const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);

// 1. 📝 Tạo đề thi
export const createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create({ ...req.body, author: req.user._id });
    res.status(201).json({ message: "Tạo đề thi thành công", quiz });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. ⚡ IMPORT
export const importQuizUniversal = async (req, res) => {
  try {
    const { title, timeLimit, attemptsAllowed } = req.body;
    if (!req.file)
      return res.status(400).json({ message: "Vui lòng chọn file!" });

    let questions = [];
    const fileName = req.file.originalname;

    if (fileName.match(/\.(xlsx|xls)$/)) {
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const data = xlsx.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]],
      );

      questions = data.map((item) => ({
        questionText: item["Câu hỏi"] || item["Question"] || "Câu hỏi trống",
        options: [
          item["A"]?.toString() || "",
          item["B"]?.toString() || "",
          item["C"]?.toString() || "",
          item["D"]?.toString() || "",
        ],
        correctAnswer:
          { A: 0, B: 1, C: 2, D: 3 }[
            item["Đáp án"]?.toString().toUpperCase().trim()
          ] || 0,
        points: parseInt(item["Điểm"]) || 10,
      }));
    } else {
      let rawText = "";
      if (fileName.endsWith(".docx")) {
        const result = await mammoth.extractRawText({
          buffer: req.file.buffer,
        });
        rawText = result.value;
      } else {
        rawText = req.file.buffer.toString("utf8");
      }

      const cleanText = rawText.replace(/[\t\u00A0]/g, " ");
      const lines = cleanText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l !== "");

      let currentQuestion = null;

      // === LOGIC MỚI BẮT ĐẦU TỪ ĐÂY ===
      lines.forEach((line) => {
        // 1. Nhận diện Câu hỏi: Bắt đầu bằng "Câu X:" hoặc "X."
        const qMatch = line.match(/^(?:Câu\s+)?(\d+)[.\:\s-]+\s*(.*)/i);

        // 2. Nhận diện Đáp án: Bắt đầu bằng "A.", "B.", hoặc có dấu "*" ở đầu như "* C."
        const optMatch = line.match(/^(\*?\s*[A-D])[.\:\s-]+\s*(.*)/i);

        if (qMatch && !optMatch) {
          if (currentQuestion) questions.push(currentQuestion);
          currentQuestion = {
            questionText: qMatch[2].trim(),
            options: [],
            correctAnswer: 0,
            points: 10,
          };
        } else if (optMatch) {
          if (currentQuestion) {
            // Kiểm tra xem dòng này có dấu * ở đầu không
            let isCorrect = line.trim().startsWith("*");

            // Cắt bỏ phần chữ cái đầu, chỉ lấy nội dung đáp án
            let optContent = line
              .replace(/^(\*?\s*[A-D])[.\:\s-]+\s*/i, "")
              .trim();

            if (isCorrect) {
              currentQuestion.correctAnswer = currentQuestion.options.length;
            }
            currentQuestion.options.push(optContent);
          }
        } else {
          // 3. XỬ LÝ RỚT DÒNG (Nối chữ vào câu hỏi)
          if (currentQuestion && currentQuestion.options.length === 0) {
            currentQuestion.questionText += " " + line.trim();
          }
        }
      });

      if (currentQuestion) questions.push(currentQuestion);
      // === KẾT THÚC LOGIC MỚI ===
    }

    if (questions.length === 0)
      return res
        .status(400)
        .json({ message: "Không tìm thấy câu hỏi đúng định dạng!" });

    const quiz = await Quiz.create({
      title: title || "Đề thi Import " + new Date().toLocaleDateString(),
      timeLimit: parseInt(timeLimit) || 15,
      attemptsAllowed: parseInt(attemptsAllowed) || 0,
      questions,
      author: req.user._id,
      isPublic: true,
    });

    res.status(201).json({
      message: `Import thành công ${questions.length} câu`,
      quiz,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// API: Đọc file để Preview (KHÔNG lưu vào Database)
export const parseFilePreview = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Vui lòng tải lên file!" });

    let questions = [];
    const fileName = req.file.originalname;

    if (fileName.match(/\.(xlsx|xls)$/)) {
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const data = xlsx.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]],
      );

      questions = data.map((item) => ({
        questionText: item["Câu hỏi"] || item["Question"] || "Câu hỏi trống",
        options: [
          item["A"]?.toString() || "",
          item["B"]?.toString() || "",
          item["C"]?.toString() || "",
          item["D"]?.toString() || "",
        ],
        correctAnswer:
          { A: 0, B: 1, C: 2, D: 3 }[
            item["Đáp án"]?.toString().toUpperCase().trim()
          ] || 0,
        points: parseInt(item["Điểm"]) || 10,
      }));
    } else {
      let rawText = "";
      if (fileName.endsWith(".docx")) {
        const result = await mammoth.extractRawText({
          buffer: req.file.buffer,
        });
        rawText = result.value;
      } else {
        rawText = req.file.buffer.toString("utf8");
      }

      const cleanText = rawText.replace(/[\t\u00A0]/g, " ");
      const lines = cleanText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l !== "");

      let currentQuestion = null;

      // === LOGIC MỚI BẮT ĐẦU TỪ ĐÂY ===
      lines.forEach((line) => {
        const qMatch = line.match(/^(?:Câu\s+)?(\d+)[.\:\s-]+\s*(.*)/i);
        const optMatch = line.match(/^(\*?\s*[A-D])[.\:\s-]+\s*(.*)/i);

        if (qMatch && !optMatch) {
          if (currentQuestion) questions.push(currentQuestion);
          currentQuestion = {
            questionText: qMatch[2].trim(),
            options: [],
            correctAnswer: 0,
            points: 10,
          };
        } else if (optMatch) {
          if (currentQuestion) {
            let isCorrect = line.trim().startsWith("*");
            let optContent = line
              .replace(/^(\*?\s*[A-D])[.\:\s-]+\s*/i, "")
              .trim();

            if (isCorrect) {
              currentQuestion.correctAnswer = currentQuestion.options.length;
            }
            currentQuestion.options.push(optContent);
          }
        } else {
          if (currentQuestion && currentQuestion.options.length === 0) {
            currentQuestion.questionText += " " + line.trim();
          }
        }
      });

      if (currentQuestion) questions.push(currentQuestion);
      // === KẾT THÚC LOGIC MỚI ===
    }

    if (questions.length === 0)
      return res
        .status(400)
        .json({ message: "Không tìm thấy câu hỏi đúng định dạng!" });

    res.status(200).json({
      message: `Đọc thành công ${questions.length} câu`,
      questions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. 📂 My quizzes
export const getMyQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ author: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. 🌍 Public
export const getPublicQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isPublic: true, status: "approved" })
      .populate("author", "username")
      .select("-questions")
      .sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 5. 🔍 Chi tiết (FIX quyền)
export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Không tìm thấy" });

    // CÁC ĐIỀU KIỆN ĐƯỢC PHÉP XEM:
    const isAuthor = quiz.author.toString() === req.user._id.toString(); // Là người tạo
    const isAdmin = req.user.role === "admin"; // Là Admin
    const isApprovedPublic = quiz.isPublic && quiz.status === "approved"; // Là đề Public + Đã duyệt

    // Nếu không thuộc 3 đối tượng trên -> CẤM
    if (!isAuthor && !isAdmin && !isApprovedPublic) {
      return res
        .status(403)
        .json({ message: "Đề thi này đang chờ duyệt hoặc ở chế độ riêng tư!" });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. ✏️ UPDATE (FIX quyền)
export const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) return res.status(404).json({ message: "Không tìm thấy" });

    if (quiz.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Không có quyền" });
    }

    const updated = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. 🗑️ DELETE (FIX quyền)
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) return res.status(404).json({ message: "Không tìm thấy" });

    if (quiz.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Không có quyền" });
    }

    await quiz.deleteOne();
    res.json({ message: "Đã xóa" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 8. ✍️ Làm bài (FIX shuffle)
export const getQuizForTake = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select(
      "-questions.correctAnswer",
    );
    if (!quiz) return res.status(404).json({ message: "Không tìm thấy" });

    // KIỂM TRA QUYỀN LÀM BÀI NHƯ BƯỚC XEM CHI TIẾT
    const isAuthor = quiz.author.toString() === req.user._id.toString();
    const isApprovedPublic = quiz.isPublic && quiz.status === "approved";

    if (!isAuthor && !isApprovedPublic) {
      return res
        .status(403)
        .json({ message: "Đề thi chưa được duyệt, không thể làm bài!" });
    }

    if (quiz.attemptsAllowed > 0) {
      const attempts = await QuizResult.countDocuments({
        user: req.user._id,
        quiz: quiz._id,
      });

      if (attempts >= quiz.attemptsAllowed) {
        return res.status(403).json({ message: "Hết lượt thi" });
      }
    }

    let quizData = quiz.toObject();

    if (quizData.shuffleQuestions) {
      quizData.questions = shuffleArray(quizData.questions);
    }

    if (quizData.shuffleAnswers) {
      quizData.questions = quizData.questions.map((q) => ({
        ...q,
        options: shuffleArray(q.options),
      }));
    }

    res.json(quizData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 9. 🎯 Submit
export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) return res.status(404).json({ message: "Không tìm thấy" });

    let total = 0;
    let max = 0;
    let correct = 0;

    const userAnswers = quiz.questions.map((q) => {
      max += q.points;

      const userAnswer = answers.find((a) => a.questionId === q._id.toString());

      // LOGIC MỚI: Chấm điểm bằng Text thay vì bằng Index
      let isCorrect = false;
      if (userAnswer) {
        if (userAnswer.selectedText) {
          // Lấy text đáp án đúng gốc từ DB ra để so sánh với text gửi lên
          const correctText = q.options[q.correctAnswer];
          isCorrect = userAnswer.selectedText === correctText;
        } else {
          // Dự phòng nếu không có text gửi lên
          isCorrect = userAnswer.selectedOption === q.correctAnswer;
        }
      }

      if (isCorrect) {
        correct++;
        total += q.points;
      }

      return {
        questionId: q._id,
        selectedOption: userAnswer?.selectedOption ?? null,
        isCorrect,
      };
    });

    const finalScore = max > 0 ? Number(((total / max) * 10).toFixed(2)) : 0;

    const result = await QuizResult.create({
      user: req.user._id,
      quiz: quiz._id,
      score: finalScore,
      correctCount: correct,
      totalQuestions: quiz.questions.length,
      userAnswers,
    });

    res.json({
      message: "Nộp bài thành công",
      result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Thêm vào backend/controllers/quizController.js
export const getMyHistory = async (req, res) => {
  try {
    const results = await QuizResult.find({ user: req.user._id })
      .populate("quiz", "title")
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Lấy lịch sử làm bài của User
export const getUserHistory = async (req, res) => {
  try {
    // Tìm tất cả kết quả của user này, map thêm tên Đề thi từ bảng Quiz, sắp xếp mới nhất lên đầu
    const results = await QuizResult.find({ user: req.user._id })
      .populate("quiz", "title")
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
