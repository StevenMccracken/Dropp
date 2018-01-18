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
  
  var username: String
  var followers: [User]?
  var following: [User]?
  var followRequests: [User]?
  var followerRequests: [User]?
  var isCurrentUser: Bool {
    return username == LoginManager.shared.currentUser?.username
  }
  
  init(_ username: String) {
    self.username = username
    followers = []
    following = []
    followRequests = []
    followerRequests = []
  }
  
  init(json: JSON) throws {
    guard let username = json["username"].string else {
      throw NSError(reason: "'username' field is invalid", details: json)
    }
    
    self.username = username
  }
  
  func follows(_ user: User) -> Bool? {
    return following?.contains(user)
  }
  
  func hasRequestedFollow(_ user: User) -> Bool? {
    return followRequests?.contains(user)
  }
  
  func removeFollower(_ user: User) {
    if let index = followers?.index(of: user) {
      followers?.remove(at: index)
    }
  }
  
  func removeFollow(_ user: User) {
    if let index = following?.index(of: user) {
      following?.remove(at: index)
    }
  }
  
  func removeFollowerRequest(fromUser user: User) {
    if let index = followerRequests?.index(of: user) {
      followerRequests?.remove(at: index)
    }
  }
  
  func removeFollowRequest(toUser user: User) {
    if let index = followRequests?.index(of: user) {
      followRequests?.remove(at: index)
    }
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
