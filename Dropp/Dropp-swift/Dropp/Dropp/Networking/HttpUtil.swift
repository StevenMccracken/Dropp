//
//  HttpUtil.swift
//  Dropp
//
//  Created by Steven McCracken on 12/16/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import Foundation
import SwiftyJSON

class HttpUtil {
  
  class func getRequest(_ path: String, parameters: [String: Any] = [:]) -> URLRequest? {
    guard var request = jsonRequest(toUrl: path) else {
      return nil
    }
    
    request.httpMethod = "GET"
    for (key, value) in parameters {
      request.addValue("\(value)", forHTTPHeaderField: key)
    }
    
    return request
  }
  
  class func postRequest(_ path: String, parameters: [String: Any] = [:]) -> URLRequest? {
    guard var request = jsonRequest(toUrl: path) else {
      return nil
    }
    
    request.httpMethod = "POST"
    do {
      request.httpBody = try data(from: parameters)
    } catch {
      debugPrint("Unable to add data from parameters to request body", error)
      return nil
    }
    
    return request
  }
  
  class func putRequest(_ path: String, parameters: [String: Any] = [:]) -> URLRequest? {
    guard var request = jsonRequest(toUrl: path) else {
      return nil
    }
    
    request.httpMethod = "PUT"
    do {
      request.httpBody = try data(from: parameters)
    } catch {
      debugPrint("Unable to add data from parameters to request body", error)
      return nil
    }
    
    return request
  }
  
  class func deleteRequest(_ path: String, parameters: [String: Any]? = nil) -> URLRequest? {
    guard var request = jsonRequest(toUrl: path) else {
      return nil
    }
    
    request.httpMethod = "DELETE"
    guard let parameters = parameters else {
      return request
    }
    
    do {
      request.httpBody = try data(from: parameters)
    } catch {
      debugPrint("Unable to add data from parameters to request body", error)
      return nil
    }
    
    return request
  }
  
  class func dataRequest(image: UIImage, toUrl url: String, withParameters parameters: [String: String] = [:], compressionRate: Double = 1.0) -> URLRequest? {
    guard var request = request(toUrl: url) else {
      return nil
    }
    
    guard let imageData = UIImageJPEGRepresentation(image, CGFloat(compressionRate)) else {
      return nil
    }
    
    let boundary = "Boundary-\(UUID().uuidString)"
    request.httpMethod = "POST"
    request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
    do {
      request.httpBody = try data(fromImageData: imageData, boundary: boundary, mimeType: "image/jpeg", filename: "image.jpg", parameters: parameters)
    } catch {
      debugPrint("Unable to add data from parameters to request body", error)
      return nil
    }
    
    return request
  }
  
  class func data(from parameters: [String: Any]) throws -> Data {
    let data = NSMutableData()
    var firstParameter = true
    for (key, value) in parameters {
      if firstParameter {
        firstParameter = false
      } else {
        try data.appendString("&")
      }
      
      try data.appendString("\(key)=\(value)")
    }
    
    return data as Data
  }
  
  class func data(fromImageData imageData: Data, boundary: String, mimeType: String, filename: String, parameters: [String: String]) throws -> Data {
    let data = NSMutableData()
    let boundaryPrefix = "--\(boundary)\r\n"
    for (key, value) in parameters {
      try data.appendString(boundaryPrefix)
      try data.appendString("Content-Disposition: form-data; name=\"\(key)\"\r\n\r\n")
      try data.appendString("\(value)\r\n")
    }
    
    try data.appendString(boundaryPrefix)
    try data.appendString("Content-Disposition: form-data; name=\"image\"; filename=\"\(filename)\"\r\n")
    try data.appendString("Content-Type: \(mimeType)\r\n\r\n")
    data.append(imageData)
    try data.appendString("\r\n")
    try data.appendString("--".appending(boundary.appending("--")))
    
    return data as Data
  }
  
  private class func jsonRequest(toUrl url: String) -> URLRequest? {
    guard var request = request(toUrl: url) else {
      return nil
    }
    
    request.addValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
    return request
  }
  
  private class func request(toUrl url: String) -> URLRequest? {
    guard let urlObject = URL(string: url) else {
      return nil
    }
    
    var request = URLRequest(url: urlObject, cachePolicy: .reloadIgnoringLocalAndRemoteCacheData, timeoutInterval: TimeInterval(60.0))
    let jwt = LoginManager.shared.jwt
    guard Utils.isJwtValid(jwt) else {
      return request
    }
    
    request.addValue(jwt, forHTTPHeaderField: "Authorization")
    return request
  }
  
  class func send(request: URLRequest, success: ((HTTPURLResponse, Data) -> Void)? = nil, failure: ((NSError) -> Void)? = nil) {
    let task = URLSession.shared.dataTask(with: request, completionHandler: { (data: Data?, response: URLResponse?, error: Error?) in
      guard error == nil else {
        let error = NSError(userInfo: ["error": error!])
        failure?(error)
        return
      }
      
      guard let response = response as? HTTPURLResponse else {
        failure?(NSError(reason: "Response was nil"))
        return
      }
      
      guard let data = data else {
        failure?(NSError(reason: "Data was nil", details: response))
        return
      }
      
      guard case 200...299 = response.statusCode else {
        let details: [String: Any] = ["reason": "Status code was invalid", "details": response, "data": data]
        failure?(NSError(domain: "", code: response.statusCode, userInfo: details))
        return
      }
      
      success?(response, data)
    })
    
    task.resume()
  }
  
  class func send(request: URLRequest, checkSuccessField: Bool = true, success: ((JSON) -> Void)? = nil, failure: ((NSError) -> Void)? = nil) {
    send(request: request, success: { (response: HTTPURLResponse, data: Data) in
      let json = JSON(data: data)
      guard checkSuccessField else {
        success?(json)
        return
      }
      
      guard let successJson = json["success"].dictionary else {
        failure?(NSError(reason: "'success' field was invalid", details: response))
        return
      }
      
      success?(JSON(successJson))
    }, failure: { (error: NSError) in
      var details = error.userInfo
      guard let data = details["data"] as? Data else {
        failure?(error)
        return
      }
      
      let json = JSON(data: data)
      details["responseBody"] = json
      failure?(NSError(domain: error.domain, code: error.code, userInfo: details))
    })
  }
}
