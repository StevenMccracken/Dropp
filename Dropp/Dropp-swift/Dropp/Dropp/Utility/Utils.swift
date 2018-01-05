//
//  Utils.swift
//  Dropp
//
//  Created by Steven McCracken on 12/18/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import UIKit
import Foundation

class Utils {
  
  class func present(viewController: UIViewController, animated: Bool = true, completion: (() -> Void)? = nil, failure: ((NSError) -> Void)? = nil) {
    DispatchQueue.main.async {
      let application = UIApplication.shared
      guard let window = application.keyWindow else {
        let error = NSError(reason: "application.keyWindow was nil")
        failure?(error)
        return
      }
      
      guard let rootViewController = window.rootViewController else {
        let error = NSError(reason: "application.keyWindow.rootViewController was nil")
        failure?(error)
        return
      }
      
      rootViewController.present(viewController, animated: animated, completion: completion)
    }
  }
}
