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
  
  override func setSelected(_ selected: Bool, animated: Bool) {
    super.setSelected(selected, animated: animated)
    
    // Configure the view for the selected state
  }
  
  func addContent(from dropp: Dropp) {
    let message = dropp.message!
    contentLabel.text = message.isEmpty ? "Dropped a 📸" : message
    usernameLabel.text = dropp.user!
    distanceLabel.text = dropp.distanceAwayMessage(from: LocationManager.shared.currentLocation)
    timestampLabel.text = dropp.timeSincePostedMessage(from: Date())
    
    if message.isOnlyEmoji {
      contentLabel.font = UIFont(name: contentLabel.font.fontName, size: 40.0)
    } else {
      contentLabel.font = UIFont(name: contentLabel.font.fontName, size: 20.0)
    }
  }
}
