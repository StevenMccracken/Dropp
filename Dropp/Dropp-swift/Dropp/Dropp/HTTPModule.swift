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
    
    func createImageRequest(droppId: String, token: String, params: [String: String], image: UIImage, compression: Double) -> URLRequest {
        var request = self.createRequest(path: "/dropps/\(droppId)/image", token: token)
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
    
    func createGetRequest(path: String, token: String) -> URLRequest {
        var request = self.createJsonRequest(path: path, token: token)
        
        // Set the request type
        request.httpMethod = "GET"
        
        return request
    }
    
    func createPostRequest(path: String, token: String, body: [String: Any]) -> URLRequest {
        var request = self.createJsonRequest(path: path, token: token)
        
        // Set the request type
        request.httpMethod = "POST"
        
        // Add the parameters in the dictionary to a string as key=value pairs separated by &'s
        var params = ""
        var first = true
        for (key, value) in body {
            if !first {
                params += "&"
            } else {
                first = false
            }
            
            params += "\(key)=\(value)"
        }
                
        // Add the body to the request for x-www-form-urlencoded
        let encodedParams = params.data(using:String.Encoding.utf8, allowLossyConversion: false)
        request.httpBody = encodedParams
        
        return request
    }
    
    private func createJsonRequest(path: String, token: String) -> URLRequest {
        // Create the URL request with the given path
        var request  = self.createRequest(path: path, token: token)
        
        // Set the content type of the body
        request.addValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
        
        return request
    }
    
    private func createRequest(path: String, token: String) -> URLRequest {
        // Create the URL request with the given path
        var request  = URLRequest(url: URL(string: "\(self.apiPath)\(path)")!)
        
        // Add the token to the request
        request.addValue(token, forHTTPHeaderField: "Authorization")
        
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
        let username = "leaf"
        let password = "password"
        
        // Create the dictionary for the request body
        let body = ["username": username, "password": password] as [String: Any]
        
        let request = self.createPostRequest(path: "/authenticate", token: "", body: body)
        
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

extension NSMutableData {
    func appendString(_ string: String) {
        let data = string.data(using: String.Encoding.utf8, allowLossyConversion: false)
        append(data!)
    }
}
