//
//  SettingsDistanceTableViewCell.swift
//  Dropp
//
//  Created by Steven McCracken on 1/19/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import UIKit

class SettingsDistanceTableViewCell: UITableViewCell {
  
  static let reuseIdentifier = "SettingsDistanceTableViewCell"
  @IBOutlet weak var distanceLabel: UILabel!
  
  override func awakeFromNib() {
    super.awakeFromNib()
    tintColor = .salmon
  }
  
  func addContent(_ distance: Double) {
    if distance >= 5280 {
      let truncatedMiles = Int(distance.feetToMiles)
      distanceLabel.text = "\(truncatedMiles) mile\(truncatedMiles == 1 ? "" : "s")"
    } else {
      distanceLabel.text = "\(Int(distance)) feet"
    }
  }
}
