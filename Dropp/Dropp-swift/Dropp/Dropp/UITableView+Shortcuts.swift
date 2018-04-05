//
//  UITableView+Shortcuts.swift
//  Dropp
//
//  Created by Steven McCracken on 4/4/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import UIKit

extension UITableView {
  
  func register(nibAndReuseIdentifier identifier: String) {
    register(UINib(nibName: identifier, bundle: nil), forCellReuseIdentifier: identifier)
  }
}
