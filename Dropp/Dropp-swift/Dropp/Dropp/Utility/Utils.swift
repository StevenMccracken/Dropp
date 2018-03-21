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
  
  /**
   Presents a view controller on the root view controller. This may cause a crash if a view controller is already presented. Handles the presentation on the main thread.
   - Parameter viewController: the view controller to present
   - Parameter animated: whether or not the presentation should be animated. Default is true
   - Parameter completion: the closure allowing custom actions to be performed after the presentation is done. Default is nil
   - Parameter failure: the closure returning any errors while trying to present the view controller. Default is nil
   */
  class func present(viewController: UIViewController, animated: Bool = true, completion: (() -> Void)? = nil, failure: ((NSError) -> Void)? = nil) {
    DispatchQueue.main.async {
      let application = UIApplication.shared
      guard let window = application.keyWindow else {
        let error = NSError(reason: "application.keyWindow was nil")
        failure?(error)
        return
      }
      
      guard let rootViewController = window.rootViewController else {
        let error = NSError(reason: "window.rootViewController was nil")
        failure?(error)
        return
      }
      
      rootViewController.present(viewController, animated: animated, completion: completion)
    }
  }
  
  /**
   Whether or not the current device is an iPhone X
   */
  class var isDeviceIPhoneX: Bool {
    return isPhone && UIScreen.main.nativeBounds.height == Constants.iPhoneXHeight
  }
  
  /**
   Whether or not the current device is an iPhone
   */
  class var isPhone: Bool {
    return UIDevice.current.userInterfaceIdiom == .phone
  }
  
  /**
   Whether or not the current device is an iPad
   */
  class var isPad: Bool {
    return UIDevice.current.userInterfaceIdiom == .pad
  }
  
  /**
   Attempts to save an image to the file system.
   - Parameter image: the given image to save
   - Parameter timestamp: the timestamp for the file
   - Parameter location: the location associated with the image file. Default is nil
   - Parameter success: the closure returning whether or not the save was succssful. Default is nil
   - Parameter failure: the closure returning any error that occurred. Default is nil
   */
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
  
  /**
   Determines whether or not a JWT is valid.
   - Parameter jwt: the JWT to evaluate
   - Returns: the JWT validity
   */
  class func isJwtValid(_ jwt: String) -> Bool {
    return !jwt.isEmpty && jwt.substring(with: 0..<3) == "JWT"
  }
}
