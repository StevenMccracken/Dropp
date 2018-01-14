//
//  ProfileDetailsUsernameTableViewCell.swift
//  Dropp
//
//  Created by Steven McCracken on 1/14/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import UIKit

class ProfileDetailsUsernameTableViewCell: UITableViewCell {
  
  @IBOutlet weak var usernameLabel: UILabel!
  
  override func awakeFromNib() {
    super.awakeFromNib()
  }
  
  func addContent(_ username: String) {
    usernameLabel.text = username
  }
}
