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
  private(set) var currentUserUpdatedEvent: Event<User>
  private(set) var currentUser: User?
  
  private init() {
    loginEvent = Event<Bool>()
    logoutEvent = Event<Void>()
    currentUserUpdatedEvent = Event<User>()
    
    isLoggedIn = false
    let jwt = UserDefaults.standard.object(forKey: "jwt") as? String ?? ""
    let username = UserDefaults.standard.object(forKey: "username") as? String ?? ""
    let password = UserDefaults.standard.object(forKey: "password") as? String ?? ""
    isLoggedIn = !jwt.isEmpty && !username.isEmpty && !password.isEmpty
    if isLoggedIn {
      let user = User(username)
      currentUser = user
      currentUserUpdatedEvent.raise(data: user)
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
      
      let user = User(username)
      self.currentUser = user
      self.currentUserUpdatedEvent.raise(data: user)
      
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
  
  func updateCurrentUser(with user: User) {
    currentUser = user
    currentUserUpdatedEvent.raise(data: user)
  }
  
  @discardableResult
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
  
  @discardableResult
  func presentAccountCreation(failure: ((NSError) -> Void)? = nil) -> Bool {
    let createAccountStoryboard = UIStoryboard(name: "CreateAccount", bundle: nil)
    guard let createAccountNavigationController = createAccountStoryboard.instantiateInitialViewController() else {
      failure?(NSError(reason: "Initial view controller for CreateAccount storyboard was nil"))
      return false
    }
    
    guard let createAccountViewController = createAccountNavigationController.childViewControllers.first as? CreateAccountViewController else {
      failure?(NSError(reason: "Initial view controller for navigation controller was NOT CreateAccountViewController"))
      return false
    }
    
    createAccountViewController.delegate = self
    Utils.present(viewController: createAccountNavigationController)
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

extension LoginManager: CreateAccountViewDelegate {
  
  func didCreateAccount(username: String, password: String, token: String) {
    UserDefaults.standard.set(token, forKey: "jwt")
    UserDefaults.standard.setValue(username, forKey: "username")
    UserDefaults.standard.setValue(password, forKey: "password")
    UserDefaults.standard.synchronize()
    
    isLoggedIn = true
    currentUser = User(username)
    loginEvent.raise(data: true)
    
    let mainStoryboard = UIStoryboard(name: "Main", bundle: nil)
    guard let mainViewController = mainStoryboard.instantiateInitialViewController() else {
      debugPrint("Initial view controller for Main storyboard was nil")
      return
    }
    
    Utils.present(viewController: mainViewController)
  }
}
