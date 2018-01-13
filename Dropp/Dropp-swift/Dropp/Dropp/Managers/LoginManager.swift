//
//  LoginManager.swift
//  Dropp
//
//  Created by Steven McCracken on 12/18/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import UIKit
import Foundation

class LoginManager {
  
  // Singleton instance
  static let shared = LoginManager()
  private(set) var isLoggedIn: Bool
  private(set) var loginEvent: Event<Bool>
  private(set) var logoutEvent: Event<Void>
  private(set) var currentUser: User?
  
  private init() {
    loginEvent = Event<Bool>()
    logoutEvent = Event<Void>()
    
    let jwt = UserDefaults.standard.object(forKey: "jwt") as? String ?? ""
    let username = UserDefaults.standard.object(forKey: "username") as? String ?? ""
    let password = UserDefaults.standard.object(forKey: "password") as? String ?? ""
    isLoggedIn = !jwt.isEmpty && !username.isEmpty && !password.isEmpty
    if isLoggedIn {
      currentUser = User(username)
    }
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
      self.currentUser = User(username)
      
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
    currentUser = nil
    logoutEvent.raise(data: ())
  }
  
  func ensureLogin(failure: ((NSError) -> Void)? = nil) -> Bool {
    guard !isLoggedIn else {
      return false
    }
    
    let loginStoryboard = UIStoryboard(name: "Login", bundle: nil)
    guard let loginNavigationController = loginStoryboard.instantiateInitialViewController() else {
      failure?(NSError(reason: "Initial view controller for Login storyboard was nil"))
      return false
    }
    
    guard let loginViewController = loginNavigationController.childViewControllers.first as? LoginViewController else {
      failure?(NSError(reason: "Initial view controller for navigation controller was NOT LoginViewController"))
      return false
    }
    
    loginViewController.delegate = self
    Utils.present(viewController: loginNavigationController)
    return true
  }
}

extension LoginManager: LogInViewDelegate {
  
  func didLogIn() {
    let mainStoryboard = UIStoryboard(name: "Main", bundle: nil)
    guard let mainViewController = mainStoryboard.instantiateInitialViewController() else {
      debugPrint("Initial view controller for Main storyboard was nil")
      return
    }
    
    Utils.present(viewController: mainViewController)
  }
}
