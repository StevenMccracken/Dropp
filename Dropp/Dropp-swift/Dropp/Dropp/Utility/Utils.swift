//
//  Utils.swift
//  Dropp
//
//  Created by Steven McCracken on 12/18/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import UIKit
import Photos
import CoreLocation

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
  
  class func isPhone() -> Bool {
    return UIDevice.current.userInterfaceIdiom == .phone
  }
  
  class func isPad() -> Bool {
    return UIDevice.current.userInterfaceIdiom == .pad
  }
  
  class func save(image: UIImage, withTimestamp timestamp: Date, andLocation location: CLLocation? = nil, success: ((Bool) -> Void)? = nil, failure: ((Error) -> Void)? = nil) {
    PHPhotoLibrary.shared().performChanges({ () in
      let request = PHAssetChangeRequest.creationRequestForAsset(from: image)
      request.creationDate = timestamp
      if let location = location {
        request.location = location
      }
    }, completionHandler: { (successfulSave: Bool, error: Error?) in
      if let error = error {
        failure?(error)
      } else {
        success?(successfulSave)
      }
    })
  }
  
  class func isJwtValid(_ jwt: String) -> Bool {
    return !jwt.isEmpty && jwt.substring(with: 0..<3) == "JWT"
  }
}
