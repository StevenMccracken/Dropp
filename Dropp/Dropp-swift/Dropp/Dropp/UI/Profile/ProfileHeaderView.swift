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
}

class ProfileHeaderView: UIView {
  
  @IBOutlet var contentView: UIView!
  @IBOutlet weak var footerView: UIView!
  @IBOutlet weak var followingCount: UILabel!
  @IBOutlet weak var followersCount: UILabel!
  @IBOutlet weak var followingButton: UIButton!
  @IBOutlet weak var followersButton: UIButton!
  
  weak var delegate: ProfileHeaderViewDelegate?
  
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
  }
  
  // MARK: Methods
  
  func toggleFooterView(visible: Bool) {
    footerView.isHidden = !visible
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
}
