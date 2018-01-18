//
//  UICopyableLabel.swift
//  Dropp
//
//  Created by Steven McCracken on 1/17/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import UIKit

class UICopyableLabel: UILabel {
  
  override var canBecomeFirstResponder: Bool {
    return true
  }
  
  override func awakeFromNib() {
    super.awakeFromNib()
    sharedInit()
  }
  
  override init(frame: CGRect) {
    super.init(frame: frame)
    sharedInit()
  }
  
  required init?(coder aDecoder: NSCoder) {
    super.init(coder: aDecoder)
    sharedInit()
  }
  
  private func sharedInit() {
    isUserInteractionEnabled = true
    let longPressGestureRecognizer = UILongPressGestureRecognizer(target: self, action: #selector(showOptions))
    addGestureRecognizer(longPressGestureRecognizer)
  }
  
  override func copy(_ sender: Any?) {
    let board = UIPasteboard.general
    board.string = text
    let menu = UIMenuController.shared
    menu.setMenuVisible(false, animated: true)
  }
  
  @objc
  private func showOptions() {
    becomeFirstResponder()
    let menu = UIMenuController.shared
    if !menu.isMenuVisible {
      menu.setTargetRect(bounds, in: self)
      menu.setMenuVisible(true, animated: true)
    }
  }
  
  override func canPerformAction(_ action: Selector, withSender sender: Any?) -> Bool {
    var canPerformAction = false
    if action == #selector(UIResponderStandardEditActions.copy(_:)) {
      canPerformAction = true
    }
    
    return canPerformAction
  }
}
