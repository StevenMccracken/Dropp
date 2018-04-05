//
//  DroppMessageTableViewCell.swift
//  Dropp
//
//  Created by Steven McCracken on 4/4/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import UIKit

class DroppMessageTableViewCell: UITableViewCell {
  
  static let identifier = "DroppMessageTableViewCell"
  
  @IBOutlet private weak var contentLabel: UICopyableLabel!
  
  override func awakeFromNib() {
    super.awakeFromNib()
    // Initialization code
  }
  
  func addContent(dropp: Dropp) {
    contentLabel.text = dropp.message
    if dropp.message.isOnlyEmoji {
      contentLabel.font = UIFont(name: contentLabel.font.fontName, size: 40.0)
    } else {
      contentLabel.font = UIFont(name: contentLabel.font.fontName, size: 20.0)
    }
  }
}
