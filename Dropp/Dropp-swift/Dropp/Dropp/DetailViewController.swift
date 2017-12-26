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
      
      if self.distanceFromDropp > 304.8 {
        // Distance is further than 1000 feet away. Convert to miles
        let distanceMiles = self.distanceFromDropp.metersToMiles
        let roundedDistance = Int((distanceMiles * 4.0).rounded() / 4)
        let quantifier = roundedDistance == 1 ? "mile" : "miles"
        self.locationLabel.text = "About \(roundedDistance) \(quantifier) away"
      } else if self.distanceFromDropp <= 304.8 && self.distanceFromDropp >= 1.524 {
        // Distance is between 5 feet and 1000 feet. Convert to feet
        let distanceFeet = self.distanceFromDropp.metersToFeet
        let roundedDistance = Int(distanceFeet.rounded())
        self.locationLabel.text = "\(roundedDistance) feet away"
      } else {
        self.locationLabel.text = "Less than 5 feet away"
      }
      
      self.textView.text = self.dropp.message
    }
    
    if !dropp.hasMedia {
      self.textView.font = UIFont(name: (self.textView.font?.fontName)!, size: (self.textView.font?.pointSize)! + 30)!
    }
    
    // If there is an image in the database for this dropp, fetch it
    if dropp.hasMedia && self.imageView.image == nil {
      self.loadingView.prepareForAnimation(withGIFNamed: self.viewModule.loadingIcon)
      self.viewModule.startLoadingIcon(loadingIconView: self.loadingView, fadeTime: 0.1)
      self.fetchImage(droppId: dropp.id)
    }
  }
  
  // Retrieves an image from the database
  func fetchImage(droppId: String) {
    let request = self.http.createGetRequest(path: "/dropps/\(droppId)/image", params: [:])
    
    self.http.getImage(request: request) { response, data  in
      // Test if the data from the response is valid
      guard let data = data else {
        self.viewModule.stopLoadingIcon(loadingIconView: self.loadingView, fadeTime: 0.75) {
          DispatchQueue.main.async() {
            self.loadingLabel.text = "Unable to fetch image"
          }
        }
        
        return
      }
      
      // If the download worked, update the UI
      if response.statusCode == 200 {
        // Hide the loading icon and update the imageView
        DispatchQueue.main.async() {
          self.imageView.image = UIImage(data: data)
        }
        
        self.viewModule.stopLoadingIcon(loadingIconView: self.loadingView, fadeTime: 0.5)
        self.viewModule.fadeImage(imageView: self.imageView, endValue: 1.0, duration: 0.5, delay: 0.0)
      } else {
        self.viewModule.stopLoadingIcon(loadingIconView: self.loadingView, fadeTime: 0.5) { () in
          DispatchQueue.main.async() {
            self.loadingLabel.text = "Unable to fetch image"
            
          }
        }
      }
    }
  }
}
