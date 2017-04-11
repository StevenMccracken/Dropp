//
//  FeedViewController.swift
//  Dropp
//
//  Created by Steven McCracken on 3/27/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import UIKit
import CoreLocation

class FeedViewController: UIViewController, CLLocationManagerDelegate {
    @IBOutlet weak var dropps: UILabel!
    let locationManager = CLLocationManager()

    override func viewDidLoad() {
        super.viewDidLoad()
        
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
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        let dropp_list = getDropps()
        DispatchQueue.main.async(execute: {
            self.dropps.text = dropp_list
        })
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    @IBAction func returned(segue: UIStoryboardSegue) {
        
    }
    
    func getDropps() -> String {
        var droppList = ""
        
        let maxDistance = 100 // meters
        let loc = locationManager.location!.coordinate
        let locString = "\(loc.latitude),\(loc.longitude)"
        
        let dict = ["location": locString, "max_distance": maxDistance] as [String: Any]
        
        if let jsonData = try? JSONSerialization.data(withJSONObject: dict, options: .prettyPrinted) {
//            let url = NSURL(string: "http://138.68.246.136:3000/api/dropps/location")!
            let url = NSURL(string: "http://dropped.me:3000/api/dropps/location")!
            let request = NSMutableURLRequest(url: url as URL)
            request.httpMethod = "POST"
            
            request.addValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = jsonData
        
            let task = URLSession.shared.dataTask(with: request as URLRequest) { (data, response, error) in
                if error != nil {
                    print(error)
                } else {
                    do {
                        let parsedData = try JSONSerialization.jsonObject(with: data!, options: []) as! [String:Any]
                        
                        for row in parsedData {
                            // Get the key/value info from the JSON
                            let dropp = parsedData[row.key] as! [String:Any]
                            
                            // Extract specific info from that JSON entry
                            let user = dropp["user_id"] as! String
                            let loc = dropp["location"] as! String
                            
                            let timestamp = dropp["timestamp"] as! Int
                            let date = NSDate(timeIntervalSince1970: TimeInterval(timestamp))
                            
                            let content = dropp["content"] as! [String:Any]
                            let message = content["text"] as! String
                            
                            let sublabel = "On \(date) at (\(loc)), \(user) said '\(message)'\n"
                            print(sublabel)
                            droppList.append(sublabel)
                        }
                        self.dropps.text = droppList
                        
                    } catch let error as NSError {
                        print(error)
                    }
                }
            }
            task.resume()
        }
        return droppList
    }

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
