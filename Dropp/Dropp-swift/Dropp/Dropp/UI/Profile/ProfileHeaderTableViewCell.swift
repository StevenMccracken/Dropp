//
//  ProfileHeaderTableViewCell.swift
//  Dropp
//
//  Created by Steven McCracken on 1/8/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import UIKit

class ProfileHeaderTableViewCell: UITableViewCell {
  
  static let reuseIdentifier = "ProfileHeaderTableViewCell"
  @IBOutlet weak var followersButton: UIButton!
  @IBOutlet weak var followingButton: UIButton!
  @IBOutlet weak var followersCount: UILabel!
  @IBOutlet weak var followingCount: UILabel!
  @IBOutlet weak var interactionButton: UIButton!
  @IBOutlet weak var interactionButtonHeightConstraint: NSLayoutConstraint!
  weak var delegate: ProfileHeaderTableViewCellDelegate?
  
  override func awakeFromNib() {
    super.awakeFromNib()
    interactionButton.layer.cornerRadius = 5
    interactionButton.layer.borderColor = UIColor.lightGray.cgColor
  }
  
  func toggleInteractionButton(enabled: Bool, withTitle title: String? = nil) {
    interactionButton.toggle(enabled: enabled, withTitle: title)
  }
  
  func toggleInteractionButton(visible: Bool) {
    interactionButton.isHidden = !visible
  }
  
  func setInteractionButtonHeight(_ height: CGFloat) {
    interactionButtonHeightConstraint.constant = height
  }
  
  func updateFollowers(_ count: Int) {
    followersCount.text = String(count)
  }
  
  func updateFollowing(_ count: Int) {
    followingCount.text = String(count)
  }
  
  func toggleFollowersButton(enabled: Bool) {
    followersButton.isEnabled = enabled
  }
  
  func toggleFollowingButton(enabled: Bool) {
    followingButton.isEnabled = enabled
  }
  
  @IBAction func didTapFollowersButton(_ sender: Any) {
    delegate?.didTapFollowersButton()
  }
  
  @IBAction func didTapFollowingButton(_ sender: Any) {
    delegate?.didTapFollowingButton()
  }
  
  @IBAction func didTapInteractionButton(_ sender: Any) {
    delegate?.didTapInteractionButton(self)
  }
}

protocol ProfileHeaderTableViewCellDelegate: class {
  func didTapFollowersButton()
  func didTapFollowingButton()
  func didTapInteractionButton(_ sender: ProfileHeaderTableViewCell)
}
