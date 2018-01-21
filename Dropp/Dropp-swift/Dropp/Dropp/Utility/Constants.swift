//
//  Constants.swift
//  Dropp
//
//  Created by Steven McCracken on 12/18/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import UIKit
import Foundation

class Constants {
  
  static let apiUrl = "https://dropps.me"
  static let locationNotEnabled = 666
  
  static let storageKey_jwt = "jwt"
  static let storageKey_username = "username"
  static let storageKey_password = "password"
  static let storageKey_maxFetchDistance = "maxFetchDistance"
  
  static let showDroppDetailSegueId = "showDroppDetailSegue"
  static let showConnectionsSegueId = "showConnectionsSegue"
  static let showProfileSegueId = "showProfileSegue"
  
  static let dummyViewControllerRestorationId = "DummyViewControllerRestoriationId"
  
  static let iPhoneXHeight: CGFloat = 2436
  static var statusBarHeight: CGFloat {
    return Utils.isDeviceIPhoneX() ? 44 : 20
  }
}
