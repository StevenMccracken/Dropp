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
    let salmonColor: UIColor = UIColor(red: 1.0, green: 0.18, blue: 0.33, alpha: 1.0)
    var token = ""
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Apply the salmon color to the nav bar buttons
        navigationController?.navigationBar.tintColor = self.salmonColor
        
        // Get the token from user defaults
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
        
        DispatchQueue.main.async {
            self.getDropps()
        }
        
        self.tableView.reloadData()
        
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
                    let indexPath = IndexPath(row: 0, section: 0)
                    self.tableView.deleteRows(at: [indexPath], with: .automatic)
                }
            }

        }
        
        self.getDropps()
        self.tableView.reloadData() // TODO: still doesn't make ui reload quicker
    }
    
    func getDropps() {
        // Set the max distance parameter in meters`
        let maxDistance = 100
        
        // Get the location's current device
        let loc = locationManager.location!.coordinate
        let locString = "\(loc.latitude),\(loc.longitude)"
        let body = ["location": locString, "maxDistance": maxDistance] as [String: Any]
        
        let request = self.http.createPostRequest(path: "/location/dropps", token: self.token, body: body)
        
        // Send the request and get the response
        self.http.sendRequest(request: request) { response, json in
            if response.statusCode == 200 {
                // Get the dropps from the response json
                let dropps = json["dropps"] as! [String:Any]
                
                // Go through all of the nearby dropps
                for (key, value) in dropps {
                    let nestedDic = value as! [String:Any]
                    let usernameStr = nestedDic["username"]!
                    let userText = nestedDic["text"]!
                    let userTimestamp = nestedDic["timestamp"]!
                    let userLocation = nestedDic["location"]!
                    let hasPicture = nestedDic["media"]!
                    
                    let newUsr = UserObject(pDroppId: key,
                                            pUsername: usernameStr as! String,
                                            pTimestamp: userTimestamp as! Int,
                                            pMessage: userText as! String,
                                            pLoc: userLocation as! String,
                                            pMedia: hasPicture as! Bool)
                    
                    self.addNewUser(newUser: newUsr)
                }
            } else {
                print("Failed to get nearby dropps")
                print(json)
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
                    
                    let droppLocArr = user.location!.components(separatedBy: ",")
                    let droppLat = Double(droppLocArr[0])
                    let droppLong = Double(droppLocArr[1])
                    
                    let droppCoordinate = CLLocation(latitude: droppLat!, longitude: droppLong!)
                    let currentUserCoordinate = locationManager.location!
                    let distanceInMeters = droppCoordinate.distance(from: currentUserCoordinate)
                    detailVC.distanceFromDropp = distanceInMeters
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
        cell.configureFlatCell(with: UIColor.white, selectedColor: UIColor(red: 1.0, green: 0.18, blue: 0.33, alpha: 1.0), roundingCorners: UIRectCorner(rawValue: 0))
        cell.textLabel?.textColor = UIColor.black
        cell.cornerRadius = 5.0
        cell.separatorHeight = 0
        
        // Configure the cell...
        let userId = user.username!
        let message = user.message!
        let sublabel = "\(userId) said '\(message)'\n"
        cell.textLabel?.text = sublabel

        return cell
    }
    
}
