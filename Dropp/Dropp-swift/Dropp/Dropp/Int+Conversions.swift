//
//  Int+Conversions.swift
//  Dropp
//
//  Created by Steven McCracken on 6/24/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import Foundation

extension Int {
  
  var degreesToRadians: Double {
    return Double(self) * .pi / 180
  }
}
