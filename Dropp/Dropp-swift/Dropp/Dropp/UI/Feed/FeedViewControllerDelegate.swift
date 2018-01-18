//
//  FeedViewControllerDelegate.swift
//  Dropp
//
//  Created by Steven McCracken on 1/8/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import Foundation

@objc
protocol FeedViewControllerDelegate: class {
  func shouldRefreshData()
  func shouldRefresh(dropp: Dropp, with newDropp: Dropp)
  @objc optional func shouldAddDropp(_ dropp: Dropp)
  @objc optional func shouldRemoveDropp(_ dropp: Dropp)
}
