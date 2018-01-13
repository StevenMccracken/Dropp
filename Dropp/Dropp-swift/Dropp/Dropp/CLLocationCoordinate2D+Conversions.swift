//
//  CLLocationCoordinate2D+Conversions.swift
//  Dropp
//
//  Created by Steven McCracken on 6/24/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import Foundation
import CoreLocation

extension CLLocationCoordinate2D {
  
  var toString: String {
    return "\(self.latitude),\(self.longitude)"
  }
}
