//
//  HTTPModule.swift
//  Dropp
//
//  Created by Steven McCracken on 5/4/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import UIKit
import Foundation

class HTTPModule {
    
    let apiPath = "https://dropps.me"
    
    func createImageRequest(droppId: String, params: [String: String], image: UIImage, compression: Double) -> URLRequest {
        var request = self.createRequest(path: "/dropps/\(droppId)/image")
        request.httpMethod = "POST"
        
        let boundary = "Boundary-\(UUID().uuidString)"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        
        // Add parameters to the HTTP body
        request.httpBody = self.createBody(parameters: params,
                                           boundary: boundary,
                                           data: UIImageJPEGRepresentation(image, CGFloat(compression))!,
                                           mimeType: "image/jpeg",
                                           filename: "image.jpg")
        
        return request
    }
    
    func createGetRequest(path: String, params: [String: Any]) -> URLRequest {
        var request = self.createJsonRequest(path: path)
        
        // Set the request type
        request.httpMethod = "GET"
        
        // Add each parameter key-value to the request headers
        for (key, value) in params {
            request.addValue("\(value)", forHTTPHeaderField: key)
        }
        
        return request
    }
    
    func createPostRequest(path: String, body: [String: Any]) -> URLRequest {
        var request = self.createJsonRequest(path: path)
        
        // Set the request type
        request.httpMethod = "POST"
                
        // Add the body to the request for x-www-form-urlencoded
        request.httpBody = self.createParamsData(params: body)
        
        return request
    }
    
    func createParamsData(params: [String: Any]) -> Data {
        let paramsData = NSMutableData()
        var first = true
        for (key, value) in params {
            if !first {
                paramsData.appendString("&")
            } else {
                first = false
            }
            
            paramsData.appendString("\(key)=\(value)")
        }
        
        return paramsData as Data
    }
    
    private func createJsonRequest(path: String) -> URLRequest {
        // Create the URL request with the given path
        var request  = self.createRequest(path: path)
        
        // Set the content type of the body
        request.addValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
        
        return request
    }
    
    private func createRequest(path: String) -> URLRequest {
        // Create the URL request with the given path
        var request  = URLRequest(url: URL(string: "\(self.apiPath)\(path)")!)
        
        // Add the token to the request
        if UserDefaults.standard.value(forKey: "jwt") != nil {
            let jwt = UserDefaults.standard.value(forKey: "jwt") as! String
            request.addValue(jwt, forHTTPHeaderField: "Authorization")
        } else {
            // No token for request
        }
        
        
        return request
    }
    
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
            
            // Cast response to HTTPURLResponse to get more properties from the response
            httpResponse = response as! HTTPURLResponse
            
            if httpResponse.statusCode == 413 {
                print("Request body is too large, the server denied the request")
                completion(httpResponse, responseJson)
                return
            } else if httpResponse.statusCode != 200 && httpResponse.statusCode != 201 {
                print("Request was denied")
            } else {
                print("Request succeeded")
            }
            
            // Request went to server, so parse the response JSON
            do {
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
        let username = UserDefaults.standard.value(forKey: "username") as! String
        let password = UserDefaults.standard.value(forKey: "password") as! String
        
        // Create the dictionary for the request body
        let body = ["username": username, "password": password]
        
        let request = self.createPostRequest(path: "/authenticate", body: body)
        
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
            
            // Cast response to HTTPURLResponse to get more properties from the response
            httpResponse = response as! HTTPURLResponse
            
            // Send the results to the caller
            completion(httpResponse, data)
        }
        
        task.resume()
    }
}
