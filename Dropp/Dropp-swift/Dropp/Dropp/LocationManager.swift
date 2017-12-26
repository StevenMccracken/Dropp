//
//  LocationManager.swift
//  Dropp
//
//  Created by Steven McCracken on 12/16/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import Foundation
import CoreLocation

class LocationManager: NSObject, CLLocationManagerDelegate {
  
  // Singleton instance
  static let shared = LocationManager()
  private var locationManager: CLLocationManager!
  
  var currentLocation: CLLocation? {
    return locationManager.location
  }
  
  var userCoordinates: CLLocationCoordinate2D? {
    return locationManager.location?.coordinate
  }
  
  private override init() {
    locationManager = CLLocationManager()
    super.init()
    
    locationManager.requestAlwaysAuthorization()
    locationManager.requestWhenInUseAuthorization()
    if CLLocationManager.locationServicesEnabled() {
      locationManager.delegate = self
      locationManager.desiredAccuracy = kCLLocationAccuracyNearestTenMeters
      locationManager.startUpdatingLocation()
    }
  }
}
