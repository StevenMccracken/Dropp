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
    let viewModule = ViewModule()
    let locationManager = CLLocationManager()
    let cellIdentifier = "CellIdentifier"
    var dropps: [Dropp] = []
    let salmonColor: UIColor = UIColor(red: 1.0, green: 0.18, blue: 0.33, alpha: 1.0)
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.tableView.register(UITableViewCell.self, forCellReuseIdentifier: cellIdentifier)
        
        // Apply the salmon color to the nav bar buttons
        navigationController?.navigationBar.tintColor = UIColor.white
      navigationController?.navigationBar.titleTextAttributes = [NSAttributedStringKey.foregroundColor: UIColor.white]
        navigationController?.navigationBar.barTintColor = self.viewModule.salmonColor
        
        tabBarController?.tabBar.tintColor = self.viewModule.salmonColor
        
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
    
    func addDroppToFeed(dropp: Dropp) {
        self.dropps.append(dropp)
        let indexPath = IndexPath(row: self.dropps.count - 1, section: 0)
        self.tableView.insertRows(at: [indexPath], with: .automatic)
    }
    
    func addDroppsToFeed(dropps: [Dropp]) {
        for dropp in dropps {
            self.addDroppToFeed(dropp: dropp)
        }
        
        DispatchQueue.main.async {
            self.tableView.reloadData()
        }
    }
    
    @IBAction func updateFeed(_ sender: Any) {
        if self.dropps.count > 0 {
            let numOfUsersToDelete = self.dropps.count - 1
            for i in 0...numOfUsersToDelete {
                if self.dropps.count > 0 {
                    self.dropps.remove(at: 0)
                    let indexPath = IndexPath(row: 0, section: 0)
                    self.tableView.deleteRows(at: [indexPath], with: .automatic)
                }
            }

        }
        
        self.getDropps()
        self.tableView.reloadData()
    }
    
    func getDropps() {
        // Set the max distance parameter in meters
        let maxDistance = 100
        
        // Get the location's current device
        let location = locationManager.location!.coordinate.toString
        
        // Create request with parameters
        let params = ["location": location, "max-distance": maxDistance] as [String: Any]
        let request = self.http.createGetRequest(path: "/dropps", params: params)
        
        // Send the request and get the response
        self.http.sendRequest(request: request) { response, dropps in
            var closeDropps: [Dropp] = []
            if response.statusCode == 200 {
                // Go through all of the nearby dropps
//                for (droppId, droppJson) in dropps {
//                    let content = droppJson as! [String: Any]
//                    let dropp = Dropp(id: droppId,
//                                      user: content["username"] as! String,
//                                      location: content["location"] as! String,
//                                      timestamp: content["timestamp"] as! Int,
//                                      message: content["text"] as! String,
//                                      hasMedia: (content["media"] as! String) == "true")
//                    
//                    closeDropps.append(dropp)
//                }
                
                // Sort the dropps in descending order based on their timestamp
                closeDropps = closeDropps.sorted(by: { (a: Dropp, b: Dropp) -> Bool in
                    return a > b
                })
            } else {
                print("Failed to get nearby dropps")
            }
            
            self.addDroppsToFeed(dropps: closeDropps)
        }
    }
    
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // If the triggered segue is the "showUser" segue
        switch segue.identifier {
            case "showUser"?:
                // Figure out which row was just tapped
                if let row = tableView.indexPathForSelectedRow?.row {
                    // Get the item associated with this row and pass it along
                    let dropp = self.dropps[row]
                    let detailViewController = segue.destination as! DetailViewController
                    detailViewController.dropp = dropp
                    
                    let distance = dropp.distance(from: locationManager.location!)
                    detailViewController.distanceFromDropp = distance
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
        return self.dropps.count
    }

    
    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let dropp = self.dropps[indexPath.row]
        
        // var cell:UITableViewCell? = tableView.dequeueReusableCell(withIdentifier: cellIdentifier , for: indexPath)
        var cell = tableView.dequeueReusableCell(withIdentifier: cellIdentifier)
        if cell == nil {
            cell = UITableViewCell(style: UITableViewCellStyle.subtitle, reuseIdentifier: cellIdentifier)
        }
        
        cell = UITableViewCell(style: UITableViewCellStyle.subtitle, reuseIdentifier: cellIdentifier)
        cell?.configureFlatCell(with: UIColor.white, selectedColor: self.viewModule.salmonColor, roundingCorners: UIRectCorner(rawValue: 0))
        cell?.textLabel?.textColor = UIColor.black
        cell?.detailTextLabel?.textColor = UIColor.black
        cell?.cornerRadius = 5.0
        cell?.separatorHeight = 0
        if cell == nil {
            cell = UITableViewCell(style: UITableViewCellStyle.subtitle, reuseIdentifier: cellIdentifier)
        }
        
        // Access Hello icon from Assets
        var iconImage = UIImage(named: "Hello")
        if iconImage == nil {
            print("Icon image is nil")
        }
        
        let sizeZ = CGSize(width: 50.0, height: 50.0)
        UIGraphicsBeginImageContextWithOptions(sizeZ, false, 0.0)
        iconImage?.draw(in: CGRect(origin: CGPoint(x: 0, y: 0), size: sizeZ))
        iconImage = UIGraphicsGetImageFromCurrentImageContext()!
        UIGraphicsEndImageContext()
        
        cell?.imageView?.image = iconImage
        cell?.imageView?.layer.cornerRadius = 25
        cell?.imageView?.layer.masksToBounds = true
        
        
        // Add data to the cell
        let username = dropp.user
        let message = dropp.message.isEmpty ? "Dropped a photo" : "\(dropp.message)"
        cell?.textLabel?.text = username
        cell?.textLabel?.font = UIFont.boldSystemFont(ofSize: 15.0)
        cell?.detailTextLabel?.text = message

        return cell!
    }
    
    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        performSegue(withIdentifier: "showUser", sender: self)
    }
    
    override func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return 85.0
    }
}
