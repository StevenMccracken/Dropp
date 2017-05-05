//
//  UserObject.swift
//  Dropp
//
//  Created by Pongsakorn Cherngchaosil on 4/9/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import Foundation

class UserObject : NSObject {
    var username: String?
    var location: String?
    var timestamp: Int?
    var message: String?
    var droppID: String?
    var media: Bool?
    
    init(pDroppId: String, pUsername: String, pTimestamp: Int, pMessage: String, pLoc: String, pMedia: Bool) {
        self.droppID = pDroppId
        self.username = pUsername
        self.timestamp = pTimestamp
        self.message = pMessage
        self.location = pLoc
        self.media = pMedia
    }
    
    override var description: String {
        return "User: \(self.username)\n Timestamp: \(self.timestamp)\n Message: \(self.message)\n Location: \(self.location)"
    }
}
