//
//  StorageManager.swift
//  Dropp
//
//  Created by Steven McCracken on 1/18/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import Foundation

/// Abstraction for UserDefaults to reduce verbosity
class StorageManager {
  
  /**
   Retrieves a value from UserDefaults for a given key
   
   - Parameter key: the uniquely identifying key of the desired value in UserDefaults
   
   - Returns: the value for the given key, or nil if the key does not exist in UserDefaults
   */
  static func get(key: String) -> Any? {
    return UserDefaults.standard.value(forKey: key)
  }
  
  /**
   Sets a value in UserDefaults for a given key
   
   - Parameter key: the uniquely identifying key to add to UserDefaults
   - Parameter value: any value to associate with the given key in UserDefaults
   */
  static func set(key: String, value: Any) {
    UserDefaults.standard.set(value, forKey: key)
    synchronize()
  }
  
  /**
   Removes a value in UserDefaults for a given key
   
   - Parameter key: the uniquely identifying key to remove from UserDefaults
   */
  static func delete(key: String) {
    UserDefaults.standard.removeObject(forKey: key)
    synchronize()
  }
  
  static func synchronize() {
    UserDefaults.standard.synchronize()
  }
}
