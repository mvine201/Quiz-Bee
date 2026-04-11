import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Thiếu cấu hình EMAIL_USER hoặc EMAIL_PASS");
    }

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Quiz App AI" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message, // Fallback text
      html: options.html || null, // Nội dung HTML giao diện đẹp
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Send email error:", error.message);
    throw new Error("Gửi email thất bại");
  }
};

export default sendEmail;
