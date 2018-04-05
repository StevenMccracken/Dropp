//
//  Logger.swift
//  Dropp
//
//  Created by Steven McCracken on 4/5/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import Foundation

class Logger {
  
  class func log(_ message: String) {
    if Platform.isSimulator {
      debugPrint(message)
    }
  }
}
