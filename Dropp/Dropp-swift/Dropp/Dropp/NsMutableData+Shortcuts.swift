//
//  NsMutableData+Shortcuts.swift
//  Dropp
//
//  Created by Steven McCracken on 6/24/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import Foundation

extension NSMutableData {
  
  func appendString(_ string: String) throws {
    guard let data = string.data(using: String.Encoding.utf8, allowLossyConversion: false) else {
      throw NSError(reason: "Unable to create data from string", details: string)
    }
    
    append(data)
  }
}
