//
//  DetailViewController.swift
//  Dropp
//
//  Created by Pongsakorn Cherngchaosil on 5/2/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import Gifu
import UIKit

class DetailViewController: UIViewController {
    
    @IBOutlet weak var userLabel: UILabel!
    @IBOutlet weak var timestampLabel: UILabel!
    @IBOutlet weak var locationLabel: UILabel!
    @IBOutlet weak var imageView: UIImageView!
    @IBOutlet weak var loadingView: GIFImageView!
    @IBOutlet weak var loadingLabel: UILabel!
    @IBOutlet weak var textView: UITextView!
    
    let http = HTTPModule()
    let viewModule = ViewModule()
    
    var dropp: Dropp!
    var distanceFromDropp: Double!
   
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        // Remove the back button text
        self.navigationController?.navigationBar.backItem?.setHidesBackButton(true, animated: false)
        
        // Set the title in the nav bar of the detail page
        self.title = "Dropp"
        
        // Formatting for the timestamp
        let userTimestamp = NSDate(timeIntervalSince1970: Double(dropp.timestamp))
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM dd, yyyy 'at' h:mm a"
        let dateString = formatter.string(from: userTimestamp as Date)
        
        // Update the detail UI text
        DispatchQueue.main.async() {
            self.userLabel.text = self.dropp.user
            self.timestampLabel.text = dateString
            
            if self.distanceFromDropp < 1.0 {
                self.locationLabel.text = "Less than a meter away"
            } else {
                let roundedDistance = Int(self.distanceFromDropp!.rounded())
                let quantifier = roundedDistance == 1 ? "meter" : "meters"
                self.locationLabel.text = "\(roundedDistance) \(quantifier) away"
            }
            
            self.textView.text = self.dropp.message
        }
        
        if !dropp.hasMedia {
            self.textView.font = UIFont(name: (self.textView.font?.fontName)!, size: (self.textView.font?.pointSize)!+30)!
        }
        
        // If there is an image in the database for this dropp, fetch it
        if dropp.hasMedia && self.imageView.image == nil {
            self.loadingView.prepareForAnimation(withGIFNamed: self.viewModule.loadingIcon)
            self.viewModule.startLoadingIcon(loadingIconView: self.loadingView, fadeTime: 0.1) { _ in }
            self.fetchImage(droppId: dropp.id)
        }
    }
    
    // Retrieves an image from the database
    func fetchImage(droppId: String) {
        let token = UserDefaults.standard.value(forKey: "jwt") as! String
        let request = self.http.createGetRequest(path: "/dropps/\(droppId)/image", token: token)
        
        self.http.getImage(request: request) { response, data  in
            // Test if the data from the response is valid
            guard let data = data else {
                self.viewModule.stopLoadingIcon(loadingIconView: self.loadingView, fadeTime: 0.75) { _ in
                    DispatchQueue.main.async() { self.loadingLabel.text = "Unable to fetch image" }
                }
                
                return
            }
            
            // If the download worked, update the UI
            if response.statusCode == 200 {
                // Hide the loading icon and update the imageView
                DispatchQueue.main.async() {
                    self.imageView.image = UIImage(data: data)
                }
                
                self.viewModule.stopLoadingIcon(loadingIconView: self.loadingView, fadeTime: 0.5) { _ in }
                self.viewModule.fadeImage(imageView: self.imageView, endValue: 1.0, duration: 0.5, delay: 0.0) { _ in }
            } else {
                self.viewModule.stopLoadingIcon(loadingIconView: self.loadingView, fadeTime: 0.5) { _ in
                    DispatchQueue.main.async() { self.loadingLabel.text = "Unable to fetch image" }
                }
            }
        }
    }
}

extension Double {
    /// Rounds the double to decimal places value
    func roundTo(places:Int) -> Double {
        let divisor = pow(10.0, Double(places))
        return (self * divisor).rounded() / divisor
    }
}
