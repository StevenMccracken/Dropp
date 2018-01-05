//
//  DroppTableViewCell.swift
//  Dropp
//
//  Created by Steven McCracken on 12/23/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import UIKit

class DroppTableViewCell: UITableViewCell {
  
  @IBOutlet weak var usernameLabel: UILabel!
  @IBOutlet weak var distanceLabel: UILabel!
  @IBOutlet weak var contentLabel: UILabel!
  @IBOutlet weak var timestampLabel: UILabel!
  
  override func awakeFromNib() {
    super.awakeFromNib()
  }
  
  func addContent(from dropp: Dropp) {
    usernameLabel.text = dropp.user!
    distanceLabel.text = dropp.distanceAwayMessage(from: LocationManager.shared.currentLocation)
    timestampLabel.text = dropp.timeSincePostedMessage(from: Date())
    
    var limit: Int
    let message = dropp.message!
    if message.isOnlyEmoji {
      limit = 15
      contentLabel.font = UIFont(name: contentLabel.font.fontName, size: 40.0)
    } else {
      limit = 200
      contentLabel.font = UIFont(name: contentLabel.font.fontName, size: 20.0)
    }
    
    contentLabel.text = message.isEmpty ? "Dropped a 📸" : message.truncate(toLimit: limit)
  }
}
