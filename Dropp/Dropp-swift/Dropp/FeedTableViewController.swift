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
    
    let http = HTTPModule()
    let locationManager = CLLocationManager()
    var userArr: [UserObject] = []
    let cellIdentifier = "CellIdentifier"
    var token = ""
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.token = UserDefaults.standard.value(forKey: "jwt") as! String
        
        // Ask for Authorisation from the User for location
        self.locationManager.requestAlwaysAuthorization()
        
        // For use in foreground
        self.locationManager.requestWhenInUseAuthorization()
        
        if CLLocationManager.locationServicesEnabled() {
            locationManager.delegate = self
            locationManager.desiredAccuracy = kCLLocationAccuracyNearestTenMeters
            locationManager.startUpdatingLocation()
        }
        
        self.getDropps()
        
        DispatchQueue.main.async {
            self.tableView.reloadData() // TODO: still doesn't make ui reload quicker
        }
        
        // Uncomment the following line to preserve selection between presentations
        // self.clearsSelectionOnViewWillAppear = false

        // Uncomment the following line to display an Edit button in the navigation bar for this view controller.
        // self.navigationItem.rightBarButtonItem = self.editButtonItem()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        self.tableView.reloadData()
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
    }
    
    func addNewUser(newUser: UserObject) {
        let newUserObj = newUser
        self.userArr.append(newUserObj)
        let indexPath = IndexPath(row: userArr.count - 1, section: 0)
        self.tableView.insertRows(at: [indexPath], with: .automatic)
    }
    
    @IBAction func updateFeed(_ sender: Any) {
        if self.userArr.count > 0 {
            let numOfUsersToDelete = self.userArr.count - 1
            for i in 0...numOfUsersToDelete {
                print(i)
                if self.userArr.count > 0 {
                    self.userArr.remove(at: 0)
                    var indexPath = IndexPath(row: 0, section: 0)
                    self.tableView.deleteRows(at: [indexPath], with: .automatic)
                }
            }

        }
        self.getDropps()
    }
    
    func getDropps() {
        // Set the max distance parameter in meters
        let maxDistance = 100
        
        // Get the location's current device
        let loc = locationManager.location!.coordinate
        let locString = "\(loc.latitude),\(loc.longitude)"
        
        let body = ["location": locString, "maxDistance": maxDistance] as [String: Any]
        
        if let jsonBody = try? JSONSerialization.data(withJSONObject: body, options: .prettyPrinted) {
            // Create the URL request with the path to get nearby dropps
            var request  = URLRequest(url: URL(string: "\(self.http.apiPath)/location/dropps")!)
            
            // Set the request type to POST
            request.httpMethod = "POST"
            
            // Set the content type of the body
            request.addValue("application/json", forHTTPHeaderField: "Content-Type")
            
            // Add the token to the request
            request.addValue(self.token, forHTTPHeaderField: "Authorization")
            
            // Add the JSON parameters to the request body
            request.httpBody = jsonBody
            
            // Send the request and get the response
            self.http.sendRequest(request: request) { response, json in
                if response.statusCode == 200 {
                    // Get the dropps from the response json
                    let dropps = json["dropps"] as! [String:Any]
                    print(dropps)
                    
                    // Go through all of the nearby dropps
                    for (key, value) in dropps {
                        let nestedDic = value as! [String:Any]
                        let usernameStr = nestedDic["username"]!
                        let userText = nestedDic["text"]!
                        let userTimestamp = nestedDic["timestamp"]!
                        let userLocation = nestedDic["location"]!
                        let hasPicture = nestedDic["media"]!
                        
                        let newUsr = UserObject(pUserId: usernameStr as! String,
                                                pTimestamp: userTimestamp as! Int,
                                                pMessage: userText as! String,
                                                pLoc: userLocation as! String)
                        
                        self.addNewUser(newUser: newUsr)
                    }
                } else {
                    print("Failed to get nearby dropps")
                    print(json)
                }
            }
        }
    }
    
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // If the triggered segue is the "showUser" segue
        switch segue.identifier {
        case "showUser"?:
            // Figure out which row was just tapped
            if let row = tableView.indexPathForSelectedRow?.row {
                // Get the item associated with this row and pass it along
                let user = self.userArr[row]
                let detailVC = segue.destination as! DetailViewController
                detailVC.userObj = user
            }
        default:
            preconditionFailure("Unexpected segue identifier.")
        }
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
//        let date = user.timestamp!
//        let loc = user.location!
        let userId = user.userId!
        let message = user.message!
        let sublabel = "\(userId) said '\(message)'\n"
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
