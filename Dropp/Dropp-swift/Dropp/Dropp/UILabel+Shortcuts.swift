//
//  UILabel+Shortcuts.swift
//  Dropp
//
//  Created by Steven McCracken on 1/14/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import UIKit

extension UILabel {
  
  convenience init(_ text: String, forTableView tableView: UITableView, fontSize: CGFloat) {
    self.init(frame: CGRect(x: 0, y: 0, width: tableView.bounds.size.width, height: tableView.bounds.size.height))
    self.text = text
    numberOfLines = 0
    textColor = .salmon
    textAlignment = .center
    lineBreakMode = .byWordWrapping
    font = UIFont(name: font.fontName, size: fontSize)
    sizeToFit()
  }
}
