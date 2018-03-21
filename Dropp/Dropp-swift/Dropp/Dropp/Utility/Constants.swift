//
//  Constants.swift
//  Dropp
//
//  Created by Steven McCracken on 12/18/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import UIKit

class Constants {
  
  // MARK: URLs
  
  /**
   The REST API url
   */
  static let apiUrl = "https://dropps.me"
  
  // MARK: Error codes
  
  /**
   Custom error code for when location is not enabled
   */
  static let locationNotEnabled = 666
  
  // MARK: Storage keys
  
  /**
   The key to access the JWT from storage
   */
  static let storageKey_jwt = "jwt"
  
  /**
   The key to access the username from storage
   */
  static let storageKey_username = "username"
  
  /**
   The key to access the password from storage
   */
  static let storageKey_password = "password"
  
  /**
   The key to access the max fetch distance from storage
   */
  static let storageKey_maxFetchDistance = "maxFetchDistance"
  
  // MARK: Custom segue identifiers
  
  /**
   The segue ID for pushing a dropp detail view controller
   */
  static let showDroppDetailSegueId = "showDroppDetailSegue"
  
  /**
   The segue ID for pushing a connections view controller
   */
  static let showConnectionsSegueId = "showConnectionsSegue"
  
  /**
   The segue ID for pushing a profile view controller
   */
  static let showProfileSegueId = "showProfileSegue"
  
  // MARK: Restoration IDs
  
  /**
   A unique ID for the dummy view controller created via storyboard
   */
  static let dummyViewControllerRestorationId = "DummyViewControllerRestoriationId"
  
  // MARK: UI heights
  
  /**
   The vertical screen height of the iPhone X
   */
  static let iPhoneXHeight: CGFloat = 2436
  
  /**
   The height of the status bar based on the current device
   */
  static var statusBarHeight: CGFloat {
    return Utils.isDeviceIPhoneX ? 44 : 20
  }
}
