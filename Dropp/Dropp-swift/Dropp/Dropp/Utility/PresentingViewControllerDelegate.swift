//
//  PresentingViewControllerDelegate.swift
//  Dropp
//
//  Created by Steven McCracken on 12/25/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import UIKit
import Foundation

protocol PresentingViewControllerDelegate: class {
  
  func didDismissPresentedView(from source: UIViewController)
}
