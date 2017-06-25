//
//  Collections+Shortcuts.swift
//  Dropp
//
//  Created by Steven McCracken on 6/24/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import Foundation

extension Collection where Iterator.Element == String {
    var doubleArray: [Double] {
        return flatMap{ Double($0) }
    }
}
