//
//  HTTPModule.swift
//  Dropp
//
//  Created by Steven McCracken on 5/4/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import Foundation

class HTTPModule {
    
    // If app is runnign on simulator, let path = localhost
    #if (arch(i386) || arch(x86_64)) && os(iOS)
        let apiPath = "http://localhost:8080"
    #else
        // Else, app is running on device. Connect it to computer running server locally
        let apiPath = "http://172.21.1.208:8080"
    #endif
    
    
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
    
    /**
     * Loops over the parameters dictionary, adding them to the body as a Content-Disposition with the boundary.
     * Then, adds the image as data, with the filename, the mime-type and with the boundary as before.
     */
    func createBody(parameters: [String: String],
                    boundary: String,
                    data: Data,
                    mimeType: String,
                    filename: String) -> Data {
        let body = NSMutableData()
        
        let boundaryPrefix = "--\(boundary)\r\n"
        
        for (key, value) in parameters {
            body.appendString(boundaryPrefix)
            body.appendString("Content-Disposition: form-data; name=\"\(key)\"\r\n\r\n")
            body.appendString("\(value)\r\n")
        }
        
        body.appendString(boundaryPrefix)
        body.appendString("Content-Disposition: form-data; name=\"image\"; filename=\"\(filename)\"\r\n")
        body.appendString("Content-Type: \(mimeType)\r\n\r\n")
        body.append(data)
        body.appendString("\r\n")
        body.appendString("--".appending(boundary.appending("--")))
        
        return body as Data
    }
    
    func getImage(request: URLRequest, completion: @escaping (HTTPURLResponse, Data?) -> Void) {
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            var httpResponse = HTTPURLResponse()
            
            // Catch any error while trying to send the request
            if error != nil {
                print(error!.localizedDescription)
                completion(httpResponse, data)
                return
            }
            
            // Request went to server, so parse the response JSON
            do {
                // Cast response to HTTPURLResponse to get more properties from the response
                httpResponse = response as! HTTPURLResponse
            } catch let error as NSError {
                // Catch errors trying to cast the response or deserialize the response body data
                print(error)
            }
            
            // Send the results to the caller
            completion(httpResponse, data)
        }
        
        task.resume()
    }
}

extension NSMutableData {
    func appendString(_ string: String) {
        let data = string.data(using: String.Encoding.utf8, allowLossyConversion: false)
        append(data!)
    }
}
