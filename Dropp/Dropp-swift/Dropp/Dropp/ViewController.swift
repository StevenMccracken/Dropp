//
//  ViewController.swift
//  Dropp
//
//  Created by Steven McCracken on 2/20/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import UIKit
import CoreLocation

class ViewController: UIViewController, UITextFieldDelegate, UIImagePickerControllerDelegate, UINavigationControllerDelegate, CLLocationManagerDelegate {
    //MARK: Properties
    @IBOutlet weak var messageTextField: UITextField!
    @IBOutlet weak var imageView: UIImageView!
    @IBOutlet weak var messageLabel: UILabel!
    
    let picker = UIImagePickerController()
    let locationManager = CLLocationManager()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        messageTextField.delegate = self
        picker.delegate = self
        
        // Ask for Authorisation from the User for location
        self.locationManager.requestAlwaysAuthorization()
        
        // For use in foreground
        self.locationManager.requestWhenInUseAuthorization()
        
        if CLLocationManager.locationServicesEnabled() {
            locationManager.delegate = self
            locationManager.desiredAccuracy = kCLLocationAccuracyNearestTenMeters
            locationManager.startUpdatingLocation()
        }
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated
    }
    
    func sendMessage(_ text: String) {
        let loc = locationManager.location!.coordinate
        let locString = "\(loc.latitude),\(loc.longitude)"
        let time = NSDate().timeIntervalSince1970
        let user = UIDevice.current.name // UPDATE TO USER PROFILE NAME
        let dict = ["location": locString, "timestamp": time, "text": text, "media": "", "user_id": user] as [String: Any]
        
        if let jsonData = try? JSONSerialization.data(withJSONObject: dict, options: .prettyPrinted) {
            let url = NSURL(string: "http://localhost:3000/api/dropps")!
            let request = NSMutableURLRequest(url: url as URL)
            request.httpMethod = "POST"
            
            request.addValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = jsonData
            
            let task = URLSession.shared.dataTask(with: request as URLRequest){ data,response,error in
                if error != nil{
                    print(error?.localizedDescription)
                    return
                }
                
                do {
                    // IF RESPONSE IS JUST TEXT USE THIS LINE
                    let responseData = String(data: data!, encoding: String.Encoding.utf8)
                    
                    // IF RESPONSE IS A JSON USE THESE LINES
                    //let json = try JSONSerialization.jsonObject(with: data, options: .allowFragments) as! [String:Any]
                    //let responseData = json["dropps"] as? [[String: Any]] ?? []
                    
                    print(responseData!)
                    
                } catch let error as NSError {
                    print(error)
                }        
            }          
            task.resume()
        }
    }
    
    // Mark: Actions
    @IBAction func getDropp(_ sender: UIButton) {
        let url = NSURL(string: "http://localhost:3000/api/dropps/-KfrvxsaEs2MI_TFX7Kx")!
        let request = NSMutableURLRequest(url: url as URL)
        request.httpMethod = "GET"
        
        let task = URLSession.shared.dataTask(with: request as URLRequest) { (data, response, error) in
            if error != nil {
                print(error)
            } else {
                do {
                    let parsedData = try JSONSerialization.jsonObject(with: data!, options: []) as! [String:Any]
                    let content = parsedData["content"] as! [String:Any]
                    let location = parsedData["location"] as! String
                    let timestamp = parsedData["timestamp"] as! Int
                    let user = parsedData["user_id"] as! String
                    
                    for (key, value) in content {
                        print("\(key) - \(value) ")
                    }
                    print(location)
                    print(timestamp)
                    print(user)
                    
                } catch let error as NSError {
                    print(error)
                }
            }
        }
        task.resume()
    }

    @IBAction func postMessage(_ sender: UIButton) {
        messageTextField.resignFirstResponder() // Hide the keyboard
        messageLabel.text = messageTextField.text
        messageTextField.text = ""
        sendMessage(messageLabel.text!)
    }
    
    // Opens the camera to take a photo or video
    @IBAction func takePicture(_ sender: UIButton) {
        if UIImagePickerController.isSourceTypeAvailable(.camera) {
            picker.allowsEditing = false
            picker.sourceType = UIImagePickerControllerSourceType.camera
            picker.cameraCaptureMode = .photo
            picker.modalPresentationStyle = .fullScreen
            present(picker,animated: true,completion: nil)
        } else {
            noCamera()
        }
    }
    
    // Opens the photo library to pick a photo or video
    @IBAction func photoFromLibrary(_ sender: UIButton) {
        picker.allowsEditing = false // Ensures no edited versions of the photos
        picker.sourceType = .photoLibrary
        picker.mediaTypes = UIImagePickerController.availableMediaTypes(for: .photoLibrary)!
        present(picker, animated: true, completion: nil)
    }
    
    //MARK: Delegates
    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        textField.resignFirstResponder() // Hide the keyboard
        return true
    }
    
    func textFieldDidEndEditing(_ textField: UITextField) {
        // Do nothing
    }
    
    func imagePickerController(_ picker: UIImagePickerController,
                               didFinishPickingMediaWithInfo info: [String : AnyObject]) {
        let chosenImage = info[UIImagePickerControllerOriginalImage] as! UIImage
        imageView.image = chosenImage
        dismiss(animated: true, completion: nil)
    }
    
    // Removes the photo library view when the user presses cancel
    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        dismiss(animated: true, completion: nil)
    }
    
    func noCamera() {
        let alertVC = UIAlertController(
            title: "No Camera",
            message: "Sorry, this device has no camera",
            preferredStyle: .alert)
        let okAction = UIAlertAction(
            title: "OK",
            style:.default,
            handler: nil)
        
        alertVC.addAction(okAction)
        present(alertVC, animated: true, completion: nil)
    }
}
