//
//  LogInManager.swift
//  Dropp
//
//  Created by Steven McCracken on 12/18/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import UIKit
import Foundation

class LogInManager {
  
  // Singleton instance
  static let shared = LogInManager()
  private(set) var isLoggedIn: Bool
  private(set) var loginEvent: Event<Bool>
  private(set) var logoutEvent: Event<Void>
  
  private init() {
    loginEvent = Event<Bool>()
    logoutEvent = Event<Void>()
    
    let jwt = UserDefaults.standard.object(forKey: "jwt") as? String ?? ""
    let username = UserDefaults.standard.object(forKey: "username") as? String ?? ""
    let password = UserDefaults.standard.object(forKey: "password") as? String ?? ""
    isLoggedIn = !jwt.isEmpty && !username.isEmpty && !password.isEmpty
  }
  
  func login(username: String, password: String, success: (() -> Void)? = nil, failure: ((NSError) -> Void)? = nil) {
    debugPrint("Login attempted at", Date())
    guard !isLoggedIn else {
      success?()
      return
    }
    
    UserService.authenticate(username: username, password: password, success: { (jwt: String) in
      debugPrint("Login succeeded at", Date())
      UserDefaults.standard.set(jwt, forKey: "jwt")
      UserDefaults.standard.setValue(username, forKey: "username")
      UserDefaults.standard.setValue(password, forKey: "password")
      UserDefaults.standard.synchronize()
      
      self.isLoggedIn = true
      success?()
      self.loginEvent.raise(data: true)
    }, failure: { (authenticationError: NSError) in
      debugPrint("Login failed at", Date())
      failure?(authenticationError)
      self.loginEvent.raise(data: false)
    })
  }

  func logout() {
    debugPrint("Logout occurred at", Date())
    self.isLoggedIn = false
    UserDefaults.standard.removeObject(forKey: "jwt")
    UserDefaults.standard.removeObject(forKey: "username")
    UserDefaults.standard.removeObject(forKey: "password")
    UserDefaults.standard.synchronize()
    logoutEvent.raise(data: ())
  }
  
  func ensureLogin(failure: ((NSError) -> Void)? = nil) -> Bool {
    guard !isLoggedIn else {
      return false
    }
    
    let loginStoryboard = UIStoryboard(name: "Login", bundle: nil)
    guard let loginNavigationController = loginStoryboard.instantiateInitialViewController() else {
      failure?(NSError(domain: "", code: 0, userInfo: ["reason": "Initial view controller for Login storyboard was nil"]))
      return false
    }
    
    guard let loginViewController = loginNavigationController.childViewControllers.first as? LogInViewController else {
      failure?(NSError(domain: "", code: 0, userInfo: ["reason": "Initial view controller for navigation controller was NOT LogInViewController"]))
      return false
    }
    
    loginViewController.delegate = self
    Utils.present(viewController: loginNavigationController)
    return true
  }
}

extension LogInManager: LogInViewDelegate {
  
  func didLogIn() {
    let homeStoryboard = UIStoryboard(name: "Home", bundle: nil)
    guard let homeViewController = homeStoryboard.instantiateInitialViewController() else {
      debugPrint("Initial view controller for Home storyboard was nil")
      return
    }
    
    Utils.present(viewController: homeViewController)
  }
}
