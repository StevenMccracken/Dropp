//
//  FetchedImageTableViewCell.swift
//  Dropp
//
//  Created by Steven McCracken on 4/4/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import UIKit

class FetchedImageTableViewCell: UITableViewCell {
  
  static let identifier = "FetchedImageTableViewCell"
  
  @IBOutlet weak var currentImage: UIImageView!
  @IBOutlet weak var errorLabel: UILabel!
  @IBOutlet weak var loadingBackgroundView: UIView!
  @IBOutlet weak var activityIndicatorView: UIActivityIndicatorView!
  
  override func awakeFromNib() {
    super.awakeFromNib()
    loadingBackgroundView.layer.cornerRadius = 10
  }
  
  func addContent(image: UIImage?) {
    currentImage.image = image
  }
  
  func toggleLoadingIndicator(visible: Bool) {
    if visible {
      activityIndicatorView.startAnimating()
      loadingBackgroundView.isHidden = false
    } else {
      loadingBackgroundView.isHidden = true
      activityIndicatorView.stopAnimating()
    }
  }
  
  func toggleErrorLabel(visible: Bool) {
    errorLabel.isHidden = !visible
  }
}
