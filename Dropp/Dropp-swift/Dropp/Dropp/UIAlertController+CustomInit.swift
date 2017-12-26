//
//  UIAlertController+CustomInit.swift
//  Dropp
//
//  Created by Steven McCracken on 12/23/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import Foundation

extension UIAlertController {
  
  public convenience init(title: String?, message: String?, preferredStyle: UIAlertControllerStyle, color: UIColor) {
    self.init(title: title, message: message, preferredStyle: preferredStyle)
    self.view.tintColor = color
    guard let title = title else {
      return
    }
    
    let colorDictionary = [NSAttributedStringKey.foregroundColor: UIColor.salmon]
    self.setValue(NSAttributedString(string: title, attributes: colorDictionary), forKey: "attributedTitle")
  }
}
