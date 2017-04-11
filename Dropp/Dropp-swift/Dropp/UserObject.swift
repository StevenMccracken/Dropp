//
//  UserObject.swift
//  Dropp
//
//  Created by Pongsakorn Cherngchaosil on 4/9/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import Foundation

class UserObject : NSObject {
    var userId: String?
    var location: String?
    var timestamp: Int?
    var content: String?
    var text: String?
    
    init(pUserId: String, pLocation: String, pTimestamp: Int, pContent: String, pText: String) {
        self.userId = pUserId
        self.location = pLocation
        self.timestamp = pTimestamp
        self.content = pContent
        self.text = pText
    }
    
    convenience init(random: Bool = false) {
        if random {
            let locations = ["Pyramid", "USU", "Rec Center", "Parking Lot", "CECS Building"]
            let contents = ["Hello There", "What's up", "How you doing?", "This is the test", "YOLO SWAG"]
            let texts = ["text1", "text2", "text3", "text4", "text5"]
            
            var idx = arc4random_uniform(UInt32(locations.count))
            let randomLocation = locations[Int(idx)]
            
            idx = arc4random_uniform(UInt32(contents.count))
            let randomContent = contents[Int(idx)]
            
            idx = arc4random_uniform(UInt32(texts.count))
            let randomText = texts[Int(idx)]
            
            let aTimeStamp = 1
            
            self.init(pUserId: "0", pLocation: randomLocation, pTimestamp: aTimeStamp, pContent: randomContent, pText: randomText)
        } else {
            self.init(pUserId: "0", pLocation: "Unknown Location", pTimestamp: 1, pContent: "No Content", pText: "No Text")
        }
    }
}
