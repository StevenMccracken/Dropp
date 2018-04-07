//
//  LocationManager.swift
//  Dropp
//
//  Created by Steven McCracken on 12/16/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import Foundation
import CoreLocation

class LocationManager: NSObject {
  
  // Singleton instance
  static let shared = LocationManager()
  private var locationManager: CLLocationManager
  private(set) var locationUpdatedEvent: Event<CLLocation>
  private(set) var authorizationUpdatedEvent: Event<Bool>
  var canGetLocation: Bool {
    let status: CLAuthorizationStatus = CLLocationManager.authorizationStatus()
    return (status == .authorizedAlways || status == .authorizedWhenInUse) && CLLocationManager.locationServicesEnabled()
  }
  
  var currentLocation: CLLocation? {
    guard canGetLocation else {
      return nil
    }
    
    return locationManager.location
  }
  
  var currentCoordinates: CLLocationCoordinate2D? {
    guard canGetLocation else {
      return nil
    }
    
    return locationManager.location?.coordinate
  }
  
  private override init() {
    locationManager = CLLocationManager()
    locationUpdatedEvent = Event<CLLocation>()
    authorizationUpdatedEvent = Event<Bool>()
    super.init()
    
    locationManager.delegate = self
    locationManager.desiredAccuracy = kCLLocationAccuracyNearestTenMeters
    
    requestAuthorization()
  }
  
  @discardableResult
  func requestAuthorization() -> Event<Bool> {
    locationManager.requestAlwaysAuthorization()
    locationManager.requestWhenInUseAuthorization()
    return authorizationUpdatedEvent
  }
}

extension LocationManager: CLLocationManagerDelegate {
  
  func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
    if canGetLocation {
      manager.startUpdatingLocation()
    } else {
      manager.stopUpdatingLocation()
    }
    
    authorizationUpdatedEvent.raise(data: canGetLocation)
  }
  
  func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
    guard let newestLocation = locations.last else {
      return
    }
    
    debugPrint("User location was updated", newestLocation)
    locationUpdatedEvent.raise(data: newestLocation)
  }
}
