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
    var token = "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJkZXRhaWxzIjp7ImVtYWlsIjoidGVzdEB0ZXN0LmNvbSJ9LCJpYXQiOjE0OTM3MDA2MTUsImV4cCI6MTQ5NjI5MjYxNX0.K2AlNLMPT-JOKNY6QueWAtubKaOhjWlRjPYD3o0eSeA"
    
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
        
        if self.token == "" {
            var tokenz = getToken(username: "test", password: "test")
            // After the view is loaded, fetch the data from the server
            while self.token.isEmpty {
                print("fuck you Steve")
            }
            print("Anal")
        }
        print("Fuck you leaf")
        
        getDropps()
        tableView.reloadData()
        // Uncomment the following line to preserve selection between presentations
        // self.clearsSelectionOnViewWillAppear = false

        // Uncomment the following line to display an Edit button in the navigation bar for this view controller.
//         self.navigationItem.rightBarButtonItem = self.editButtonItem()
//        let user1 = UserObject(pUserId: "1", pMessage: "hello1")
//        let user2 = UserObject(pUserId: "2", pMessage: "hello2")
//        let user3 = UserObject(pUserId: "3", pMessage: "hello3")
//        let user4 = UserObject(pUserId: "4", pMessage: "hello4")
//        let user5 = UserObject(pUserId: "5", pMessage: "hello5")
//        userArr.append(user1)
//        userArr.append(user2)
//        userArr.append(user3)
//        userArr.append(user4)
//        userArr.append(user5)
        
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        tableView.reloadData()
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
    }
    
    func getToken(username: String, password: String) -> String {
        print("Hi")
        let dict = ["username": username, "password": password] as [String: Any]
        var tokenStr = ""
        
        if let jsonData = try? JSONSerialization.data(withJSONObject: dict, options: .prettyPrinted) {
            let url = NSURL(string: "https://dropps.me/authenticate")!
            let request = NSMutableURLRequest(url: url as URL)
            request.httpMethod = "POST"
            
            request.addValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = jsonData
            
            let task = URLSession.shared.dataTask(with: request as URLRequest) { (data, response, error) in
                if error != nil {
                    //print(error)
                    print("error in getToken")
                } else {
                    do {
                        print("Do")
                        let parsedData = try JSONSerialization.jsonObject(with: data!, options: []) as! [String:Any]
                        print(parsedData)
                        
                        if parsedData["error"] != nil {
                            print(parsedData["error"]!)
                            print("Error in parsedData")
                        } else {
                            let success = parsedData["success"] as? [String: Any]
                            self.token = success?["token"] as! String
                            print("Printing self.token")
                            print(self.token)
//                            print(success)
                            print("Success in getToken")
                            // TODO: get token and set global value
                        }
                        print("Hello")
                    } catch let error as NSError {
                        print("catching error")
                        print(error)
                    }
                }
            }
            task.resume()
            print("jsonData: ")
            print(jsonData)
        }

        return tokenStr
    }
    
    func getDropps() -> String {
        print("getDropps()")
        var droppList = ""
        
        let maxDistance = 100 // meters
        let loc = locationManager.location!.coordinate
        let locString = "\(loc.latitude),\(loc.longitude)"
        
        let dict = ["location": locString, "maxDistance": maxDistance] as [String: Any]
        
        if let jsonData = try? JSONSerialization.data(withJSONObject: dict, options: .prettyPrinted) {
            //            let url = NSURL(string: "http://138.68.246.136:3000/api/dropps/location")!
            //let url = NSURL(string: "http://dropped.me:3000/api/dropps/location")!
            let url = NSURL(string: "https://dropps.me/location/dropps")!
            let request = NSMutableURLRequest(url: url as URL)
            request.httpMethod = "POST"
            
            request.addValue("application/json", forHTTPHeaderField: "Content-Type")
            request.addValue(self.token, forHTTPHeaderField: "Authorization")
            request.httpBody = jsonData
            
            // add key:value "Authorization": <token> to headers
            
            let task = URLSession.shared.dataTask(with: request as URLRequest) { (data, response, error) in
                if error != nil {
                    //print(error)
                } else {
                    do {
                        let parsedData = try JSONSerialization.jsonObject(with: data!, options: []) as! [String:Any]
                        print("printing parsed Data")
                        print(parsedData)
                        let droppJson = parsedData["dropps"] as! [String:Any]
                        print("droppedJson")
                        print(droppJson)
                        
                        for (key, value) in droppJson {
                            let nestedDic = value as! [String:Any]
                            let nestedContentDic = nestedDic["content"] as! [String:Any]
                            let usernameStr = nestedDic["username"]!
                            let userText = nestedContentDic["text"]!
                            print("\(usernameStr) said \(userText)")
                            let newUsr = UserObject(pUserId: usernameStr as! String, pMessage: userText as! String)
                            self.userArr.append(newUsr)
//                            print(nestedDic["username"]!)
//                            print(nestedContentDic["text"]!)
                        }
                        
                       
                        
//                        for row in parsedData {
//                            // Get the key/value info from the JSON
//                            let dropp = parsedData[row.key] as! [String:Any]
//                            print("fuck you steve")
//                            print(dropp)
//                            // Extract specific info from that JSON entry
//                            let user = dropp["username"] as! String
//                            let loc = dropp["location"] as! String
//                            
//                            let timestamp = dropp["timestamp"] as! Int
//                            let date = NSDate(timeIntervalSince1970: TimeInterval(timestamp))
//                            
//                            let content = dropp["content"] as! [String:Any]
//                            let message = content["text"] as! String
//                            
//                            let sublabel = "On \(date) at (\(loc)), \(user) said '\(message)'\n"
//                            let newUser = UserObject(pUserId: user, pLocation: loc, pTimestamp: timestamp, pContent: "", pText: message)
//                            print(sublabel)
//                            print("Creating new user")
//                            self.userArr.append(newUser)
//                        }
                        
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
