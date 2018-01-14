//
//  UINavigationController+Shortcuts.swift
//  Dropp
//
//  Created by Steven McCracken on 1/12/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import UIKit
import Foundation

extension UINavigationController {
  
  convenience init(rootViewController: UIViewController, customize: Bool = false) {
    self.init(rootViewController: rootViewController)
    guard customize else {
      return
    }
    
    navigationBar.tintColor = .salmon
    navigationBar.prefersLargeTitles = true
  }
}
