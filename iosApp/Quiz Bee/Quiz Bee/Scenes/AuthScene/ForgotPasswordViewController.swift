import UIKit

final class ForgotPasswordViewController: UIViewController {

    private enum Step: Int { case email = 0, code, reset }

    private var current: Step = .email { didSet { updateStepUI() } }

    private let stepLabel: UILabel = {
        let lb = UILabel()
        lb.font = .systemFont(ofSize: 20, weight: .semibold)
        lb.textAlignment = .center
        lb.translatesAutoresizingMaskIntoConstraints = false
        return lb
    }()

    private let emailField: UITextField = {
        let tf = UITextField()
        tf.placeholder = "Nhập email"
        tf.keyboardType = .emailAddress
        tf.autocapitalizationType = .none
        tf.autocorrectionType = .no
        tf.backgroundColor = .secondarySystemBackground
        tf.layer.cornerRadius = 10
        tf.leftView = UIView(frame: CGRect(x: 0, y: 0, width: 12, height: 44))
        tf.leftViewMode = .always
        tf.translatesAutoresizingMaskIntoConstraints = false
        return tf
    }()

    private let sendCodeButton: UIButton = {
        let btn = UIButton(type: .system)
        btn.setTitle("Gửi mã", for: .normal)
        btn.backgroundColor = .systemBlue
        btn.setTitleColor(.white, for: .normal)
        btn.layer.cornerRadius = 12
        btn.translatesAutoresizingMaskIntoConstraints = false
        return btn
    }()

    private let codeField: UITextField = {
        let tf = UITextField()
        tf.placeholder = "Nhập mã OTP"
        tf.keyboardType = .numberPad
        tf.backgroundColor = .secondarySystemBackground
        tf.layer.cornerRadius = 10
        tf.leftView = UIView(frame: CGRect(x: 0, y: 0, width: 12, height: 44))
        tf.leftViewMode = .always
        tf.translatesAutoresizingMaskIntoConstraints = false
        return tf
    }()

    private let verifyButton: UIButton = {
        let btn = UIButton(type: .system)
        btn.setTitle("Xác nhận mã", for: .normal)
        btn.backgroundColor = .systemBlue
        btn.setTitleColor(.white, for: .normal)
        btn.layer.cornerRadius = 12
        btn.translatesAutoresizingMaskIntoConstraints = false
        return btn
    }()

    private let newPasswordField: UITextField = {
        let tf = UITextField()
        tf.placeholder = "Mật khẩu mới (≥ 6 ký tự)"
        tf.isSecureTextEntry = true
        tf.textContentType = .newPassword
        tf.backgroundColor = .secondarySystemBackground
        tf.layer.cornerRadius = 10
        tf.leftView = UIView(frame: CGRect(x: 0, y: 0, width: 12, height: 44))
        tf.leftViewMode = .always
        tf.translatesAutoresizingMaskIntoConstraints = false
        return tf
    }()

    private let resetButton: UIButton = {
        let btn = UIButton(type: .system)
        btn.setTitle("Đặt lại mật khẩu", for: .normal)
        btn.backgroundColor = .systemBlue
        btn.setTitleColor(.white, for: .normal)
        btn.layer.cornerRadius = 12
        btn.translatesAutoresizingMaskIntoConstraints = false
        return btn
    }()

    private let messageLabel: UILabel = {
        let lb = UILabel()
        lb.textColor = .secondaryLabel
        lb.numberOfLines = 0
        lb.textAlignment = .center
        lb.translatesAutoresizingMaskIntoConstraints = false
        return lb
    }()

    private let spinner: UIActivityIndicatorView = {
        let sp = UIActivityIndicatorView(style: .medium)
        sp.hidesWhenStopped = true
        sp.translatesAutoresizingMaskIntoConstraints = false
        return sp
    }()

    private var emailStack: UIStackView!
    private var codeStack: UIStackView!
    private var resetStack: UIStackView!

    // MARK: - Lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()
        title = "Quên mật khẩu"
        view.backgroundColor = .systemBackground
        setupUI()
        sendCodeButton.addTarget(self, action: #selector(handleSendCode), for: .touchUpInside)
        verifyButton.addTarget(self, action: #selector(handleVerify), for: .touchUpInside)
        resetButton.addTarget(self, action: #selector(handleReset), for: .touchUpInside)
        updateStepUI()
    }

    private func setupUI() {
        emailStack = UIStackView(arrangedSubviews: [emailField, sendCodeButton])
        emailStack.axis = .vertical
        emailStack.spacing = 12
        emailStack.translatesAutoresizingMaskIntoConstraints = false

        codeStack = UIStackView(arrangedSubviews: [codeField, verifyButton])
        codeStack.axis = .vertical
        codeStack.spacing = 12
        codeStack.translatesAutoresizingMaskIntoConstraints = false

        resetStack = UIStackView(arrangedSubviews: [newPasswordField, resetButton])
        resetStack.axis = .vertical
        resetStack.spacing = 12
        resetStack.translatesAutoresizingMaskIntoConstraints = false

        view.addSubview(stepLabel)
        view.addSubview(emailStack)
        view.addSubview(codeStack)
        view.addSubview(resetStack)
        view.addSubview(messageLabel)
        view.addSubview(spinner)

        NSLayoutConstraint.activate([
            stepLabel.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 20),
            stepLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 24),
            stepLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -24),

            emailStack.topAnchor.constraint(equalTo: stepLabel.bottomAnchor, constant: 20),
            emailStack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 24),
            emailStack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -24),

            codeStack.topAnchor.constraint(equalTo: stepLabel.bottomAnchor, constant: 20),
            codeStack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 24),
            codeStack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -24),

            resetStack.topAnchor.constraint(equalTo: stepLabel.bottomAnchor, constant: 20),
            resetStack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 24),
            resetStack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -24),

            emailField.heightAnchor.constraint(equalToConstant: 48),
            codeField.heightAnchor.constraint(equalToConstant: 48),
            newPasswordField.heightAnchor.constraint(equalToConstant: 48),

            sendCodeButton.heightAnchor.constraint(equalToConstant: 50),
            verifyButton.heightAnchor.constraint(equalToConstant: 50),
            resetButton.heightAnchor.constraint(equalToConstant: 50),

            messageLabel.topAnchor.constraint(equalTo: resetStack.bottomAnchor, constant: 16),
            messageLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 24),
            messageLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -24),

            spinner.topAnchor.constraint(equalTo: messageLabel.bottomAnchor, constant: 12),
            spinner.centerXAnchor.constraint(equalTo: view.centerXAnchor)
        ])
    }

    private func updateStepUI() {
        switch current {
        case .email:
            stepLabel.text = "Bước 1/3: Nhập email để nhận mã"
            emailStack.isHidden = false
            codeStack.isHidden = true
            resetStack.isHidden = true
        case .code:
            stepLabel.text = "Bước 2/3: Nhập mã OTP"
            emailStack.isHidden = true
            codeStack.isHidden = false
            resetStack.isHidden = true
        case .reset:
            stepLabel.text = "Bước 3/3: Đặt mật khẩu mới"
            emailStack.isHidden = true
            codeStack.isHidden = true
            resetStack.isHidden = false
        }
        messageLabel.text = nil
    }

    private func setLoading(_ loading: Bool) {
        [emailField, sendCodeButton, codeField, verifyButton, newPasswordField, resetButton].forEach { $0.isUserInteractionEnabled = !loading }
        loading ? spinner.startAnimating() : spinner.stopAnimating()
    }

    @objc private func handleSendCode() {
        let email = emailField.text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        guard !email.isEmpty else { messageLabel.text = "Vui lòng nhập email"; return }
        setLoading(true)
        Task {
            do {
                let resp = try await AuthAPI.shared.forgotPassword(email: email)
                await MainActor.run {
                    self.setLoading(false)
                    self.messageLabel.text = resp.message
                    self.current = .code
                }
            } catch {
                await MainActor.run {
                    self.setLoading(false)
                    self.messageLabel.text = (error as? APIError).flatMap { if case let .server(msg) = $0 { return msg } else { return nil } } ?? "Không thể gửi mã. Vui lòng thử lại."
                }
            }
        }
    }

    @objc private func handleVerify() {
        let code = codeField.text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        guard !code.isEmpty else { messageLabel.text = "Vui lòng nhập mã"; return }
        setLoading(true)
        Task {
            do {
                let resp = try await AuthAPI.shared.verifyOTP(token: code)
                await MainActor.run {
                    self.setLoading(false)
                    self.messageLabel.text = resp.message
                    self.current = .reset
                }
            } catch {
                await MainActor.run {
                    self.setLoading(false)
                    self.messageLabel.text = (error as? APIError).flatMap { if case let .server(msg) = $0 { return msg } else { return nil } } ?? "Mã không hợp lệ hoặc đã hết hạn"
                }
            }
        }
    }

    @objc private func handleReset() {
        let code = codeField.text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let newPass = newPasswordField.text ?? ""
        guard !code.isEmpty, newPass.count >= 6 else {
            messageLabel.text = "Vui lòng nhập mã và mật khẩu (≥ 6 ký tự)"
            return
        }
        setLoading(true)
        Task {
            do {
                let resp = try await AuthAPI.shared.resetPassword(token: code, newPassword: newPass)
                await MainActor.run {
                    self.setLoading(false)
                    self.messageLabel.text = resp.message
                    self.dismiss(animated: true)
                }
            } catch {
                await MainActor.run {
                    self.setLoading(false)
                    self.messageLabel.text = (error as? APIError).flatMap { if case let .server(msg) = $0 { return msg } else { return nil } } ?? "Không thể đặt lại mật khẩu"
                }
            }
        }
    }
}
