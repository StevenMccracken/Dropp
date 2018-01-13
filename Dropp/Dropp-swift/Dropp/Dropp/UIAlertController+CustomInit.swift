//
//  UIAlertController+CustomInit.swift
//  Dropp
//
//  Created by Steven McCracken on 12/23/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import UIKit
import Foundation

extension UIAlertController {
  
  public convenience init(title: String?, message: String?, preferredStyle: UIAlertControllerStyle, addDefaultAction: Bool = false, andCompletionHandler completionHandler: ((UIAlertAction) -> ())? = nil) {
    self.init(title: title, message: message, preferredStyle: preferredStyle)
    if addDefaultAction {
      self.addDefaultAction(withCompletion: completionHandler)
    }
  }
  
  public convenience init(title: String?, message: String?, preferredStyle: UIAlertControllerStyle, color: UIColor, addDefaultAction: Bool = false, andCompletionHandler completionHandler: ((UIAlertAction) -> ())? = nil) {
    self.init(title: title, message: message, preferredStyle: preferredStyle, addDefaultAction: addDefaultAction, andCompletionHandler: completionHandler)
    view.tintColor = color
    guard let title = title else {
      return
    }
    
    let colorDictionary = [NSAttributedStringKey.foregroundColor: UIColor.salmon]
    setValue(NSAttributedString(string: title, attributes: colorDictionary), forKey: "attributedTitle")
  }
  
  public func addDefaultAction(withCompletion completion: ((UIAlertAction) -> ())? = nil) {
    addAction(UIAlertAction(title: "OK", style: .default, handler: completion))
  }
}
