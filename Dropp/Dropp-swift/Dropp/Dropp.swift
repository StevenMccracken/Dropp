//
//  UserObject.swift
//  Dropp
//
//  Created by Pongsakorn Cherngchaosil on 4/9/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import Foundation
import CoreLocation

class Dropp : NSObject, Comparable {
    var id          = String()
    var user        = String()
    var location    = CLLocation()
    var timestamp   = Int()
    var message     = String()
    var hasMedia    = Bool()
    
    init(id: String, user: String, location: String, timestamp: Int, message: String, hasMedia: Bool) {
        self.id = id
        self.user = user
        self.location = location.toLocation
        self.timestamp = timestamp
        self.message = message
        self.hasMedia = hasMedia
    }
    
    override var description: String {
        return "Id: \(self.id)\n User: \(self.user)\n Location: \(self.location.coordinate.latitude), \(self.location.coordinate.longitude)\n Timestamp: \(self.timestamp)\n Message: \(self.message)\n Has media?: \(self.hasMedia)"
    }
    
    func distance(from: CLLocation) -> Double {
        return self.location.distance(from: from)
    }
}

func ==(a: Dropp, b: Dropp) -> Bool {
    return a.timestamp == b.timestamp
}

func <(a: Dropp, b: Dropp) -> Bool {
    return a.timestamp < b.timestamp
}
