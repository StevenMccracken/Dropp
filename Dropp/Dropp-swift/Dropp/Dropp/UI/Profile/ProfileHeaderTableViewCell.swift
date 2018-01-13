//
//  ProfileHeaderTableViewCell.swift
//  Dropp
//
//  Created by Steven McCracken on 1/8/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import UIKit

class ProfileHeaderTableViewCell: UITableViewCell {
  
  @IBOutlet weak var followersButton: UIButton!
  @IBOutlet weak var followingButton: UIButton!
  @IBOutlet weak var followersCount: UILabel!
  @IBOutlet weak var followingCount: UILabel!
  @IBOutlet weak var interactionButton: UIButton!
  weak var delegate: ProfileHeaderTableViewCellDelegate?
  
  override func awakeFromNib() {
    super.awakeFromNib()
    interactionButton.layer.cornerRadius = 5
    interactionButton.layer.borderColor = UIColor.lightGray.cgColor
  }
  
  func updateInteractionButton(_ text: String, state: UIControlState) {
    interactionButton.setTitle(text, for: state)
  }
  
  func toggleInteractionButton(enabled: Bool) {
    interactionButton.isEnabled = enabled
    if enabled {
      interactionButton.backgroundColor = .salmon
      interactionButton.setTitleColor(.white, for: .normal)
      interactionButton.layer.borderWidth = 0
    } else {
      interactionButton.backgroundColor = .white
      interactionButton.setTitleColor(.lightGray, for: .disabled)
      interactionButton.layer.borderWidth = 0.5
    }
  }
  
  func toggleInteractionButton(visible: Bool) {
    interactionButton.isHidden = !visible
  }
  
  func updateFollowers(_ count: Int) {
    followersCount.text = String(count)
  }
  
  func updateFollowing(_ count: Int) {
    followingCount.text = String(count)
  }
  
  @IBAction func didTapFollowersButton(_ sender: Any) {
    delegate?.didTapFollowersButton()
  }
  
  @IBAction func didTapFollowingButton(_ sender: Any) {
    delegate?.didTapFollowingButton()
  }
  
  @IBAction func didTapInteractionButton(_ sender: Any) {
    delegate?.didTapInteractionButton()
  }
}

protocol ProfileHeaderTableViewCellDelegate: class {
  func didTapFollowersButton()
  func didTapFollowingButton()
  func didTapInteractionButton()
}
