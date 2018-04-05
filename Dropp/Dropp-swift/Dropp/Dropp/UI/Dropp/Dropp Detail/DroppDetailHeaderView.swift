//
//  DroppDetailHeaderView.swift
//  Dropp
//
//  Created by Steven McCracken on 4/5/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import UIKit
import CoreLocation

class DroppDetailHeaderView: UIView {
  
  @IBOutlet var contentView: UIView!
  @IBOutlet private weak var distanceLabel: UILabel!
  @IBOutlet private weak var timestampLabel: UICopyableLabel!
  
  override func awakeFromNib() {
    super.awakeFromNib()
    commonInit()
  }
  
  override init(frame: CGRect) {
    super.init(frame: frame)
    commonInit()
  }
  
  required init?(coder aDecoder: NSCoder) {
    super.init(coder: aDecoder)
    commonInit()
  }
  
  private func commonInit() {
    Bundle.main.loadNibNamed("DroppDetailHeaderView", owner: self)
    addSubview(contentView)
    contentView.frame = self.bounds
    contentView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
  }
  
  private lazy var formatter: DateFormatter = {
    let formatter = DateFormatter()
    formatter.dateStyle = .medium
    formatter.timeStyle = .medium
    return formatter
  }()
  
  func updateDistance(forDropp dropp: Dropp, fromLocation location: CLLocation?) {
    distanceLabel.text = dropp.distanceAwayMessage(from: location)
  }
  
  func setTimestamp(date: Date) {
    timestampLabel.text = formatter.string(from: date)
  }
}
