//
//  Utils.swift
//  Dropp
//
//  Created by Steven McCracken on 12/18/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import Foundation

class Utils {
  
  class func present(viewController: UIViewController, animated: Bool = true, completion: (() -> Void)? = nil) {
    DispatchQueue.main.async {
      let application = UIApplication.shared
      let window = application.keyWindow
      let rootViewController = window?.rootViewController
      rootViewController?.present(viewController, animated: animated, completion: completion)
    }
  }
}
