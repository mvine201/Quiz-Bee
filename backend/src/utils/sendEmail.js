import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  try {
    const emailUser = process.env.EMAIL_USER?.trim();
    const emailPass = process.env.EMAIL_PASS?.replace(/\s+/g, "");

    if (!emailUser || !emailPass) {
      throw new Error("Thiếu cấu hình EMAIL_USER hoặc EMAIL_PASS");
    }

    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpHost = process.env.SMTP_HOST?.trim();

    const transporter = nodemailer.createTransport({
      ...(smtpHost
        ? {
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
          }
        : { service: "gmail" }),
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Quiz App AI" <${emailUser}>`,
      to: options.email,
      subject: options.subject,
      text: options.message, // Fallback text
      html: options.html || null, // Nội dung HTML giao diện đẹp
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Send email error:", error);
    throw new Error("Gửi email thất bại");
  }
};

export default sendEmail;
