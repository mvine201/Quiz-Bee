//
//  LoginViewController.swift
//  Quiz Bee
//
//  Created by Mạc Văn Vinh on 11/4/26.
//

import UIKit

final class LoginViewController: UIViewController {

    // MARK: - UI
    private let logoImageView: UIImageView = {
        let iv = UIImageView(image: UIImage(systemName: "person.circle.fill"))
        iv.tintColor = .systemBlue
        iv.contentMode = .scaleAspectFit
        iv.translatesAutoresizingMaskIntoConstraints = false
        return iv
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
        tf.placeholder = "Mật khẩu"
        tf.isSecureTextEntry = true
        tf.textContentType = .password
        tf.backgroundColor = .secondarySystemBackground
        tf.layer.cornerRadius = 10
        tf.leftView = UIView(frame: CGRect(x: 0, y: 0, width: 12, height: 44))
        tf.leftViewMode = .always
        tf.translatesAutoresizingMaskIntoConstraints = false
        return tf
    }()

    private let loginButton: UIButton = {
        let btn = UIButton(type: .system)
        btn.setTitle("Đăng nhập", for: .normal)
        btn.backgroundColor = .systemBlue
        btn.setTitleColor(.white, for: .normal)
        btn.titleLabel?.font = .systemFont(ofSize: 17, weight: .semibold)
        btn.layer.cornerRadius = 12
        btn.translatesAutoresizingMaskIntoConstraints = false
        return btn
    }()

    private let registerButton: UIButton = {
        let btn = UIButton(type: .system)
        btn.setTitle("Chưa có tài khoản? Đăng ký", for: .normal)
        btn.translatesAutoresizingMaskIntoConstraints = false
        return btn
    }()

    private let forgotButton: UIButton = {
        let btn = UIButton(type: .system)
        btn.setTitle("Quên mật khẩu?", for: .normal)
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
        view.backgroundColor = .systemBackground
        title = "Đăng nhập"
        setupUI()
        setupActions()
    }

    // MARK: - Setup
    private func setupUI() {
        stack = UIStackView(arrangedSubviews: [emailField, passwordField, loginButton, forgotButton, registerButton])
        stack.axis = .vertical
        stack.spacing = 12
        stack.translatesAutoresizingMaskIntoConstraints = false

        view.addSubview(logoImageView)
        view.addSubview(stack)
        view.addSubview(errorLabel)
        view.addSubview(spinner)

        NSLayoutConstraint.activate([
            logoImageView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 40),
            logoImageView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            logoImageView.heightAnchor.constraint(equalToConstant: 80),
            logoImageView.widthAnchor.constraint(equalToConstant: 80),

            stack.topAnchor.constraint(equalTo: logoImageView.bottomAnchor, constant: 24),
            stack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 24),
            stack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -24),

            emailField.heightAnchor.constraint(equalToConstant: 48),
            passwordField.heightAnchor.constraint(equalToConstant: 48),
            loginButton.heightAnchor.constraint(equalToConstant: 50),

            errorLabel.topAnchor.constraint(equalTo: stack.bottomAnchor, constant: 8),
            errorLabel.leadingAnchor.constraint(equalTo: stack.leadingAnchor),
            errorLabel.trailingAnchor.constraint(equalTo: stack.trailingAnchor),

            spinner.topAnchor.constraint(equalTo: errorLabel.bottomAnchor, constant: 12),
            spinner.centerXAnchor.constraint(equalTo: view.centerXAnchor)
        ])
    }

    private func setupActions() {
        loginButton.addTarget(self, action: #selector(handleLogin), for: .touchUpInside)
        registerButton.addTarget(self, action: #selector(handleRegister), for: .touchUpInside)
        forgotButton.addTarget(self, action: #selector(handleForgot), for: .touchUpInside)
    }

    // MARK: - Actions
    @objc private func handleLogin() {
        errorLabel.isHidden = true
        let email = emailField.text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let password = passwordField.text ?? ""
        guard !email.isEmpty, !password.isEmpty else {
            showError("Vui lòng nhập email và mật khẩu")
            return
        }
        setLoading(true)

        Task {
            do {
                let response = try await AuthAPI.shared.login(email: email, password: password)
                // Lưu token tạm thời
                UserDefaults.standard.set(response.token, forKey: "authToken")
                await MainActor.run {
                    self.setLoading(false)
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
                        default: self.showError("Đăng nhập thất bại. Vui lòng thử lại.")
                        }
                    } else {
                        self.showError("Lỗi kết nối. Vui lòng thử lại.")
                    }
                }
            }
        }
    }

    @objc private func handleRegister() {
        let vc = RegisterViewController()
        navigationController?.pushViewController(vc, animated: true)
    }

    @objc private func handleForgot() {
        let vc = ForgotPasswordViewController()
        let nav = UINavigationController(rootViewController: vc)
        nav.modalPresentationStyle = .formSheet
        present(nav, animated: true)
    }

    // MARK: - Helpers
    private func setLoading(_ loading: Bool) {
        emailField.isEnabled = !loading
        passwordField.isEnabled = !loading
        loginButton.isEnabled = !loading
        forgotButton.isEnabled = !loading
        registerButton.isEnabled = !loading
        loading ? spinner.startAnimating() : spinner.stopAnimating()
    }

    private func showError(_ message: String) {
        errorLabel.text = message
        errorLabel.isHidden = false
    }
}
