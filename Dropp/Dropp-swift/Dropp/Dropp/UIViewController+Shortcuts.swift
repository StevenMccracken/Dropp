//
//  UIViewController+Shortcuts.swift
//  Dropp
//
//  Created by Steven McCracken on 12/26/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import UIKit

extension UIViewController {
  
  private var dismissKeyboardGesture: UITapGestureRecognizer {
    let gesture = UITapGestureRecognizer(target: self, action: #selector(dismissKeyboard))
    gesture.cancelsTouchesInView = false
    return gesture
  }
  
  func addDismissKeyboardGesture() {
    view.addGestureRecognizer(dismissKeyboardGesture)
  }
  
  @objc
  func dismissKeyboard() {
    view.endEditing(true)
  }
}
