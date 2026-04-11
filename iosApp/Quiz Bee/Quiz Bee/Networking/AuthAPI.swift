//
//  AuthAPI.swift
//  Quiz Bee
//
//  Created by Assistant on 11/4/26.
//

import Foundation

// MARK: - Errors
public enum APIError: Error, LocalizedError {
    case invalidURL
    case decodingFailed
    case server(String)
    case unauthorized
    case forbidden

    public var errorDescription: String? {
        switch self {
        case .invalidURL: return "URL không hợp lệ"
        case .decodingFailed: return "Không đọc được dữ liệu"
        case .server(let msg): return msg
        case .unauthorized: return "Không được phép"
        case .forbidden: return "Bị từ chối truy cập"
        }
    }
}

// MARK: - Configuration
public struct APIConfig {
    // TODO: Cập nhật baseURL theo server của bạn, ví dụ: "https://api.your-domain.com"
    public static let baseURL: String = "http://localhost:5001"

    public static var jsonHeaders: [String: String] {
        [
            "Content-Type": "application/json",
            "Accept": "application/json"
        ]
    }
}

// MARK: - Models
public struct AuthUser: Codable {
    public let id: String
    public let username: String
    public let email: String?
    public let role: String?
}

public struct LoginResponse: Codable {
    public let token: String
    public let user: AuthUser
}

public struct RegisterResponse: Codable {
    public let message: String
    public let user: AuthUser?
}

public struct MessageResponse: Codable {
    public let message: String
}

// MARK: - API
public final class AuthAPI {
    public static let shared = AuthAPI()
    private init() {}

    private let session: URLSession = .shared

    // Đăng ký
    public func register(username: String, email: String, password: String) async throws -> RegisterResponse {
        let url = try makeURL(path: "/api/auth/register")
        let body = RegisterBody(username: username, email: email, password: password)
        let request = makeJSONRequest(url: url, method: "POST", body: body)
        return try await perform(request)
    }

    // Đăng nhập
    public func login(email: String, password: String) async throws -> LoginResponse {
        let url = try makeURL(path: "/api/auth/login")
        let body = LoginBody(email: email, password: password)
        let request = makeJSONRequest(url: url, method: "POST", body: body)
        return try await perform(request)
    }

    // Quên mật khẩu - gửi mã OTP
    public func forgotPassword(email: String) async throws -> MessageResponse {
        let url = try makeURL(path: "/api/auth/forgot-password")
        let body = EmailBody(email: email)
        let request = makeJSONRequest(url: url, method: "POST", body: body)
        return try await perform(request)
    }

    // Xác minh OTP
    public func verifyOTP(token: String) async throws -> MessageResponse {
        let url = try makeURL(path: "/api/auth/verify-otp/\(token)")
        let request = makeRequest(url: url, method: "GET")
        return try await perform(request)
    }

    // Đặt lại mật khẩu
    public func resetPassword(token: String, newPassword: String) async throws -> MessageResponse {
        let url = try makeURL(path: "/api/auth/reset-password/\(token)")
        let body = ResetBody(password: newPassword)
        let request = makeJSONRequest(url: url, method: "POST", body: body)
        return try await perform(request)
    }
}

// MARK: - Private helpers
private extension AuthAPI {
    struct RegisterBody: Encodable { let username: String; let email: String; let password: String }
    struct LoginBody: Encodable { let email: String; let password: String }
    struct EmailBody: Encodable { let email: String }
    struct ResetBody: Encodable { let password: String }

    func makeURL(path: String) throws -> URL {
        // Đảm bảo không bị thừa/thiếu dấu '/'
        let base = APIConfig.baseURL.hasSuffix("/") ? String(APIConfig.baseURL.dropLast()) : APIConfig.baseURL
        let full = base + path
        guard let url = URL(string: full) else { throw APIError.invalidURL }
        return url
    }

    func makeRequest(url: URL, method: String) -> URLRequest {
        var request = URLRequest(url: url)
        request.httpMethod = method
        APIConfig.jsonHeaders.forEach { request.setValue($0.value, forHTTPHeaderField: $0.key) }
        return request
    }

    func makeJSONRequest<T: Encodable>(url: URL, method: String, body: T) -> URLRequest {
        var request = makeRequest(url: url, method: method)
        let encoder = JSONEncoder()
        request.httpBody = try? encoder.encode(body)
        return request
    }

    func perform<T: Decodable>(_ request: URLRequest) async throws -> T {
        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw APIError.server("Không có phản hồi từ máy chủ")
        }
        let decoder = JSONDecoder()
        if (200...299).contains(http.statusCode) {
            do {
                return try decoder.decode(T.self, from: data)
            } catch {
                throw APIError.decodingFailed
            }
        } else {
            if http.statusCode == 401 { throw APIError.unauthorized }
            if http.statusCode == 403 { throw APIError.forbidden }
            if let err = try? decoder.decode(MessageResponse.self, from: data) {
                throw APIError.server(err.message)
            } else {
                throw APIError.server("Lỗi không xác định (\(http.statusCode))")
            }
        }
    }
}
