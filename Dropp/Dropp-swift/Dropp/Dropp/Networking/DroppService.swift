//
//  DroppService.swift
//  Dropp
//
//  Created by Steven McCracken on 12/16/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import Foundation
import SwiftyJSON
import CoreLocation

class DroppService {
  
  class func getDropps(near location: CLLocationCoordinate2D?, withRange radius: Double = 100.0, sorted: Bool = true, success: (([Dropp]) -> Void)? = nil, failure: ((Error) -> Void)? = nil) {
    guard let location = location else {
      failure?(NSError(domain: "", code: 0, userInfo: ["reason": "Location was nil"]))
      return
    }
    
    guard radius > 0 else {
      failure?(NSError(domain: "", code: 0, userInfo: ["reason": "Range was not positive"]))
      return
    }
    
    let parameters = ["location": location.toString, "max-distance": radius] as [String : Any]
    guard let request = HttpUtil.getRequest("\(Constants.apiUrl)/dropps", parameters: parameters) else {
      failure?(NSError(domain: "", code: 0, userInfo: ["reason": "Request to get dropps was not created"]))
      return
    }
    
    HttpUtil.send(request: request, checkSuccessField: false, success: { (droppsJson: JSON) in
      var dropps: [Dropp] = []
      for (key, droppJson) in droppsJson {
        do {
          let dropp = try Dropp(id: key, json: droppJson)
          dropps.append(dropp)
        } catch {
          debugPrint("Unable to create Dropp from json", key, droppJson)
        }
      }
      
      dropps = dropps.sorted(by: { (a: Dropp, b: Dropp) -> Bool in
        return a > b
      })
      
      success?(dropps)
    }, failure: failure)
  }
  
  class func getImage(forDropp dropp: Dropp, success: ((UIImage) -> Void)? = nil, failure: ((Error) -> Void)? = nil) {
    guard dropp.hasMedia else {
      failure?(NSError(domain: "", code: 0, userInfo: ["reason": "Dropp does not have media associated with it", "details": dropp]))
      return
    }
    
    guard let request = HttpUtil.getRequest("\(Constants.apiUrl)/dropps/\(dropp.id!)/image") else {
      failure?(NSError(domain: "", code: 0, userInfo: ["reason": "Request to get dropp image was not created"]))
      return
    }
    
    HttpUtil.send(request: request, success: { (response: HTTPURLResponse, data: Data) in
      guard let image = UIImage(data: data) else {
        failure?(NSError(domain: "", code: 0, userInfo: ["reason": "Could not create image for Dropp from response data", "details": response]))
        return
      }
      
      success?(image)
    }, failure: failure)
  }
  
  class func createDropp(at location: CLLocationCoordinate2D?, on date: Date, withMessage message: String?, hasMedia: Bool, success: ((String) -> Void)? = nil, failure: ((Error) -> Void)? = nil) {
    guard let location = location else {
      failure?(NSError(domain: "", code: 0, userInfo: ["reason": "Location was nil"]))
      return
    }
    
    guard hasMedia || (message != nil && !message!.isEmpty) else {
      failure?(NSError(domain: "", code: 0, userInfo: ["reason": "Dropp would contain no content (no message or media)"]))
      return
    }
    
    
    let parameters = [
      "location": location.toString,
      "timestamp": Int(date.timeIntervalSince1970.rounded()) - 15,
      "text": message ?? "",
      "media": "\(hasMedia)",
    ] as [String : Any]
    guard let request = HttpUtil.postRequest("\(Constants.apiUrl)/dropps", parameters: parameters) else {
      failure?(NSError(domain: "", code: 0, userInfo: ["reason": "Request to create dropp was not created"]))
      return
    }
    
    HttpUtil.send(request: request, checkSuccessField: false, success: { (droppJson: JSON) in
      guard let droppId = droppJson["droppId"].string else {
        failure?(NSError(domain: "", code: 0, userInfo: ["reason": "'droppId' field was not present in response body"]))
        return
      }
      
      guard !droppId.isEmpty else {
        failure?(NSError(domain: "", code: 0, userInfo: ["reason": "'droppId' for created dropp was empty"]))
        return
      }
      
      success?(droppId)
    }, failure: failure)
  }
  
  class func upload(image: UIImage, forDropp droppId: String, withCompression compression: Double = 0.6, success: (() -> Void)? = nil, failure: ((Error) -> Void)? = nil) {
    guard let request = HttpUtil.dataRequest(image: image, toUrl: "\(Constants.apiUrl)/dropps/\(droppId)/image", compressionRate: compression) else {
      failure?(NSError(domain: "", code: 0, userInfo: ["reason": "Request to upload image for dropp was not created"]))
      return
    }
    
    HttpUtil.send(request: request, success: { (json: JSON) in
      success?()
    }, failure: failure)
  }
}
