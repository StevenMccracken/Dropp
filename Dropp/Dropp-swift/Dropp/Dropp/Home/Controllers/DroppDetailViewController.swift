//
//  DroppDetailViewController.swift
//  Dropp
//
//  Created by Steven McCracken on 12/31/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import UIKit
import MapKit
import Gifu

class DroppDetailViewController: UIViewController {
  
  @IBOutlet weak var containerView: UIView!
  @IBOutlet weak var loadingView: GIFImageView!
  @IBOutlet weak var imageView: UIImageView!
  @IBOutlet weak var mapView: MKMapView!
  @IBOutlet weak var timestampLabel: UILabel!
  @IBOutlet weak var contentLabel: UILabel!
  var dropp: Dropp!
  var containerViewHeightConstraint: NSLayoutConstraint?
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    mapView.delegate = self
    self.title = "\(dropp.user!)'s dropp"
    if dropp.hasMedia {
      loadingView.prepareForAnimation(withGIFNamed: Constants.activityIndicatorFileName)
      addMedia()
    }
    
    let formatter = DateFormatter()
    formatter.dateStyle = .medium
    formatter.timeStyle = .medium
    timestampLabel.text = formatter.string(from: dropp.date)
    contentLabel.text = dropp.message!
    if dropp.message!.isOnlyEmoji {
      contentLabel.font = UIFont(name: contentLabel.font.fontName, size: 40.0)
    }
    
    updateHeightConstraint()
    NotificationCenter.default.addObserver(self, selector: #selector(updateHeightConstraint), name: NSNotification.Name.UIDeviceOrientationDidChange, object: nil)
  }
  
  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    
    let span = MKCoordinateSpan(latitudeDelta: 0.008, longitudeDelta: 0.008)
    let region = MKCoordinateRegion(center: dropp.location.coordinate, span: span)
    mapView.setRegion(region, animated: true)
  }
  
  override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
    NotificationCenter.default.removeObserver(self)
  }
  
  func addMedia() {
    toggleLoadingView(visible: true)
    DroppService.getImage(forDropp: self.dropp, success: { [weak self] (image: UIImage) in
      guard let strongSelf = self else {
        return
      }
      
      DispatchQueue.main.async {
        strongSelf.toggleLoadingView(visible: false)
        strongSelf.imageView.image = image
        strongSelf.updateHeightConstraint()
      }
    }, failure: { [weak self] (getImageError: NSError) in
        guard let strongSelf = self else {
          return
        }
      
        debugPrint("Failed getting image from dropp", strongSelf.dropp, getImageError)
    })
  }
  
  @objc
  func updateHeightConstraint() {
    if let existingHeightConstraint = containerViewHeightConstraint {
      self.view.removeConstraint(existingHeightConstraint)
    }
    
    let height = mapView.frame.height + timestampLabel.frame.height + contentLabel.frame.height + 5 * 3 + (dropp.hasMedia ? imageView.frame.height + 5 : 0)
    containerViewHeightConstraint = NSLayoutConstraint(item: containerView, attribute: .height, relatedBy: .equal, toItem: nil, attribute: .height, multiplier: 1.0, constant: height)
    self.view.addConstraint(containerViewHeightConstraint!)
  }
  
  private func toggleLoadingView(visible: Bool) {
    DispatchQueue.main.async {
      if visible {
        self.loadingView.startAnimatingGIF()
        self.loadingView.isHidden = false
      } else {
        self.loadingView.isHidden = true
        self.loadingView.stopAnimatingGIF()
      }
    }
  }
}

extension DroppDetailViewController: MKMapViewDelegate {
  
  func mapView(_ mapView: MKMapView, didUpdate userLocation: MKUserLocation) {
    let span = MKCoordinateSpan(latitudeDelta: 0.2, longitudeDelta: 0.2)
    let region = MKCoordinateRegion(center: mapView.userLocation.coordinate, span: span)
    mapView.setRegion(region, animated: true)
  }
}
