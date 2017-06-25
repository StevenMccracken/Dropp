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
    var toLocation: CLLocation {
        let coordinates = self.components(separatedBy: ",").doubleArray
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
        return substring(with: startIndex..<endIndex)
    }
}
