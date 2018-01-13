//
//  MainViewController.swift
//  Dropp
//
//  Created by Steven McCracken on 12/15/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import UIKit

class MainViewController: UITabBarController {
  
  override func viewDidLoad() {
    super.viewDidLoad()
    delegate = UIApplication.shared.delegate as? UITabBarControllerDelegate
    
    // Do any additional setup after loading the view.
    guard let username = UserDefaults.standard.object(forKey: "username") as? String, !username.isEmpty else {
      return
    }
    
    guard let profileNavigationController = viewControllers?.first(where: { $0.childViewControllers.first is ProfileViewController }) else {
      return
    }
    
    guard let profileViewController = profileNavigationController.childViewControllers.first as? ProfileViewController else {
      debugPrint("Profile view controller was nil")
      return
    }
    
    profileViewController.user = User(username)
  }
}
