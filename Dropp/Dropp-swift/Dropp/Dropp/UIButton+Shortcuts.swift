//
//  UIButton+Shortcuts.swift
//  Dropp
//
//  Created by Steven McCracken on 1/16/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import UIKit

extension UIButton {
  
  func toggle(enabled: Bool, withTitle title: String? = nil) {
    isEnabled = enabled
    var controlState: UIControlState
    if enabled {
      layer.borderWidth = 0
      controlState = .normal
      backgroundColor = .salmon
      setTitleColor(.white, for: .normal)
    } else {
      layer.borderWidth = 0.5
      controlState = .disabled
      backgroundColor = .white
      setTitleColor(.lightGray, for: .disabled)
    }
    
    if let title = title {
      setTitle(title, for: controlState)
    }
  }
}
