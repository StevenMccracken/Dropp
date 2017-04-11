//
//  UserStore.swift
//  Dropp
//
//  Created by Pongsakorn Cherngchaosil on 4/9/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import Foundation

class UserStore {
    var allUsers: [UserObject] = []
    
    func createUser() -> UserObject {
        let newUser = UserObject(random: true)
        allUsers.append(newUser)
        return newUser
    }
}
