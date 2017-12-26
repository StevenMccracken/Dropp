//
//  ViewAssets.swift
//  Dropp
//
//  Created by Steven McCracken on 5/9/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import Gifu
import UIKit
import Foundation

class ViewModule {
    let salmonColor: UIColor = UIColor(red: 1.0, green: 0.18, blue: 0.33, alpha: 1.0)
    let loadingIcon: String = "Loading-Fast-Icon-200x200"
    
    // Fades the image and cancel button to a specified value in a specified duration
    func fadeImage(imageView: UIImageView, endValue: Double, duration: Double, delay: Double, completion: (() -> Void)? = nil) {
        UIView.animate(withDuration: duration, delay: delay, options: UIViewAnimationOptions.curveEaseOut, animations: {
            imageView.alpha = CGFloat(endValue)
        }, completion: { _ in
            completion?()
        })
    }
    
    // Creates an alert controller object with the Dropp UI styling. Actions must be added to the return object later
    func createAlert(title: String, message: String) -> UIAlertController {
        // Create the initial controller object with an empty title to apply a color to it later
        let alert = UIAlertController(title: "", message: message, preferredStyle: .alert)
        
        // Define attribute array for setting the color of a string in the alert
      let colorAttribute = [ NSAttributedStringKey.foregroundColor : self.salmonColor ]
        
        // Set the color of the alert buttons
        alert.view.tintColor = self.salmonColor
        
        // Set the color of the title and message of the alert
        alert.setValue(NSAttributedString(string: title, attributes: colorAttribute), forKey: "attributedTitle")
        
        return alert
    }
    
    func createActionSheet() -> UIAlertController {
        let alert = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet)
        
        // Set the color of the alert buttons
        alert.view.tintColor = self.salmonColor
        
        return alert
    }
    
    // Starts animating the loading icon gif and fades it in
    func startLoadingIcon(loadingIconView: GIFImageView, fadeTime: Double, completion: (() -> Void)? = nil) {
        loadingIconView.startAnimatingGIF()
        if loadingIconView.alpha != CGFloat(1.0) {
            DispatchQueue.main.async {
              self.fadeImage(imageView: loadingIconView, endValue: 1.0, duration: fadeTime, delay: 0.0, completion: completion)
            }
        }
    }
    
    // Fades out the loading icon gif and then stops animating it
    func stopLoadingIcon(loadingIconView: GIFImageView, fadeTime: Double, completion: (() -> Void)? = nil) {
        if loadingIconView.alpha != CGFloat(0.0) {
            DispatchQueue.main.async {
              self.fadeImage(imageView: loadingIconView, endValue: 0.0, duration: fadeTime, delay: 0.0) { 
                    loadingIconView.stopAnimatingGIF()
                    completion?()
                }
            }
        }
    }
}
