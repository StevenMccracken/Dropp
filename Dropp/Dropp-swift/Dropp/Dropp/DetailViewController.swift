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
    @IBOutlet weak var imageView: UIImageView!
    @IBOutlet weak var loadingLabel: UILabel!
    @IBOutlet weak var textView: UITextView!
    
    let http = HTTPModule()
    var userObj: UserObject!
    var distanceFromDropp: Double!
   
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        // Remove the back button text
        self.navigationController?.navigationBar.topItem?.title = " "
        self.title = "Message"
        
        // Formatting the timestamp
        let userTimestamp = NSDate(timeIntervalSince1970: Double(userObj.timestamp!))
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM dd, yyyy 'at' h:mm a"
        let dateString = formatter.string(from: userTimestamp as Date)
        
        self.userLabel.text = userObj.username
        self.timestampLabel.text = dateString
        self.locationLabel.text = "\(distanceFromDropp!) meters away"
        self.textView.text = userObj.message
        
//        self.userLabel.text = "stevenmccracken"
//        self.userLabel.font = UIFont.boldSystemFont(ofSize: 15.0)
//        self.locationLabel.text = "4.20 meters away"
//        self.textView.text = "Hello from Fullerton. Dropp fucking rocks. Dropp me a message!"
        
        if userObj.media! {
            self.loadingLabel.isHidden = false
            self.fetchImage(droppId: userObj.droppID!)
        }
    }
    
    func fetchImage(droppId: String) {
        // Create the URL request with the path to post a dropp
        var request  = URLRequest(url: URL(string: "\(self.http.apiPath)/dropps/\(droppId)/image")!)
        
        // Set method to POST
        request.httpMethod = "GET"
        
        // Specify body type in request headers
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Add token to request headers
        request.addValue(UserDefaults.standard.value(forKey: "jwt") as! String, forHTTPHeaderField: "Authorization")
        
        self.http.getImage(request: request) { response, data  in
            guard let data = data else { return }
            
            if response.statusCode == 200 {
                DispatchQueue.main.async() {
                    self.loadingLabel.isHidden = true
                    self.imageView.image = UIImage(data: data)
                }
            } else {
                self.loadingLabel.text = "Unable to fetch image"
            }
            
        }
    }
}
