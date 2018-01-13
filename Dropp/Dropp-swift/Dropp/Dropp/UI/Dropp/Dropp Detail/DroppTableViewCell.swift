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
    
    let view = UIView()
    view.backgroundColor = .mutedSalmon
    selectedBackgroundView = view
  }
  
  func addContent(from dropp: Dropp) {
    usernameLabel.text = dropp.postedByCurrentUser ? "⭐️You" : dropp.username!
    distanceLabel.text = dropp.distanceAwayMessage(from: LocationManager.shared.currentLocation)
    timestampLabel.text = dropp.timeSincePostedMessage(from: Date())
    
    let message = dropp.message!
    contentLabel.text = message.isEmpty ? "Dropped a 📸" : message.truncate(toLimit: 200)
  }
}
