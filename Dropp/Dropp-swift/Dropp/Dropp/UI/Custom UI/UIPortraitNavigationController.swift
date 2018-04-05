//
//  UIPortraitNavigationController.swift
//  Dropp
//
//  Created by Steven McCracken on 4/2/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import UIKit

/**
 Specialized navigation controller that only rotates on iPad devices
 */
class UIPortraitNavigationController: UINavigationController {
  
  override var shouldAutorotate: Bool {
    return Utils.isPad
  }
  
  override var supportedInterfaceOrientations: UIInterfaceOrientationMask {
    return Utils.isPad ? .all : .portrait
  }
}
