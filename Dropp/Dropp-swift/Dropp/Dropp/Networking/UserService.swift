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
  
  class func getNewJwt(success: ((String) -> Void)? = nil, failure: ((NSError) -> Void)? = nil) {
    guard let username = UserDefaults.standard.value(forKey: "username") as? String else {
      failure?(NSError(reason: "Username does not exist in user defaults"))
      return
    }
    
    guard let password = UserDefaults.standard.value(forKey: "password") as? String else {
      failure?(NSError(reason: "Password does not exist in user defaults"))
      return
    }
    
    authenticate(username: username, password: password, success: success, failure: failure)
  }
  
  class func authenticate(username: String, password: String, success: ((String) -> Void)? = nil, failure: ((NSError) -> Void)? = nil) {
    let credentials = ["username": username, "password": password]
    guard let request = HttpUtil.postRequest("\(Constants.apiUrl)/authenticate", parameters: credentials) else {
      failure?(NSError(reason: "Request to authenticate was not created"))
      return
    }
    
    HttpUtil.send(request: request, success: { (json: JSON) in
      guard let jwt = json["token"].string else {
        failure?(NSError(reason: "'token' field was nil"))
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
  
  class func getConnections(ofType connectionType: String, forUser user: User, success: (([User]) -> Void)? = nil, failure: ((NSError) -> Void)? = nil) {
    guard let request = HttpUtil.getRequest("\(Constants.apiUrl)/users/\(user.username)/\(connectionType)") else {
      failure?(NSError(reason: "Request to get user's connections was not created"))
      return
    }
    
    HttpUtil.send(request: request, checkSuccessField: false, success: { (json: JSON) in
      var connections: [User] = []
      for (connectionKey, _) in json {
        connections.append(User(connectionKey))
      }
      
      success?(connections)
    }, failure: failure)
  }
  
  class func getFollowers(forUser user: User, success: (([User]) -> Void)? = nil, failure: ((NSError) -> Void)? = nil) {
    getConnections(ofType: "followers", forUser: user, success: success, failure: failure)
  }
  
  class func getFollowing(forUser user: User, success: (([User]) -> Void)? = nil, failure: ((NSError) -> Void)? = nil) {
    getConnections(ofType: "follows", forUser: user, success: success, failure: failure)
  }
  
  class func requestToFollow(user: User, success: (() -> Void)? = nil, failure: ((NSError) -> Void)? = nil) {
    guard let request = HttpUtil.postRequest("\(Constants.apiUrl)/requests/follows/\(user.username)") else {
      failure?(NSError(reason: "Request to request to follow user was not created"))
      return
    }
    
    HttpUtil.send(request: request, success: { (json: JSON) in
      success?()
    }, failure: failure)
  }
}
