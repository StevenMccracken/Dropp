//
//  Double+Shortcuts.swift
//  Dropp
//
//  Created by Steven McCracken on 6/24/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import Foundation

extension Double {
  
  var toRadians: Double {
    return self * .pi / 180
  }
  
  var toDegrees: Double {
    return self * 180 / .pi
  }
  
  var metersToFeet: Double {
    return self * 3.280839895
  }
  
  var metersToMiles: Double {
    return self * 0.00062137
  }
  
  var feetToMiles: Double {
    return self / 5280
  }
  
  /// Rounds the double to decimal places value
  func roundTo(places: Int) -> Double {
    let divisor = pow(10.0, Double(places))
    return (self * divisor).rounded() / divisor
  }
}
