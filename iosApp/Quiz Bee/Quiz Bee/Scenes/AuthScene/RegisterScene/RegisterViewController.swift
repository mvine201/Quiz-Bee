//
//  RegisterViewController.swift
//  Quiz Bee
//
//  Created by Mạc Văn Vinh on 11/4/26.
//

import UIKit

final class RegisterViewController: UIViewController {

    // MARK: - UI
    private let usernameField: UITextField = {
        let tf = UITextField()
        tf.placeholder = "Tên người dùng"
        tf.autocapitalizationType = .none
        tf.autocorrectionType = .no
        tf.backgroundColor = .secondarySystemBackground
        tf.layer.cornerRadius = 10
        tf.leftView = UIView(frame: CGRect(x: 0, y: 0, width: 12, height: 44))
        tf.leftViewMode = .always
        tf.translatesAutoresizingMaskIntoConstraints = false
        return tf
    }()

    private let emailField: UITextField = {
        let tf = UITextField()
        tf.placeholder = "Email"
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

    private let passwordField: UITextField = {
        let tf = UITextField()
        tf.placeholder = "Mật khẩu (≥ 6 ký tự)"
        tf.isSecureTextEntry = true
        tf.textContentType = .newPassword
        tf.backgroundColor = .secondarySystemBackground
        tf.layer.cornerRadius = 10
        tf.leftView = UIView(frame: CGRect(x: 0, y: 0, width: 12, height: 44))
        tf.leftViewMode = .always
        tf.translatesAutoresizingMaskIntoConstraints = false
        return tf
    }()

    private let registerButton: UIButton = {
        let btn = UIButton(type: .system)
        btn.setTitle("Tạo tài khoản", for: .normal)
        btn.backgroundColor = .systemBlue
        btn.setTitleColor(.white, for: .normal)
        btn.titleLabel?.font = .systemFont(ofSize: 17, weight: .semibold)
        btn.layer.cornerRadius = 12
        btn.translatesAutoresizingMaskIntoConstraints = false
        return btn
    }()

    private let errorLabel: UILabel = {
        let lb = UILabel()
        lb.textColor = .systemRed
        lb.numberOfLines = 0
        lb.font = .systemFont(ofSize: 14)
        lb.isHidden = true
        lb.translatesAutoresizingMaskIntoConstraints = false
        return lb
    }()

    private let spinner: UIActivityIndicatorView = {
        let sp = UIActivityIndicatorView(style: .medium)
        sp.hidesWhenStopped = true
        sp.translatesAutoresizingMaskIntoConstraints = false
        return sp
    }()

    private var stack: UIStackView!

    // MARK: - Lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()
        title = "Đăng ký"
        view.backgroundColor = .systemBackground
        navigationItem.rightBarButtonItem = UIBarButtonItem(title: "Đăng nhập", style: .plain, target: self, action: #selector(goToLogin))
        setupUI()
        registerButton.addTarget(self, action: #selector(handleRegister), for: .touchUpInside)
    }

    private func setupUI() {
        stack = UIStackView(arrangedSubviews: [usernameField, emailField, passwordField, registerButton])
        stack.axis = .vertical
        stack.spacing = 12
        stack.translatesAutoresizingMaskIntoConstraints = false

        view.addSubview(stack)
        view.addSubview(errorLabel)
        view.addSubview(spinner)

        NSLayoutConstraint.activate([
            stack.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 24),
            stack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 24),
            stack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -24),

            usernameField.heightAnchor.constraint(equalToConstant: 48),
            emailField.heightAnchor.constraint(equalToConstant: 48),
            passwordField.heightAnchor.constraint(equalToConstant: 48),
            registerButton.heightAnchor.constraint(equalToConstant: 50),

            errorLabel.topAnchor.constraint(equalTo: stack.bottomAnchor, constant: 8),
            errorLabel.leadingAnchor.constraint(equalTo: stack.leadingAnchor),
            errorLabel.trailingAnchor.constraint(equalTo: stack.trailingAnchor),

            spinner.topAnchor.constraint(equalTo: errorLabel.bottomAnchor, constant: 12),
            spinner.centerXAnchor.constraint(equalTo: view.centerXAnchor)
        ])
    }

    // MARK: - Actions
    @objc private func handleRegister() {
        errorLabel.isHidden = true
        let username = usernameField.text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let email = emailField.text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let password = passwordField.text ?? ""
        guard !username.isEmpty, !email.isEmpty, !password.isEmpty else {
            showError("Vui lòng nhập đầy đủ thông tin")
            return
        }
        guard password.count >= 6 else {
            showError("Mật khẩu phải từ 6 ký tự")
            return
        }

        setLoading(true)
        Task {
            do {
                _ = try await AuthAPI.shared.register(username: username, email: email, password: password)
                // Auto login
                let loginResp = try await AuthAPI.shared.login(email: email, password: password)
                UserDefaults.standard.set(loginResp.token, forKey: "authToken")
                await MainActor.run {
                    self.setLoading(false)
                    // Sau khi đăng ký + đăng nhập, chuyển sang tab chính
                    let tab = MainTabBarController()
                    tab.modalPresentationStyle = .fullScreen
                    self.present(tab, animated: true)
                }
            } catch {
                await MainActor.run {
                    self.setLoading(false)
                    if let apiErr = error as? APIError {
                        switch apiErr {
                        case .server(let msg): self.showError(msg)
                        case .unauthorized: self.showError("Không được phép")
                        case .forbidden: self.showError("Tài khoản bị khóa hoặc không có quyền")
                        default: self.showError("Đăng ký thất bại. Vui lòng thử lại.")
                        }
                    } else {
                        self.showError("Lỗi kết nối. Vui lòng thử lại.")
                    }
                }
            }
        }
    }

    @objc private func goToLogin() {
        navigationController?.popViewController(animated: true)
    }

    // MARK: - Helpers
    private func setLoading(_ loading: Bool) {
        usernameField.isEnabled = !loading
        emailField.isEnabled = !loading
        passwordField.isEnabled = !loading
        registerButton.isEnabled = !loading
        loading ? spinner.startAnimating() : spinner.stopAnimating()
    }

    private func showError(_ message: String) {
        errorLabel.text = message
        errorLabel.isHidden = false
    }
}
