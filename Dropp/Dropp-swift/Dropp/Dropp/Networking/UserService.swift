//
//  UserService.swift
//  Dropp
//
//  Created by Steven McCracken on 12/18/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import Foundation
import SwiftyJSON

class UserService {
  
  class func getNewJwt(success: ((String) -> Void)? = nil, failure: ((Error) -> Void)? = nil) {
    guard let username = UserDefaults.standard.value(forKey: "username") as? String else {
      failure?(NSError(domain: "", code: 0, userInfo: ["reason": "Username does not exist in user defaults"]))
      return
    }
    
    guard let password = UserDefaults.standard.value(forKey: "password") as? String else {
      failure?(NSError(domain: "", code: 0, userInfo: ["reason": "Password does not exist in user defaults"]))
      return
    }
    
    authenticate(username: username, password: password, success: success, failure: failure)
  }
  
  class func authenticate(username: String, password: String, success: ((String) -> Void)? = nil, failure: ((Error) -> Void)? = nil) {
    let credentials = ["username": username, "password": password]
    guard let request = HttpUtil.postRequest("\(Constants.apiUrl)/authenticate", parameters: credentials) else {
      failure?(NSError(domain: "", code: 0, userInfo: ["reason": "Request to authenticate was not created"]))
      return
    }
    
    HttpUtil.send(request: request, success: { (json: JSON) in
      guard let jwt = json["token"].string else {
        failure?(NSError(domain: "", code: 0, userInfo: ["reason": "Token field was nil"]))
        return
      }
      
      guard !jwt.isEmpty else {
        debugPrint("Authentication succeeded but JWT was empty")
        return
      }
      
      guard jwt.substring(with: 0..<3) == "JWT" else {
        debugPrint("Authentication succeeded but JWT is invalid")
        return
      }
      
      debugPrint("UserService authentication succeeded!")
      success?(jwt)
    }, failure: failure)
  }
}
