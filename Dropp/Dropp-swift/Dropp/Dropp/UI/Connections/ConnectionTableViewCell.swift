//
//  ConnectionTableViewCell.swift
//  Dropp
//
//  Created by Steven McCracken on 1/9/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import UIKit

class ConnectionTableViewCell: UITableViewCell {
  
  static let identifier = "ConnectionTableViewCell"
  @IBOutlet weak var usernameLabel: UILabel!
  
  override func awakeFromNib() {
    super.awakeFromNib()
    let view = UIView()
    view.backgroundColor = .mutedSalmon
    selectedBackgroundView = view
  }
  
  func addContent(_ user: User) {
    usernameLabel.text = LoginManager.shared.isCurrentUser(user) ? "⭐️You" :  user.username
  }
}
