//
//  User.swift
//  Dropp
//
//  Created by Steven McCracken on 1/6/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import SwiftyJSON
import Foundation

class User: NSObject, Comparable {
  
  var id: String?
  var username: String
  var followers: [User]?
  var following: [User]?
  var isCurrentUser: Bool {
    return username == (UserDefaults.standard.object(forKey: "username") as? String)
  }
  
  init(_ username: String, id: String? = nil) {
    self.id = id
    self.username = username
  }
  
  init(json: JSON) throws {
    guard let id = json["id"].string else {
      throw NSError(reason: "'username' field is invalid", details: json)
    }
    
    guard let username = json["username"].string else {
      throw NSError(reason: "'username' field is invalid", details: json)
    }
    
    self.id = id
    self.username = username
  }
  
  func isFollowing(_ user: User) -> Bool? {
    return following?.contains(user)
  }
  
  override var description: String {
    return "\(username)'s ID is \(id ?? "_")"
  }
  
  override func isEqual(_ object: Any?) -> Bool {
    guard let user = object as? User else {
      return false
    }
    
    return self == user
  }
}

func ==(a: User, b: User) -> Bool {
  return a.username == b.username
}

func <(a: User, b: User) -> Bool {
  return a.username < b.username
}
