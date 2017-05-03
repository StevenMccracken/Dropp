//
//  DetailViewController.swift
//  Dropp
//
//  Created by Pongsakorn Cherngchaosil on 5/2/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import UIKit

class DetailViewController: UIViewController {
    
    @IBOutlet weak var userLabel: UILabel!
    @IBOutlet weak var timestampLabel: UILabel!
    @IBOutlet weak var locationLabel: UILabel!
    @IBOutlet weak var messageLabel: UITextView!
    
    var userObj: UserObject!
    var userCurrentLoc: String!
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        print("Printing UserOjbect in Detail:")
        print(userObj)
        var userTimestamp = NSDate(timeIntervalSince1970: Double(userObj.timestamp!))
        
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
        let dateString = formatter.string(from: userTimestamp as Date)
        print(dateString)
        
        userLabel.text = userObj.userId
        timestampLabel.text = dateString
        locationLabel.text = userObj.location
        messageLabel.text = userObj.message
        
        
        
//        userLabel.text = "UserID"
//        timestampLabel.text = "TimeStamp"
//        locationLabel.text = "A Location"
//        messageLabel.text = "A Message"
    }
}
