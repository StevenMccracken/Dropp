//
//  UserObject.swift
//  Dropp
//
//  Created by Pongsakorn Cherngchaosil on 4/9/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import MapKit
import CoreLocation
import SwiftyJSON

class Dropp: NSObject, Comparable {
  
  var id: String!
  var user: User
  var username: String! {
    return user.username
  }
  
  var location: CLLocation!
  var timestamp: Int!
  var message: String!
  var hasMedia: Bool!
  var date: Date {
    return Date(timeIntervalSince1970: Double(timestamp))
  }
  
  var postedByCurrentUser: Bool {
    return user == LoginManager.shared.currentUser
  }
  
  var pointAnnotation: MKPointAnnotation {
    let point = MKPointAnnotation()
    point.coordinate = location.coordinate
    return point
  }
  
  init(id: String, json: JSON) throws {
    guard let username = json["username"].string else {
      throw NSError(reason: "'username' field is invalid", details: json)
    }
    
    guard let locationString = json["location"].string else {
      throw NSError(reason: "'location' field is invalid", details: json)
    }
    
    guard let timestamp = json["timestamp"].int else {
      throw NSError(reason: "'timestamp' field is invalid", details: json)
    }
    
    guard let message = json["text"].string else {
      throw NSError(reason: "'text' field is invalid", details: json)
    }
    
    guard let hasMedia = json["media"].string else {
      throw NSError(reason: "'media' field is invalid", details: json)
    }
    
    self.id = id
    self.user = User(username)
    self.location = try locationString.toLocation()
    self.timestamp = timestamp
    self.message = message
    self.hasMedia = hasMedia == "true"
  }
  
  init(id: String, username: String, location: String, timestamp: Int, message: String, hasMedia: Bool) throws {
    self.id = id
    self.user = User(username)
    self.location = try location.toLocation()
    self.timestamp = timestamp
    self.message = message
    self.hasMedia = hasMedia
  }
  
  override var description: String {
    let string = "<'\(self.id!)' posted by '\(self.username!)' at \(self.location.coordinate) on \(self.timestamp!) with message '\(self.message!)'. Does\(self.hasMedia ? "" : " not") have media>"
    return string
  }
  
  func distance(from: CLLocation) -> Double {
    return self.location.distance(from: from)
  }
  
  func distance(from dropp: Dropp) -> Double {
    return self.location.distance(from: dropp.location)
  }
  
  func distanceAwayMessage(from location: CLLocation?) -> String {
    guard let location = location else {
      return "Location unavailable😪"
    }
    
    var message: String
    let distance = self.distance(from: location)
    if distance > 1409.7853 {
      // Distance is far enough away that when rounded, it will be one mile. Convert to miles
      let miles = distance.metersToMiles
      let roundedDistance = Int((miles * 4.0).rounded() / 4)
      let quantifier = roundedDistance == 1 ? "mile" : "miles"
      message = "\(roundedDistance) \(quantifier) away"
    } else if 0.3048 ..< 1409.7853 ~= distance {
      // Distance is between 1.5 feet and 1 mile. Convert to feet
      let feet = distance.metersToFeet
      let roundedDistance = Int(feet.rounded())
      message = "\(roundedDistance) feet away"
    } else {
      message = "1 foot away"
    }
    
    return message
  }
  
  func timeSincePostedMessage(from time: Date) -> String {
    var message: String
    let timeDifference = time.timeIntervalSince(date)
    if timeDifference < 60 {
      message = "Just now"
    } else {
      let minutesAgo = Int((timeDifference / 60).rounded())
      if minutesAgo < 60 {
        let quantifier = minutesAgo == 1 ? "minute" : "minutes"
        message = "\(minutesAgo) \(quantifier) ago"
      } else {
        let hoursAgo = minutesAgo / 60
        let hoursQuantifier = hoursAgo == 1 ? "hour" : "hours"
        message = "\(hoursAgo) \(hoursQuantifier)"
        
        let subMinutesAgo = minutesAgo % 60
        if subMinutesAgo > 0 {
          let subMinutesQuantifier = subMinutesAgo == 1 ? "minute" : "minutes"
          message = "\(message) \(subMinutesAgo) \(subMinutesQuantifier)"
        }
        
        message = "\(message) ago"
      }
    }
    
    return message
  }
  
  class func sort(_ dropps: [Dropp], by sortType: DroppFeedSortingType, currentLocation: CLLocation? = nil) -> [Dropp] {
    var sortedDropps: [Dropp]
    if (sortType == .farthest || sortType == .closest), let location = currentLocation {
      sortedDropps = dropps.sorted(by: { (a: Dropp, b: Dropp) in
        let distanceFromAToLocation = a.distance(from: location)
        let distanceFromBToLocation = b.distance(from: location)
        return sortType == .closest ? distanceFromAToLocation < distanceFromBToLocation :  distanceFromAToLocation > distanceFromBToLocation
      })
    } else if sortType == .reverseChronological {
      sortedDropps = dropps.sorted() { (a: Dropp, b: Dropp) in
        return a < b
      }
    } else {
      sortedDropps = dropps.sorted() { (a: Dropp, b: Dropp) in
        return a > b
      }
    }
    
    return sortedDropps
  }
}

func ==(a: Dropp, b: Dropp) -> Bool {
  return a.timestamp == b.timestamp
}

func <(a: Dropp, b: Dropp) -> Bool {
  return a.timestamp < b.timestamp
}
