//
//  FeedTableViewController.swift
//  Dropp
//
//  Created by Pongsakorn Cherngchaosil on 4/6/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import UIKit
import CoreLocation

class FeedTableViewController: UITableViewController, CLLocationManagerDelegate {
    
    let locationManager = CLLocationManager()
    var userArr: [UserObject] = []
    let cellIdentifier = "CellIdentifier"
    
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
        // After the view is loaded, fetch the data from the server
        getDropps()

        // Uncomment the following line to preserve selection between presentations
        // self.clearsSelectionOnViewWillAppear = false

        // Uncomment the following line to display an Edit button in the navigation bar for this view controller.
        // self.navigationItem.rightBarButtonItem = self.editButtonItem()
//        let user1 = UserObject(pUserId: "0", pLocation: "USU", pTimestamp: "March 12, 2017", pContent: "Content 1", pText: "Text 1")
//        let user2 = UserObject(pUserId: "1", pLocation: "USU", pTimestamp: "March 12, 2017", pContent: "Content 1", pText: "Text 1")
//        let user3 = UserObject(pUserId: "2", pLocation: "USU", pTimestamp: "March 12, 2017", pContent: "Content 1", pText: "Text 1")
//        let user4 = UserObject(pUserId: "3", pLocation: "USU", pTimestamp: "March 12, 2017", pContent: "Content 1", pText: "Text 1")
//        let user5 = UserObject(pUserId: "4", pLocation: "USU", pTimestamp: "March 12, 2017", pContent: "Content 1", pText: "Text 1")
//        userArr.append(user1)
//        userArr.append(user2)
//        userArr.append(user3)
//        userArr.append(user4)
//        userArr.append(user5)
        
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
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
                            let newUser = UserObject(pUserId: user, pLocation: loc, pTimestamp: "\(timestamp)", pContent: "", pText: message)
                            print(sublabel)
                            self.userArr.append(newUser)
                        }
                        
                    } catch let error as NSError {
                        print(error)
                    }
                }
            }
            task.resume()
        }
        return droppList
    }

    // MARK: - Table view data source

    override func numberOfSections(in tableView: UITableView) -> Int {
        // #warning Incomplete implementation, return the number of sections
        return 1
    }

    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        // #warning Incomplete implementation, return the number of rows
        return userArr.count
    }

    
    override func tableView(_ tableView: UITableView,
                            cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let user = userArr[indexPath.row]
        
        let cell = tableView.dequeueReusableCell(withIdentifier: cellIdentifier , for: indexPath)

        // Configure the cell...
        let date = user.timestamp
        let loc = user.location
        let userId = user.userId
        let message = user.text
        let sublabel = "On \(date) at (\(loc)), \(userId) said '\(message)'\n"
        cell.textLabel?.text = sublabel

        return cell
    }
    
    

    /*
    // Override to support conditional editing of the table view.
    override func tableView(_ tableView: UITableView, canEditRowAt indexPath: IndexPath) -> Bool {
        // Return false if you do not want the specified item to be editable.
        return true
    }
    */

    /*
    // Override to support editing the table view.
    override func tableView(_ tableView: UITableView, commit editingStyle: UITableViewCellEditingStyle, forRowAt indexPath: IndexPath) {
        if editingStyle == .delete {
            // Delete the row from the data source
            tableView.deleteRows(at: [indexPath], with: .fade)
        } else if editingStyle == .insert {
            // Create a new instance of the appropriate class, insert it into the array, and add a new row to the table view
        }    
    }
    */

    /*
    // Override to support rearranging the table view.
    override func tableView(_ tableView: UITableView, moveRowAt fromIndexPath: IndexPath, to: IndexPath) {

    }
    */

    /*
    // Override to support conditional rearranging of the table view.
    override func tableView(_ tableView: UITableView, canMoveRowAt indexPath: IndexPath) -> Bool {
        // Return false if you do not want the item to be re-orderable.
        return true
    }
    */

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
