//
//  ProfileHeaderView.swift
//  Dropp
//
//  Created by Steven McCracken on 4/5/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import UIKit

protocol ProfileHeaderViewDelegate: class {
  func didTapFollowersButton(_ sender: UIButton)
  func didTapFollowingButton(_ sender: UIButton)
  func didTapInteractionButton(_ sender: UIButton)
}

class ProfileHeaderView: UIView {
  
  @IBOutlet var contentView: UIView!
  @IBOutlet weak var followingCount: UILabel!
  @IBOutlet weak var followersCount: UILabel!
  @IBOutlet weak var followingButton: UIButton!
  @IBOutlet weak var followersButton: UIButton!
  @IBOutlet weak var interactionButton: UIButton!
  @IBOutlet weak var interactionButtonHeight: NSLayoutConstraint!
  
  weak var delegate: ProfileHeaderViewDelegate?
  private var initialInteractionButtonHeight: CGFloat!
  
  // MARK: Initializers
  
  override init(frame: CGRect) {
    super.init(frame: frame)
    commonInit()
  }
  
  required init?(coder aDecoder: NSCoder) {
    super.init(coder: aDecoder)
    commonInit()
  }
  
  private func commonInit() {
    Bundle.main.loadNibNamed("ProfileHeaderView", owner: self)
    addSubview(contentView)
    contentView.frame = self.bounds
    contentView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    
    // Configure subviews
    interactionButton.layer.cornerRadius = 5
    interactionButton.layer.borderColor = UIColor.lightGray.cgColor
    initialInteractionButtonHeight = interactionButtonHeight.constant
  }
  
  // MARK: Methods
  
  func toggleInteractionButton(enabled: Bool, withTitle title: String? = nil) {
    interactionButton.toggle(enabled: enabled, withTitle: title)
  }
  
  func toggleInteractionButton(visible: Bool) {
    interactionButtonHeight.constant = visible ? initialInteractionButtonHeight : 0
  }
  
  func updateFollowers(_ followers: [User]?) {
    guard let followers = followers else {
      followersCount.text = "--"
      followersButton.isEnabled = false
      return
    }
    
    followersCount.text = String(followers.count)
    followersButton.isEnabled = followers.count > 0
  }
  
  func updateFollowing(_ following: [User]?) {
    guard let following = following else {
      followingCount.text = "--"
      followingButton.isEnabled = false
      return
    }
    
    followingCount.text = String(following.count)
    followingButton.isEnabled = following.count > 0
  }
  
  @IBAction func didTapFollowersButton(_ sender: UIButton) {
    delegate?.didTapFollowersButton(sender)
  }
  
  @IBAction func didTapFollowingButton(_ sender: UIButton) {
    delegate?.didTapFollowingButton(sender)
  }
  
  @IBAction func didTapInteractionButton(_ sender: UIButton) {
    delegate?.didTapInteractionButton(sender)
  }
}
