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
    
    // Assign delegate as AppDelegate to allow presentation of create dropp view controller
    delegate = UIApplication.shared.delegate as? UITabBarControllerDelegate
    configureNearbyTabBarItem()
    configureProfileViewController()
  }
  
  private func configureProfileViewController() {
    guard let currentUser = LoginManager.shared.currentUser else {
      return
    }
    
    guard let profileNavigationController = viewControllers?.first(where: { $0.childViewControllers.first is ProfileViewController }) else {
      return
    }
    
    guard let profileViewController = profileNavigationController.childViewControllers.first as? ProfileViewController else {
      return
    }
    
    profileViewController.user = currentUser
  }
  
  private func configureNearbyTabBarItem() {
    guard let nearbyViewController = viewControllers?.first(where: { $0 is MapViewController }) else {
      return
    }
    
    nearbyViewController.tabBarItem.image = UIImage(named: "location")
    nearbyViewController.tabBarItem.selectedImage = UIImage(named: "location_selected")
  }
}
