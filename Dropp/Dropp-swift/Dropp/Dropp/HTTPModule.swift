//
//  HTTPModule.swift
//  Dropp
//
//  Created by Steven McCracken on 5/4/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import Foundation

class HTTPModule {
    let apiPath = "http://localhost:8080"
    
    func sendRequest(request: URLRequest, completion: @escaping (HTTPURLResponse, [String: Any]) -> Void) {
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            var httpResponse = HTTPURLResponse()
            var responseJson = [String: Any]()
            
            // Catch any error while trying to send the request
            if error != nil {
                print(error!.localizedDescription)
                completion(httpResponse, responseJson)
                return
            }
            
            // Request went to server, so parse the response JSON
            do {
                // Cast response to HTTPURLResponse to get more properties from the response
                httpResponse = response as! HTTPURLResponse
                
                // Deserialize the response body data into a JSON dictionary
                responseJson = try JSONSerialization.jsonObject(with: data!, options: .allowFragments) as! [String: Any]
            } catch let error as NSError {
                // Catch errors trying to cast the response or deserialize the response body data
                print(error)
            }
            
            // Send the results to the caller
            completion(httpResponse, responseJson)
        }
        
        task.resume()
    }
    
    func getNewToken(completion: @escaping (String) -> Void) {
        let username = "test"
        let password = "test"
        
        // Create the dictionary for the request body
        let body = ["username": username, "password": password] as [String: Any]
        
        // Stringify the dictionary to standard JSON format
        if let jsonBody = try? JSONSerialization.data(withJSONObject: body, options: .prettyPrinted) {
            // Create the URL request with the path to post a dropp
            var request  = URLRequest(url: URL(string: "\(self.apiPath)/authenticate")!)
            
            // Set method to POST
            request.httpMethod = "POST"
            
            // Specify body type in request headers
            request.addValue("application/json", forHTTPHeaderField: "Content-Type")
            
            // Add JSON data to request body
            request.httpBody = jsonBody
            
            self.sendRequest(request: request) { response, json in
                var token = ""
                if response.statusCode == 200 {
                    let success = json["success"] as! [String: String]
                    token = success["token"]!
                } else {
                    // Error
                }
                
                completion(token)
            }
        }
    }
}
