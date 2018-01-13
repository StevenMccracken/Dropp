//
//  NSError+Shortcuts.swift
//  Dropp
//
//  Created by Steven McCracken on 1/5/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import Foundation

extension NSError {
  
  convenience init(userInfo: [String: Any]? = nil) {
    self.init(domain: "", code: 0, userInfo: userInfo)
  }
  
  convenience init(reason: String, details: Any? = nil) {
    var userInfo: [String: Any] = ["reason": reason]
    if let details = details {
      userInfo["details"] = details
    }
    
    self.init(userInfo: userInfo)
  }
}
