//
//  UIView+Shortcuts.swift
//  Dropp
//
//  Created by Steven McCracken on 1/10/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import UIKit

extension UIView {
  
  // Animates a view's alpha to a given value. This method is safe to call
  // from any scope, as the animations are guaranteed to run on the main thread
  func animateAlpha(to alpha: CGFloat, duration: TimeInterval, done: (() -> Void)? = nil) {
    DispatchQueue.main.async {
      UIView.animate(withDuration: duration, animations: { () in
        self.alpha = alpha
      }, completion: { _ in
        done?()
      })
    }
  }
  
  // Adds a toolbar with a given list of items to the view's input accessory view.
  // This method only works if the view is some sort of text input view, like a
  // UITextView or UITextField, as those object's input accessory view is not a get-only property
  func addToolbar(withItems items: [UIBarButtonItem], itemsColor tintColor: UIColor = .salmon) {
    guard self is UITextView || self is UITextField else {
      return
    }
    
    let toolbar = UIToolbar()
    toolbar.sizeToFit()
    toolbar.barTintColor = .white
    for item in items {
      item.tintColor = tintColor
    }
    
    toolbar.items = items
    if let textView = self as? UITextView {
      textView.inputAccessoryView = toolbar
    } else if let textField = self as? UITextField {
      textField.inputAccessoryView = toolbar
    }
  }
}
