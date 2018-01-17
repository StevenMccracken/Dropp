//
//  UIButton+Shortcuts.swift
//  Dropp
//
//  Created by Steven McCracken on 1/16/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import UIKit
import Foundation

extension UIButton {
  
  func toggle(enabled: Bool) {
    isEnabled = enabled
    if enabled {
      layer.borderWidth = 0
      backgroundColor = .salmon
      setTitleColor(.white, for: .normal)
    } else {
      layer.borderWidth = 0.5
      backgroundColor = .white
      setTitleColor(.lightGray, for: .disabled)
    }
  }
}
