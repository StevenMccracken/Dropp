//
//  UIView+Shortcuts.swift
//  Dropp
//
//  Created by Steven McCracken on 1/10/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import UIKit
import Foundation

extension UIView {
  
  // Animates a view's alpha to a given value. This method is safe to call
  // from any scope, as the animations are guaranteed to run on the main thread
  func animateAlpha(to alpha: CGFloat, duration: TimeInterval) {
    DispatchQueue.main.async {
      UIView.animate(withDuration: duration, animations: { () in
        self.alpha = alpha
      })
    }
  }
}
