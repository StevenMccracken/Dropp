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
        self.navigationController?.navigationBar.backItem?.setHidesBackButton(true, animated: false)
        
        // Set the title in the nav bar of the detail page
        self.title = "Dropp"
        
        // Formatting for the timestamp
        let userTimestamp = NSDate(timeIntervalSince1970: Double(userObj.timestamp!))
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM dd, yyyy 'at' h:mm a"
        let dateString = formatter.string(from: userTimestamp as Date)
        
        // Update the detail UI text
        DispatchQueue.main.async() {
            self.userLabel.text = self.userObj.username
            self.timestampLabel.text = dateString
            self.locationLabel.text = "\(self.distanceFromDropp!) meters away"
            self.textView.text = self.userObj.message
        }
        
        // If there is an image in the database for this dropp, fetch it
        if userObj.media! {
            self.loadingLabel.isHidden = false
            self.fetchImage(droppId: userObj.droppID!)
        }
    }
    
    // Retrieves an image from the database
    func fetchImage(droppId: String) {
        let token = UserDefaults.standard.value(forKey: "jwt") as! String
        let request = self.http.createGetRequest(path: "/dropps/\(droppId)/image", token: token)
        
        self.http.getImage(request: request) { response, data  in
            // Test if the data from the response is valid
            guard let data = data else {
                self.loadingLabel.text = "Unable to fetch image"
                return
            }
            
            print(response)
            // If the download worked, update the UI
            if response.statusCode == 200 {
                // Hide the loading label and update the imageView
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
