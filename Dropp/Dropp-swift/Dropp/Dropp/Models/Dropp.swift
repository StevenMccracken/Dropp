//
//  UserObject.swift
//  Dropp
//
//  Created by Pongsakorn Cherngchaosil on 4/9/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import Foundation
import CoreLocation
import SwiftyJSON

class Dropp: NSObject, Comparable {
  var id: String!
  var user: String!
  var location: CLLocation!
  var timestamp: Int!
  var message: String!
  var hasMedia: Bool!
  var date: Date {
    return Date(timeIntervalSince1970: Double(timestamp))
  }
  
  init(id: String, json: JSON) throws {
    guard let username = json["username"].string else {
      throw NSError(domain: "", code: 0, userInfo: ["reason": "'username' field is invalid", "details": json])
    }
    
    guard let locationString = json["location"].string else {
      throw NSError(domain: "", code: 0, userInfo: ["reason": "'location' field is invalid", "details": json])
    }
    
    guard let timestamp = json["timestamp"].int else {
      throw NSError(domain: "", code: 0, userInfo: ["reason": "'timestamp' field is invalid", "details": json])
    }
    
    guard let message = json["text"].string else {
      throw NSError(domain: "", code: 0, userInfo: ["reason": "'text' field is invalid", "details": json])
    }
    
    guard let hasMedia = json["media"].string else {
      throw NSError(domain: "", code: 0, userInfo: ["reason": "'media' field is invalid", "details": json])
    }
    
    self.id = id
    self.user = username
    self.location = try locationString.toLocation()
    self.timestamp = timestamp
    self.message = message
    self.hasMedia = hasMedia == "true"
  }
  
  init(id: String, user: String, location: String, timestamp: Int, message: String, hasMedia: Bool) throws {
    self.id = id
    self.user = user
    self.location = try location.toLocation()
    self.timestamp = timestamp
    self.message = message
    self.hasMedia = hasMedia
  }
  
  override var description: String {
    let string = "<'\(self.id!)' posted by '\(self.user!)' at \(self.location.coordinate) on \(self.timestamp!) with message '\(self.message!)'. Does\(self.hasMedia ? "" : " not") have media>"
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
      return "Can't determine distance"
    }
    
    var message: String
    let distance = self.distance(from: location)
    if distance > 304.8 {
      // Distance is further than 1000 feet. Convert to miles
      let miles = distance.metersToMiles
      let roundedDistance = Int((miles * 4.0).rounded() / 4)
      let quantifier = roundedDistance == 1 ? "mile" : "miles"
      message = "About \(roundedDistance) \(quantifier) away"
    } else if 1.524 ..< 304.8 ~= distance {
      // Distance is between 5 feet and 1000 feet. Convert to feet
      let feet = distance.metersToFeet
      let roundedDistance = Int(feet.rounded())
      message = "\(roundedDistance) feet away"
    } else {
      message = "Less than 5 feet away"
    }
    
    return message
  }
  
  func timeSincePostedMessage(from time: Date) -> String {
    var message: String
    let timeDifference = time.timeIntervalSince(date)
    if timeDifference < 60 {
      message = "Less than a minute ago"
    } else {
      let minutesAgo = Int((timeDifference / 60).rounded())
      if minutesAgo < 60 {
        let quantifier = minutesAgo == 1 ? "minute" : "minutes"
        message = "\(minutesAgo) \(quantifier) ago"
      } else {
        let hoursAgoDouble = Double(minutesAgo) / 60
        let hoursAgo = hoursAgoDouble.roundTo(places: 1)
        let quantifier = hoursAgo == 1.0 ? "hour" : "hours"
        message = "\(hoursAgo) \(quantifier) ago"
      }
    }
    
    return message
  }
}

func ==(a: Dropp, b: Dropp) -> Bool {
  return a.timestamp == b.timestamp
}

func <(a: Dropp, b: Dropp) -> Bool {
  return a.timestamp < b.timestamp
}
