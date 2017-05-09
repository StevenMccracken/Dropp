//
//  ViewController.swift
//  Dropp
//
//  Created by Steven McCracken on 2/20/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import Gifu
import UIKit
import Foundation
import CoreLocation

class ViewController: UIViewController, UITextViewDelegate, UIImagePickerControllerDelegate, UINavigationControllerDelegate, CLLocationManagerDelegate {
    // MARK: Properties
    @IBOutlet weak var messageView: UITextView!
    @IBOutlet weak var imageView: UIImageView!
    @IBOutlet weak var cancelButton: UIButton!
    @IBOutlet weak var postDroppButton: UIButton!
    @IBOutlet weak var loadingView: GIFImageView!
    @IBOutlet weak var trashDroppButton: UIButton!
    
    let http = HTTPModule()
    let viewModule = ViewModule()
    let keyboardToolbar = UIToolbar()
    let picker = UIImagePickerController()
    let locationManager = CLLocationManager()
    
    var token = ""
    var originalPostDropButtonYLoc: CGFloat!
    
    var spb: SegmentedProgressBar!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Get the token from the saved data
        self.token = UserDefaults.standard.value(forKey: "jwt") as! String
                
        // Apply border to text view
        self.messageView.layer.borderWidth = 0.8
        self.messageView.layer.borderColor = self.viewModule.salmonColor.cgColor
        self.messageView.layer.cornerRadius = 5.0
        
        // Save original Y location of post drop button for when keyboard appears
        self.originalPostDropButtonYLoc = self.postDroppButton.frame.origin.y
        
        // Add custom keyboard toolbar
        self.addKeyboardToolbar()
        
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
        
        self.loadingView.prepareForAnimation(withGIFNamed: self.viewModule.loadingIcon)
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated
    }
    
    func addKeyboardToolbar() {
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
            action: #selector(self.clearTextView)
        )
        
        let doneButton = UIBarButtonItem(
            barButtonSystemItem: .done,
            target: self,
            action: #selector(self.hideKeyboard)
        )
        
        doneButton.tintColor = self.viewModule.salmonColor
        clearButton.tintColor = self.viewModule.salmonColor
        
        // Add custom buttons to keyboard toolbar
        self.keyboardToolbar.items = [clearButton, spacing, doneButton]
        self.messageView.inputAccessoryView = self.keyboardToolbar
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
        self.trashDroppButton.isEnabled = self.postDroppButton.isEnabled
    }
    
    // Sends an image to the server
    func sendImage(_ droppId: String, _ image: UIImage, _ compression: Double, completion: @escaping (Int) -> Void) {
        let request = self.http.createImageRequest(droppId: droppId, token: self.token, params: [:], image: image, compression: compression)
        
        // Send the request to post the image and return the server response success or fail
        self.http.sendRequest(request: request) { response, json in
            completion(response.statusCode)
        }
    }
    
    // Sends text and metadata to the server
    func sendContent(_ message: String, _ hasImage: Bool, completion: @escaping (String) -> Void) {
        // Get the current location of the device
        let loc = locationManager.location!.coordinate
        let locString = "\(loc.latitude),\(loc.longitude)"
        
        // Get the current UNIX timestamp in seconds
        let timestamp = Int(NSDate().timeIntervalSince1970.rounded())
        
        let media = hasImage ? "true" : "false"
        
        // Create the dictionary for the request body
        let content = ["location": locString, "timestamp": timestamp, "text": message, "media": media] as [String: Any]
        
        let request = self.http.createPostRequest(path: "/dropps", token: self.token, body: content)
        
        // Send the request and receive the response
        self.http.sendRequest(request: request) { response, json in
            var droppId = ""
            
            // If the server returns 200, the post was successful and json contains the droppId
            if response.statusCode == 200 {
                droppId = json["droppId"]! as! String
            }
            
            completion(droppId)
        }
    }
    
    // Mark: Actions
    
    // Removes the photo in the ImageView if one is present.
    @IBAction func deletePhoto(_ sender: UIButton) {
        // If an image exists in the image view, remove it and hide the cancel button
        if self.imageView.image != nil {
            self.viewModule.fadeImage(imageView: self.imageView, endValue: 0.0, duration: 0.25, delay: 0.0) { _ in
                // Once they have faded out, remove the objects and reset the alpha
                self.imageView.image = nil
                self.cancelButton.isHidden = true
                self.imageView.alpha = 1.0
            }
            
            // If there is also no text in the text field, disable the post button
            self.postDroppButton.isEnabled = !self.messageView.text!.isEmpty
            self.trashDroppButton.isEnabled = self.postDroppButton.isEnabled
        }
    }
    
    // Resets the posting screen UI from an alert action
    func resetUI(_ alert: UIAlertAction) {
        self.resetUI()
    }
    
    // Resets the posting screen UI to the initial, empty state
    func resetUI() {
        DispatchQueue.main.async {
            self.viewModule.fadeImage(imageView: self.imageView, endValue: 0.0, duration: 0.15, delay: 0.0) { _ in
                // Once they have faded out, remove the objects and reset the alpha
                self.imageView.image = nil
                self.cancelButton.isHidden = true
                self.imageView.alpha = 1.0
            }
            
            self.viewModule.stopLoadingIcon(loadingIconView: self.loadingView, fadeTime: 0.25) { _ in }
            self.messageView.text = ""
            self.postDroppButton.isEnabled = false
            self.trashDroppButton.isEnabled = false
            self.messageView.resignFirstResponder()
            
            if self.spb != nil {
                self.spb.removeFromSuperview()
            }
        }
    }
    
    // Captures all data from the dropp screen and tries to send it to the server
    func uploadDropp(alert: UIAlertAction!) {
        self.viewModule.startLoadingIcon(loadingIconView: self.loadingView, fadeTime: 0.25) { _ in }
        
        // Determine whether the user has chosen a photo
        let imageExists = self.imageView.image != nil
        
        // Send an HTTP request to upload the dropp content
        self.sendContent(self.messageView.text!, imageExists) { droppId in
            // If a droppId is returned from the server, the upload was successful
            if droppId != "" {
                // If the user attached an image to their post, try to upload the image
                if imageExists {
                    // Send an HTTP request to upload the image
                    self.uploadImageOnly(droppId: droppId, image: self.imageView.image!, compression: 1.0)
                } else {
                    // Dropp was posted, so update the UI
                    sleep(1)
                    
                    self.viewModule.stopLoadingIcon(loadingIconView: self.loadingView, fadeTime: 1.0) { _ in }
                    DispatchQueue.main.async {
                        self.spb.skip()
                        self.fadeUploadProgressBar(duration: 1.0, delay: 0.0, value: 0.0){ _ in
                            self.spb.removeFromSuperview()
                        }
                    }
                    
                    self.alertSuccessfulUpload()
                    self.resetUI()
                }
            } else {
                self.fadeUploadProgressBar(duration: 0.1, delay: 0.0, value: 0.0) { _ in }
                self.alertFailedPost(droppId: "", compression: 1.0)
                print("Failed to post dropp during text upload")
            }
        }
    }
    
    func alertSuccessfulUpload() {
        let alert = self.viewModule.createAlert(title: "Dropped!", message: "")
        
        // Remove the alert message, it's not necessary
        alert.message = nil
        
        self.present(alert, animated: true, completion: nil)
        
        let when = DispatchTime.now() + 1.75
        DispatchQueue.main.asyncAfter(deadline: when) {
            alert.dismiss(animated: true, completion: nil)
        }
    }
    
    func uploadImageOnly(droppId: String, image: UIImage, compression: Double) {
        if !self.loadingView.isAnimatingGIF {
            self.viewModule.startLoadingIcon(loadingIconView: self.loadingView, fadeTime: 0.25) { _ in }
        }
        
        // Send an HTTP request to upload the image
        self.sendImage(droppId, image, compression) { statusCode in

            // If the image was uploaded successfully, reset the post dropp screen
            if statusCode == 200 {
                self.viewModule.stopLoadingIcon(loadingIconView: self.loadingView, fadeTime: 1.0) { _ in }
                // Delay the completion of the progress bar
                sleep(1)
                
                // Complete the progress bar
                DispatchQueue.main.async { self.spb.skip() }
                
                // Fade out the progress bar and then remove it from the super view
                self.fadeUploadProgressBar(duration: 1.0, delay: 0.0, value: 0.0) { _ in
                    DispatchQueue.main.async { self.spb.removeFromSuperview() }
                }
                
                // Reset all other UI components
                self.resetUI()
                self.alertSuccessfulUpload()
            } else {
                print("Failed to post dropp during image upload")

                // The upload failed, so remove the progress bar
                self.fadeUploadProgressBar(duration: 0.25, delay: 0.0, value: 0.0) { _ in
                    self.spb.removeFromSuperview()
                }
                
                /**
                 * The image upload failed because the image was too big. Display an alert
                 * with an attempt to call this method again with a lower quality value, aka
                 * a higher amount of compression
                 */
                if statusCode == 413 {
                    self.alertFailedPost(droppId: droppId, compression: compression - 0.1)
                } else {
                    // The image upload failed for some other reason, so try with the same compression rate
                    self.alertFailedPost(droppId: droppId, compression: compression)
                }
            }
        }
    }
    
    func fadeUploadProgressBar(duration: Double, delay: Double, value: Double, completion: @escaping () -> Void) {
        UIView.animate(withDuration: duration, delay: delay, options: UIViewAnimationOptions.curveEaseOut, animations: {
            self.spb.alpha = CGFloat(value)
        }, completion: { _ in
            completion()
        })
    }
    
    func startUploadProgressBar() {
        self.spb = SegmentedProgressBar(numberOfSegments: 1, duration: 8)
        self.spb.frame = CGRect(x: -2, y: 20, width: view.frame.width + 2, height: 4)
        self.spb.topColor = self.viewModule.salmonColor
        
        DispatchQueue.main.async {
            self.view.addSubview(self.spb)
            self.spb.startAnimation()
        }
    }

    // Attempts to send dropp to the server
    @IBAction func postMessage(_ sender: UIButton) {
         // Hide the keyboard
        self.messageView.resignFirstResponder()
        
        // Start the upload progress bar
        self.startUploadProgressBar()
        
        // Attempts server upload
        uploadDropp(alert: nil)
    }
    
    // Displays an alert to reset a dropp post
    @IBAction func trashDropp(_ sender: UIButton) {
        if self.imageView.image == nil && self.messageView.text.isEmpty {
            return
        }
        
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
        let alert = self.viewModule.createAlert(title: "Delete Dropp", message: "Are you sure you want to restart your dropp creation?")
        
        // Add the actions to the alert
        alert.addAction(yesAction)
        alert.addAction(noAction)

        // Display the alert
        present(alert, animated: true, completion: nil)
    }
    
    @IBAction func addPhoto(_ sender: UIButton) {
        let cancelAction = UIAlertAction(
            title: "Cancel",
            style: .cancel,
            handler: nil)
        
        let cameraAction = UIAlertAction(
            title: "Camera",
            style: .default,
            handler: self.takePicture)
        
        let photoLibraryAction = UIAlertAction(
            title: "Photo Library",
            style: .default,
            handler: self.photoFromLibrary)
        
        let sheet = self.viewModule.createActionSheet()
        
        sheet.addAction(cameraAction)
        sheet.addAction(photoLibraryAction)
        sheet.addAction(cancelAction)
        
        present(sheet, animated: true, completion: nil)
    }
    
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
                self.trashDroppButton.isEnabled = true
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
        self.trashDroppButton.isEnabled = true
    }
    
    // Removes the photo library view when the user presses cancel
    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        dismiss(animated: true, completion: nil)
        
        // Hide the cancel image button if no image is in the image view
        self.cancelButton.isHidden = self.imageView.image == nil
        
        // Disable the post button if there is no text written or image selected
        if self.imageView.image == nil && self.messageView.text.isEmpty {
            self.postDroppButton.isEnabled = false
            self.trashDroppButton.isEnabled = false
        }
    }
    
    // Opens the camera to take a photo
    func takePicture(_ alert: UIAlertAction) {
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
            self.trashDroppButton.isEnabled = true
        } else {
            // Display an alert because the device does not have a camera
            alertNoCamera()
        }
    }
    
    // Opens the photo library to pick a photo
    func photoFromLibrary(_ alert: UIAlertAction) {
        // Set properties about the image picker when choosing a photo
        
        // Ensures no edited versions of the photos
        picker.allowsEditing = false
        
        // Specifies the source as the device photo library, not the camera roll
        picker.sourceType = .photoLibrary
        picker.mediaTypes = UIImagePickerController.availableMediaTypes(for: .photoLibrary)!
        
        // Display the image picking screen
        present(picker, animated: true, completion: nil)
    }
    
    func alertFailedPost(droppId: String, compression: Double) {
        // Create action buttons for alert
        let cancelAction = UIAlertAction(
            title: "Cancel",
            style: .default,
            handler: { action in
                self.viewModule.stopLoadingIcon(loadingIconView: self.loadingView, fadeTime: 0.5) { _ in }
            })
        
        var retryAction: AnyObject
        if !droppId.isEmpty {
            retryAction = UIAlertAction(
                title: "Retry",
                style: .cancel,
                handler: { action in
                    self.uploadImageOnly(droppId: droppId, image: self.imageView.image!, compression: compression)
                })
        } else {
            retryAction = UIAlertAction(
                title: "Retry",
                style: .cancel,
                handler: uploadDropp)
        }
        
        // Create the alert controller
        let alert = self.viewModule.createAlert(title: "Failed Upload", message: "Sorry, we were unable to post your dropp")
        
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
        let alert = self.viewModule.createAlert(title: "No Camera", message: "Sorry, this device has no camera")
        
        // Add the action to the alert
        alert.addAction(okAction)

        // Display the alert
        present(alert, animated: true, completion: nil)
    }
    
    // Function performs UI changes when the keyboard appears
    func keyboardWillShow(notification: NSNotification) {
        if let keyboardSize = (notification.userInfo?[UIKeyboardFrameBeginUserInfoKey] as? NSValue)?.cgRectValue {
            // Fade out the image view and cancel button
            self.viewModule.fadeImage(imageView: self.imageView, endValue: 0.0, duration: 1.0, delay: 0.0) { _ in }
            self.cancelButton.isHidden = true
            
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
            self.viewModule.fadeImage(imageView: self.imageView, endValue: 1.0, duration: 1.0, delay: 0.0) { _ in }
            self.cancelButton.isHidden = self.imageView.image == nil
        }
    }
}

// MARK: Extensions

extension String {
    func trim() -> String {
        return self.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines)
    }
}
