//
//  ProfileView.swift
//  Dropp
//
//  Created by Steven McCracken on 6/26/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import UIKit
import Foundation

class ProfileView: UIViewController, UITableViewDataSource, UITableViewDelegate {
    @IBOutlet weak var username: UILabel!
    @IBOutlet weak var followerCount: UILabel!
    @IBOutlet weak var followingCount: UILabel!
    @IBOutlet weak var followersButton: UIButton!
    @IBOutlet weak var followsButton: UIButton!
    @IBOutlet weak var tableView: UITableView!
    
//    let http = HTTPModule()
//    let viewModule = ViewModule()
    var dropps: [Dropp] = []
    var profileUsername = "User"
    let cellIdentifier = "CellIdentifier"
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.profileUsername = UserDefaults.standard.value(forKey: "username") as! String
        self.username.text = self.profileUsername
        
        // Fetch followers and follows
        self.getFollowers()
        self.getFollows()
        
        self.tableView.delegate = self as! UITableViewDelegate
        self.tableView.dataSource = self as! UITableViewDataSource
        
        // Fetch the dropps of that user
        self.getDropps()
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated
    }
    
    func getDropps() {
        let path = "/users/\(self.profileUsername)/dropps"
//        let request = self.http.createGetRequest(path: path, params: [:])
//
//        // Send the request and get the response
//        self.http.sendRequest(request: request) { response, json in
//            var dropps: [Dropp] = []
//            if response.statusCode == 200 {
//                // Go through all of the nearby dropps
////                for (droppId, droppJson) in json {
////                    let content = droppJson as! [String: Any]
////                    let dropp = Dropp(id: droppId,
////                                      user: content["username"] as! String,
////                                      location: content["location"] as! String,
////                                      timestamp: content["timestamp"] as! Int,
////                                      message: content["text"] as! String,
////                                      hasMedia: (content["media"] as! String) == "true")
////
////                    dropps.append(dropp)
////                }
//
//                // Sort the dropps in descending order based on their timestamp
//                dropps = dropps.sorted(by: { (a: Dropp, b: Dropp) -> Bool in
//                    return a > b
//                })
//            } else {
//                print("Failed to get nearby dropps")
//            }
//
//            self.addDroppsToFeed(dropps: dropps)
//        }
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

    
    func getConnections(type: String, completion: @escaping ([String]) -> Void) {
        let path = "/users/\(self.profileUsername)/\(type)"
//        let request = self.http.createGetRequest(path: path, params: [:])
//
//        self.http.sendRequest(request: request) { response, json in
//            print(json)
//            var connections: [String] = []
//            if response.statusCode == 200 {
//                for (connectionKey, _) in json {
//                    connections.append(connectionKey)
//                }
//            } else {
//                print("Failed getting connections: \(response.statusCode)")
//            }
//
//            completion(connections)
//        }
    }
    
    func getFollowers() {
        self.getConnections(type: "followers") { followers in
            DispatchQueue.main.async {
                self.followerCount.text = "\(followers.count)"
            }
            
        }
    }
    
    func getFollows() {
        self.getConnections(type: "follows") { follows in
            DispatchQueue.main.async {
                self.followingCount.text = "\(follows.count)"
            }
        }
    }
    
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return 85.0
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return self.dropps.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let dropp = self.dropps[indexPath.row]
        
        // var cell:UITableViewCell? = tableView.dequeueReusableCell(withIdentifier: cellIdentifier , for: indexPath)
        var cell = tableView.dequeueReusableCell(withIdentifier: cellIdentifier)
        if cell == nil {
            cell = UITableViewCell(style: UITableViewCellStyle.subtitle, reuseIdentifier: cellIdentifier)
        }
        
        cell = UITableViewCell(style: UITableViewCellStyle.subtitle, reuseIdentifier: cellIdentifier)
//        cell?.configureFlatCell(with: UIColor.white, selectedColor: self.viewModule.salmonColor, roundingCorners: UIRectCorner(rawValue: 0))
//        cell?.textLabel?.textColor = UIColor.black
//        cell?.detailTextLabel?.textColor = UIColor.black
//        cell?.cornerRadius = 5.0
//        cell?.separatorHeight = 0
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
}
