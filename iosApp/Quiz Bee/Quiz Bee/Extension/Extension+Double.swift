//
//  Extension+Double.swift
//  Quiz Bee
//
//  Created by Mạc Văn Vinh on 11/4/26.
//
import Foundation

extension Double {
    var formattedCurrency: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        let text = formatter.string(from: NSNumber(value: self)) ?? "\(self)"
        return "$\(text)"
    }
}
