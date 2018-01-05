//
//  String+Shortcuts.swift
//  Dropp
//
//  Created by Steven McCracken on 6/24/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import Foundation
import CoreLocation

extension String {
  
  var isOnlyEmoji: Bool {
    return !isEmpty && !unicodeScalars.contains(where: {
      !$0.isEmoji && !$0.isZeroWidthJoiner
    })
  }
  
  func toLocation() throws -> CLLocation {
    let coordinates = self.components(separatedBy: ",").doubleArray
    guard coordinates.count >= 2 else {
      throw NSError.init(domain: "", code: 0, userInfo: ["reason": "Not enough coordinates in the string", "details": coordinates])
    }
    
    return CLLocation(latitude: coordinates[0], longitude: coordinates[1])
  }
  
  func trim() -> String {
    return self.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines)
  }
  
  func index(from: Int) -> Index {
    return self.index(startIndex, offsetBy: from)
  }
  
  func substring(with r: Range<Int>) -> String {
    let startIndex = index(from: r.lowerBound)
    let endIndex = index(from: r.upperBound)
    return String(self[startIndex ..< endIndex])
  }
  
  func truncate(toLimit limit: Int, addElipses: Bool = true) -> String {
    var truncated = self
    if self.count > limit {
      let maxIndex = self.index(self.endIndex, offsetBy: limit - self.count)
      truncated = String(self[..<maxIndex]) + (addElipses ? "..." : "")
    }
    
    return truncated
  }
}
