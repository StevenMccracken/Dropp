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
    var message: String?
    
    init(pUserId: String, pLocation: String, pTimestamp: Int, pContent: String, pText: String) {
        self.userId = pUserId
        self.location = pLocation
        self.timestamp = pTimestamp
        self.content = pContent
        self.text = pText
    }
    
    init(pUserId: String, pMessage: String) {
        self.userId = pUserId
        self.message = pMessage
    }
    
    init(pUserId: String, pTimestamp: Int, pMessage: String, pLoc: String) {
        self.userId = pUserId
        self.timestamp = pTimestamp
        self.message = pMessage
        self.location = pLoc
    }
    
    override var description: String {
        return "User: \(self.userId)\n Timestamp: \(self.timestamp)\n Message: \(self.message)\n Location: \(self.location)"
    }
    
    // Ignore this for now. It was just for testing.
//    convenience init(random: Bool = false) {
//        if random {
//            let locations = ["69,69", "1,0", "2,0", "6,9"]
//            let contents = ["Hello There", "What's up", "How you doing?", "This is the test", "YOLO SWAG"]
//            let texts = ["text1", "text2", "text3", "text4", "text5"]
//            
//            var idx = arc4random_uniform(UInt32(locations.count))
//            let randomLocation = locations[Int(idx)]
//            
//            idx = arc4random_uniform(UInt32(contents.count))
//            let randomContent = contents[Int(idx)]
//            
//            idx = arc4random_uniform(UInt32(texts.count))
//            let randomText = texts[Int(idx)]
//            
//            let aTimeStamp = 1
//            
//            self.init(pUserId: "0", pLocation: randomLocation, pTimestamp: aTimeStamp, pContent: randomContent, pText: randomText)
//        } else {
//            self.init(pUserId: "0", pLocation: "Unknown Location", pTimestamp: 1, pContent: "No Content", pText: "No Text")
//        }
//    }
}
