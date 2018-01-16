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
  
  class func getAllDropps(currentLocation: CLLocation?, withRange radius: Double = 100.0, success: (([Dropp]) -> Void)? = nil, failure: ((NSError) -> Void)? = nil) {
    guard let location = currentLocation else {
      failure?(NSError(domain: "", code: Constants.locationNotEnabled, userInfo: ["reason": "Location was nil"]))
      return
    }
    
    guard radius > 0 else {
      failure?(NSError(reason: "Range was not positive"))
      return
    }
    
    let parameters = ["location": location.coordinate.toString, "max-distance": radius] as [String : Any]
    guard let request = HttpUtil.getRequest("\(Constants.apiUrl)/dropps", parameters: parameters) else {
      failure?(NSError(reason: "Request to get dropps was not created"))
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
      
      success?(dropps)
    }, failure: failure)
  }
  
  class func getDropps(near location: CLLocation?, withRange radius: Double = 100.0, sorted: Bool = true, success: (([Dropp]) -> Void)? = nil, failure: ((NSError) -> Void)? = nil) {
    guard let location = location else {
      failure?(NSError(domain: "", code: Constants.locationNotEnabled, userInfo: ["reason": "Location was nil"]))
      return
    }
    
    guard radius > 0 else {
      failure?(NSError(reason: "Range was not positive"))
      return
    }
    
    let parameters = ["location": location.coordinate.toString, "max-distance": radius] as [String : Any]
    guard let request = HttpUtil.getRequest("\(Constants.apiUrl)/location/dropps", parameters: parameters) else {
      failure?(NSError(reason: "Request to get dropps was not created"))
      return
    }
    
    HttpUtil.send(request: request, checkSuccessField: false, success: { (json: JSON) in
      guard let droppsJson = json["dropps"].dictionary else {
        failure?(NSError(reason: "dropps field was invalid", details: json))
        return
      }
      
      var dropps: [Dropp] = []
      for (key, droppJson) in droppsJson {
        do {
          let dropp = try Dropp(id: key, json: droppJson)
          dropps.append(dropp)
        } catch {
          debugPrint("Unable to create Dropp from json", key, droppJson)
        }
      }
      
      if sorted {
        dropps = dropps.sorted(by: { (a: Dropp, b: Dropp) in
          return a.distance(from: location) < b.distance(from: location)
        })
      }
      
      success?(dropps)
    }, failure: failure)
  }
  
  class func getDropps(forUser user: User, sorted: Bool = true, success: (([Dropp]) -> Void)? = nil, failure: ((NSError) -> Void)? = nil) {
    guard let request = HttpUtil.getRequest("\(Constants.apiUrl)/users/\(user.username)/dropps") else {
      failure?(NSError(reason: "Request to get dropps was not created"))
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
      
      if sorted {
        dropps = dropps.sorted() { (a: Dropp, b: Dropp) in
          return a > b
        }
      }
      
      success?(dropps)
    }, failure: failure)
  }
  
  class func getImage(forDropp dropp: Dropp, success: ((UIImage) -> Void)? = nil, failure: ((NSError) -> Void)? = nil) {
    guard dropp.hasMedia else {
      failure?(NSError(reason: "Dropp does not have media associated with it", details: dropp))
      return
    }
    
    guard let request = HttpUtil.getRequest("\(Constants.apiUrl)/dropps/\(dropp.id!)/image") else {
      failure?(NSError(reason: "Request to get dropp image was not created"))
      return
    }
    
    HttpUtil.send(request: request, success: { (response: HTTPURLResponse, data: Data) in
      guard let image = UIImage(data: data) else {
        failure?(NSError(reason: "Could not create image for Dropp from response data", details: ["response": response, "data": data]))
        return
      }
      
      success?(image)
    }, failure: failure)
  }
  
  class func createDropp(at location: CLLocation?, on date: Date, withMessage message: String?, hasMedia: Bool, success: ((Dropp) -> Void)? = nil, failure: ((NSError) -> Void)? = nil) {
    guard let location = location else {
      failure?(NSError(domain: "", code: Constants.locationNotEnabled, userInfo: ["reason": "Location was nil"]))
      return
    }
    
    guard hasMedia || (message != nil && !message!.isEmpty) else {
      failure?(NSError(reason: "Dropp would contain no content (no message or media)"))
      return
    }
    
    
    let text = message ?? ""
    let currentUser = LoginManager.shared.currentUser!
    let locationCoordinates = location.coordinate.toString
    let timestamp = Int(date.timeIntervalSince1970.rounded()) - 15
    let parameters = [
      "location": locationCoordinates,
      "timestamp": timestamp,
      "text": text,
      "media": "\(hasMedia)",
    ] as [String: Any]
    guard let request = HttpUtil.postRequest("\(Constants.apiUrl)/dropps", parameters: parameters) else {
      failure?(NSError(reason: "Request to create dropp was not created"))
      return
    }
    
    HttpUtil.send(request: request, checkSuccessField: false, success: { (droppJson: JSON) in
      guard let droppId = droppJson["droppId"].string else {
        failure?(NSError(reason: "'droppId' field was not present in response body"))
        return
      }
      
      guard !droppId.isEmpty else {
        failure?(NSError(reason: "'droppId' for created dropp was empty"))
        return
      }
      
      do {
        let dropp = try Dropp(id: droppId, username: currentUser.username, location: location.coordinate.toString, timestamp: timestamp, message: text, hasMedia: hasMedia)
        success?(dropp)
      } catch {
        failure?(NSError(reason: "Service call to create dropp succeeded, but Dropp init threw an error"))
      }
    }, failure: failure)
  }
  
  class func upload(image: UIImage, forDropp dropp: Dropp, withCompression compression: Double = 0.6, success: (() -> Void)? = nil, failure: ((NSError) -> Void)? = nil) {
    guard let request = HttpUtil.dataRequest(image: image, toUrl: "\(Constants.apiUrl)/dropps/\(dropp.id!)/image", compressionRate: compression) else {
      failure?(NSError(reason: "Request to upload image for dropp was not created"))
      return
    }
    
    HttpUtil.send(request: request, success: { (json: JSON) in
      success?()
    }, failure: failure)
  }
  
  class func update(_ dropp: Dropp, withText text: String, success: (() -> Void)? = nil, failure: ((NSError) -> Void)? = nil) {
    let paramters = ["new-text": text]
    guard let request = HttpUtil.putRequest("\(Constants.apiUrl)/dropps/\(dropp.id!)/text", parameters: paramters) else {
      failure?(NSError(reason: "Request to update dropp text was not created"))
      return
    }
    
    HttpUtil.send(request: request, success: { (json: JSON) in
      success?()
    }, failure: failure)
  }
  
  class func delete(_ dropp: Dropp, success: (() -> Void)? = nil, failure: ((NSError) -> Void)? = nil) {
    guard let request = HttpUtil.deleteRequest("\(Constants.apiUrl)/dropps/\(dropp.id!)") else {
      failure?(NSError(reason: "Request to delete dropp was not created"))
      return
    }
    
    HttpUtil.send(request: request, success: { (json: JSON) in
      success?()
    }, failure: failure)
  }
}
