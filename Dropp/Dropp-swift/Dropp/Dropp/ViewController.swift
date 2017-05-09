//
//  ViewController.swift
//  Dropp
//
//  Created by Steven McCracken on 2/20/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import UIKit
import Foundation
import CoreLocation

class ViewController: UIViewController, UITextViewDelegate, UIImagePickerControllerDelegate, UINavigationControllerDelegate, CLLocationManagerDelegate {
    // MARK: Properties
    @IBOutlet weak var messageView: UITextView!
    @IBOutlet weak var imageView: UIImageView!
    @IBOutlet weak var cancelButton: UIButton!
    @IBOutlet weak var postDroppButton: UIButton!
    
    let http = HTTPModule()
    let keyboardToolbar = UIToolbar()
    let picker = UIImagePickerController()
    let locationManager = CLLocationManager()
    let salmonColor: UIColor = UIColor(red: 1.0, green: 0.18, blue: 0.33, alpha: 1.0)
    
    var token = ""
    var originalPostDropButtonYLoc: CGFloat!
    
    var spb: SegmentedProgressBar!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.token = UserDefaults.standard.value(forKey: "jwt") as! String
                
        // Apply border to text view
        self.messageView.layer.borderWidth = 0.8
        self.messageView.layer.borderColor = salmonColor.cgColor
        self.messageView.layer.cornerRadius = 5.0
        
        // Save original Y location of post drop button for when keyboard appears
        self.originalPostDropButtonYLoc = self.postDroppButton.frame.origin.y
        
        // Add keyboard toolbar to add custom buttons
        self.keyboardToolbar.sizeToFit()
        self.keyboardToolbar.isTranslucent = false
        self.keyboardToolbar.barTintColor = UIColor.white
        
        // Create custom buttons for keyboard toolbar
        let spacing = UIBarButtonItem(
            barButtonSystemItem: .flexibleSpace,
            target: self,
            action: nil)
        
        let clearButton = UIBarButtonItem(
            barButtonSystemItem: .trash,
            target: self,
            action: #selector(clearTextView)
        )
        
        let doneButton = UIBarButtonItem(
            barButtonSystemItem: .done,
            target: self,
            action: #selector(hideKeyboard)
        )
        
        doneButton.tintColor = salmonColor
        clearButton.tintColor = salmonColor
        
        // Add custom buttons to keyboard toolbar
        self.keyboardToolbar.items = [clearButton, spacing, doneButton]
        self.messageView.inputAccessoryView = keyboardToolbar
        
        // Add listeners to keyboard showing and hiding
        NotificationCenter.default.addObserver(self, selector: #selector(self.keyboardWillShow), name: NSNotification.Name.UIKeyboardWillShow, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(self.keyboardWillHide), name: NSNotification.Name.UIKeyboardWillHide, object: nil)
        
        // Initialize delegates
        self.messageView.delegate = self
        self.picker.delegate = self
        
        // Ask for Authorization from the User for location
        self.locationManager.requestAlwaysAuthorization()
        
        // For use in foreground
        self.locationManager.requestWhenInUseAuthorization()
        
        if CLLocationManager.locationServicesEnabled() {
            locationManager.delegate = self
            locationManager.desiredAccuracy = kCLLocationAccuracyBest
            locationManager.startUpdatingLocation()
        }
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated
    }
    
    // Clears all content from the text view and dismisses the keyboard
    func clearTextView() {
        self.messageView.text = ""
        self.hideKeyboard()
    }
    
    // Dismisses the keyboard and enables the post button if there is any content in the dropp
    func hideKeyboard() {
        self.messageView.resignFirstResponder()
        self.postDroppButton.isEnabled = self.imageView.image != nil || !self.messageView.text.isEmpty
    }
    
    // Sends an image to the server
    func sendImage(_ droppId: String, _ image: UIImage, completion: @escaping (Bool) -> Void) {
        let request = self.http.createImageRequest(droppId: droppId, token: self.token, params: [:], image: image)
        
        // Send the request to post the image and return the server response success or fail
        self.http.sendRequest(request: request) { response, json in
            print(json)
            completion(response.statusCode == 200)
        }
    }
    
    // Sends text and metadata to the server
    func sendContent(_ message: String, _ hasImage: Bool, completion: @escaping (String) -> Void) {
        // Get the current location of the device
        let loc = locationManager.location!.coordinate
        let locString = "\(loc.latitude),\(loc.longitude)"
        
        // Get the current UNIX timestamp in seconds
        let timestamp = Int(NSDate().timeIntervalSince1970.rounded())
        
        // Create the dictionary for the request body
        let content = ["location": locString, "timestamp": timestamp, "text": message, "media": hasImage] as [String: Any]
        
        let request = self.http.createPostRequest(path: "/dropps", token: self.token, body: content)
        
        // Send the request and receive the response
        self.http.sendRequest(request: request) { response, json in
            print(json)
            var droppId = ""
            
            // If the server returns 200, the post was successful and json contains the droppId
            if response.statusCode == 200 {
                droppId = json["droppId"]! as! String
            }
            
            completion(droppId)
        }
    }
    
    // Fades the image and cancel button to a specified value in a specified duration
    func fadeImage(value: Double, duration: Double, delay: Double, completion: @escaping () -> Void) {
        UIView.animate(withDuration: duration, delay: delay, options: UIViewAnimationOptions.curveEaseOut, animations: {
            self.imageView.alpha = CGFloat(value)
            self.cancelButton.alpha = CGFloat(value)
        }, completion: { _ in
            completion()
        })
    }
    
    // Mark: Actions
    
    // Removes the photo in the ImageView if one is present.
    @IBAction func deletePhoto(_ sender: UIButton) {
        // If an image exists in the image view, remove it and hide the cancel button
        if self.imageView.image != nil {
            self.fadeImage(value: 0.0, duration: 0.25, delay: 0.0) { faded in
                // Once they have faded out, remove the objects and reset the alpha
                self.imageView.image = nil
                self.cancelButton.isHidden = true
                
                self.imageView.alpha = 1.0
                self.cancelButton.alpha = 1.0
            }
            
            // If there is also no text in the text field, disable the post button
            self.postDroppButton.isEnabled = !self.messageView.text!.isEmpty
        }
    }
    
    // Resets the posting screen UI from an alert action
    func resetUI(_ alert: UIAlertAction) {
        self.resetUI()
    }
    
    // Resets the posting screen UI to the initial, empty state
    func resetUI() {
        DispatchQueue.main.async {
            self.fadeImage(value: 0.0, duration: 0.15, delay: 0.0) { faded in
                // Once they have faded out, remove the objects and reset the alpha
                self.imageView.image = nil
                self.cancelButton.isHidden = true
                
                self.imageView.alpha = 1.0
                self.cancelButton.alpha = 1.0
            }
            
            self.messageView.text = ""
            self.postDroppButton.isEnabled = false
            self.messageView.resignFirstResponder()
        }
    }
    
    // Captures all data from the dropp screen and tries to send it to the server
    func uploadDropp(alert: UIAlertAction!) {
        // Determine whether the user has chosen a photo
        let imageExists = self.imageView.image != nil
        
        // Send an HTTP request to upload the dropp content
        self.sendContent(self.messageView.text!, imageExists) { droppId in
            // If a droppId is returned from the server, the upload was successful
            if droppId != "" {
                // If the user attached an image to their post, try to upload the image
                if imageExists {
                    // Send an HTTP request to upload the image
                    self.uploadImageOnly(droppId: droppId, image: self.imageView.image!)
                } else {
                    // Dropp was posted, so update the UI
                    sleep(1)
                    DispatchQueue.main.async {
                        self.spb.skip()
                        UIView.animate(withDuration: 1, delay: 0, options: UIViewAnimationOptions.curveEaseOut, animations: {
                            self.spb.alpha = CGFloat(0)
                        }, completion: { _ in
                            self.spb.removeFromSuperview()
                        })
                    }
                    self.resetUI()
                }
            } else {
                self.alertFailedPost(droppId: "")
                print("Failed to post dropp during text upload")
            }
        }
    }
    
    func uploadImageOnly(droppId: String, image: UIImage) {
        // Send an HTTP request to upload the image
        self.sendImage(droppId, image) { imagePosted in
            // If the image was uploaded successfully, reset the post dropp screen
            if imagePosted {
                sleep(1)
                DispatchQueue.main.async {
                    self.spb.skip()
                    UIView.animate(withDuration: 1, delay: 0, options: UIViewAnimationOptions.curveEaseOut, animations: {
                        self.spb.alpha = CGFloat(0)
                    }, completion: { _ in
                        self.spb.removeFromSuperview()
                    })
                }
                self.resetUI()
            } else {
                // The image upload failed, display a failure alert
                self.alertFailedPost(droppId: droppId)
                print("Failed to post dropp during image upload")
            }
        }
    }

    // Attempts to send dropp to the server
    @IBAction func postMessage(_ sender: UIButton) {
         // Hide the keyboard
        self.messageView.resignFirstResponder()
        self.spb = SegmentedProgressBar(numberOfSegments: 1, duration: 8)
        self.spb.frame = CGRect(x: 15, y: 20, width: view.frame.width - 30, height: 4)
        self.spb.topColor = UIColor(red: 1.0, green: 0.18, blue: 0.33, alpha: 1.0)
        view.addSubview(self.spb)
        self.spb.startAnimation()
        // Attempts server upload
        uploadDropp(alert: nil)
    }
    
    // Opens the camera to take a photo
    @IBAction func takePicture(_ sender: UIButton) {
        // First check if the device has a cmaera
        if UIImagePickerController.isSourceTypeAvailable(.camera) {
            // Set properties about the image picker when taking a photo
            
            // Get the unedited version of the chosen photo
            picker.allowsEditing = false
            
            // Specify the rear-facing camera as the initial source
            picker.sourceType = UIImagePickerControllerSourceType.camera
            
            // Specify that photos, not videos, can be taken
            picker.cameraCaptureMode = .photo
            
            // Sets the camera screen to present modally
            picker.modalPresentationStyle = .fullScreen
            
            // Display the image taking screen
            present(picker,animated: true,completion: nil)
            
            // Update the posting screen UI to deal with any photo that is used
            
            // Reveal the button that allows the user to remove their selected image
            self.cancelButton.isHidden = false
            
            // Enable the post button so the user can upload their post
            self.postDroppButton.isEnabled = true
        } else {
            // Display an alert because the device does not have a camera
            alertNoCamera()
        }
    }
    
    // Opens the photo library to pick a photo
    @IBAction func photoFromLibrary(_ sender: UIButton) {
        // Set properties about the image picker when choosing a photo
        
        // Ensures no edited versions of the photos
        picker.allowsEditing = false
        
        // Specifies the source as the device photo library, not the camera roll
        picker.sourceType = .photoLibrary
        picker.mediaTypes = UIImagePickerController.availableMediaTypes(for: .photoLibrary)!
        
        // Display the image picking screen
        present(picker, animated: true, completion: nil)
    }
    
    // Creates an alert controller object with the Dropp UI styling. Actions must be added to the return object later
    func createAlert(title: String, message: String) -> UIAlertController {
        // Create the initial controller object with an empty title to apply a color to it later
        let alert = UIAlertController(title: "", message: message, preferredStyle: .alert)
        
        // Define attribute array for setting the color of a string in the alert
        let colorAttribute = [ NSForegroundColorAttributeName : self.salmonColor ]
        
        // Set the color of the alert buttons
        alert.view.tintColor = self.salmonColor
        
        // Set the color of the title and message of the alert
        alert.setValue(NSAttributedString(string: title, attributes: colorAttribute), forKey: "attributedTitle")
        
        return alert
    }
    
    // Displays an alert to reset a dropp post
    @IBAction func trashDropp(_ sender: UIButton) {
        // Create action buttons for alert
        let noAction = UIAlertAction(
            title: "No",
            style: .cancel,
            handler: nil)
        
        let yesAction = UIAlertAction(
            title: "Yes",
            style: .default,
            handler: resetUI)
        
        // Create the alert
        let alert = self.createAlert(title: "Delete Dropp", message: "Are you sure you want to restart your dropp creation?")
        
        // Add the actions to the alert
        alert.addAction(yesAction)
        alert.addAction(noAction)

        // Display the alert
        present(alert, animated: true, completion: nil)
    }
    
    // MARK: Delegates
    
    // Function handles when text view ends editing
    func textViewDidEndEditing(_ textView: UITextView) {
         // Hide the keyboard
        textView.resignFirstResponder()
        
        // Remove leading and trailing whitespace from entered text
        textView.text = textView.text.trim()
        
        // Enable the post button if there is any content in the dropp
        if !textView.text!.isEmpty || self.imageView.image != nil {
            DispatchQueue.main.async {
                self.postDroppButton.isEnabled = true
            }
        }
    }
    
    // Captures selected or taken image after user presses "Use this photo"
    func imagePickerController(_ picker: UIImagePickerController,
                               didFinishPickingMediaWithInfo info: [String : AnyObject]) {
        let chosenImage = info[UIImagePickerControllerOriginalImage] as! UIImage
        
        // Update the image view
        imageView.image = chosenImage
        
        // Hide the image picker
        dismiss(animated: true, completion: nil)
        
        // Reveal the delete image button
        self.cancelButton.isHidden = false
        
        // Enable the post button
        self.postDroppButton.isEnabled = true
    }
    
    // Removes the photo library view when the user presses cancel
    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        dismiss(animated: true, completion: nil)
        
        // Hide the cancel image button if no image is in the image view
        self.cancelButton.isHidden = self.imageView.image == nil
        
        // Disable the post button if there is no text written or image selected
        if self.imageView.image == nil && self.messageView.text.isEmpty {
            self.postDroppButton.isEnabled = false
        }
    }
    
    func alertFailedPost(droppId: String) {
        // Create action buttons for alert
        let cancelAction = UIAlertAction(
            title: "Cancel",
            style: .default,
            handler: nil)
        
        var retryAction: AnyObject
        if !droppId.isEmpty {
            retryAction = UIAlertAction(
                title: "Retry",
                style: .cancel,
                handler: { action in
                    self.uploadImageOnly(droppId: droppId, image: self.imageView.image!)
                })
        } else {
            retryAction = UIAlertAction(
                title: "Retry",
                style: .cancel,
                handler: uploadDropp)
        }
        
        // Create the alert controller
        let alert = self.createAlert(title: "Failed Upload", message: "Sorry, we were unable to post your dropp")
        
        // Add the actions to the alert
        alert.addAction(retryAction as! UIAlertAction)
        alert.addAction(cancelAction)
        
        // Display the alert
        present(alert, animated: true, completion: nil)
    }
    
    // Presents an alert when the device has no camera
    func alertNoCamera() {
        // Create action button for alert
        let okAction = UIAlertAction(
            title: "OK",
            style:.default,
            handler: nil)
        
        // Create the alert controller
        let alert = self.createAlert(title: "No Camera", message: "Sorry, this device has no camera")
        
        // Add the action to the alert
        alert.addAction(okAction)

        // Display the alert
        present(alert, animated: true, completion: nil)
    }
    
    // Function performs UI changes when the keyboard appears
    func keyboardWillShow(notification: NSNotification) {
        if let keyboardSize = (notification.userInfo?[UIKeyboardFrameBeginUserInfoKey] as? NSValue)?.cgRectValue {
            // Fade out the image view and cancel button
            self.fadeImage(value: 0.0, duration: 1.0, delay: 0.0) { _ in }
            
            // Push the position of the post button up as the keyboard goes up
            self.postDroppButton.frame.origin.y -= keyboardSize.height
        }
    }
    
    // Function performs UI changes when the keyboard goes away
    func keyboardWillHide(notification: NSNotification) {
        if ((notification.userInfo?[UIKeyboardFrameBeginUserInfoKey] as? NSValue)?.cgRectValue) != nil {
            // Push the position of the post button down as the keyboard goes down
            self.postDroppButton.frame.origin.y = self.originalPostDropButtonYLoc
            
            // Fade in the image view and cancel button. If they are hidden, they will still not be displayed
            self.fadeImage(value: 1.0, duration: 1.0, delay: 0.0) { _ in }
        }
    }
}

// MARK: Extensions

extension String {
    func trim() -> String {
        return self.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines)
    }
}
