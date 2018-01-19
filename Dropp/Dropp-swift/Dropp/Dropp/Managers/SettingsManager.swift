//
//  SettingsManager.swift
//  Dropp
//
//  Created by Steven McCracken on 1/19/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import Foundation

class SettingsManager {
  
  // Singleton instance
  static let shared = SettingsManager()
  private(set) var maxFetchDistanceChangedEvent: Event<Double>
  
  private(set) var minMaxFetchDistance = 300.0
  var maxFetchDistance: Double {
    get {
      let storedMaxFetchDistance = StorageManager.get(key: Constants.storageKey_maxFetchDistance) as? Double ?? minMaxFetchDistance
      return storedMaxFetchDistance
    }
    
    set(newMaxFetchDistance) {
      let newValue = max(newMaxFetchDistance, minMaxFetchDistance)
      StorageManager.set(key: Constants.storageKey_maxFetchDistance, value: newValue)
      maxFetchDistanceChangedEvent.raise(data: newValue)
    }
  }
  
  var maxFetchDistanceOptions: [Double] {
    return [minMaxFetchDistance, 1000.0, 2000.0, 3000.0, 4000.0, 5280.0]
  }
  
  private init() {
    maxFetchDistanceChangedEvent = Event<Double>()
  }
}
