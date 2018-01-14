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
  @IBOutlet weak var scrollView: UIScrollView!
  @IBOutlet weak var imageLoadingViewSpinner: GIFImageView!
  @IBOutlet weak var imageView: UIImageView!
  @IBOutlet weak var mapView: MKMapView!
  @IBOutlet weak var timestampLabel: UILabel!
  @IBOutlet weak var contentLabel: UILabel!
  @IBOutlet weak var textView: UITextView!
  @IBOutlet weak var darkLoadingView: UIView!
  @IBOutlet weak var darkLoadingViewSpinnerView: GIFImageView!
  @IBOutlet weak var fetchImageErrorLabel: UILabel!
  
  weak var droppFeedViewControllerDelegate: DroppFeedViewControllerDelegate?
  var dropp: Dropp!
  var displayInfoButton: Bool?
  var deletingDropp = false
  var editingDropp = false
  var editVersion: UInt = 0
  var containerViewHeightConstraint: NSLayoutConstraint?
  private lazy var editingDroppActivityIndicator: UIActivityIndicatorView = {
    return UIActivityIndicatorView(activityIndicatorStyle: .gray)
  }()
  
  override func viewDidLoad() {
    super.viewDidLoad()
    mapView.delegate = self
    textView.layer.cornerRadius = 5
    textView.backgroundColor = UIColor(white: 0.95, alpha: 1)
    
    if dropp.postedByCurrentUser {
      title = "⭐️Your dropp"
      darkLoadingViewSpinnerView.prepareForAnimation(withGIFNamed: Constants.activityIndicatorFileName)
    } else {
      title = "\(dropp.username!)'s dropp"
    }
    
    if dropp.hasMedia {
      imageLoadingViewSpinner.prepareForAnimation(withGIFNamed: Constants.activityIndicatorFileName)
      fetchMedia()
    }
    
    navigationItem.largeTitleDisplayMode = .never
    navigationItem.backBarButtonItem?.tintColor = .salmon
    addInfoButton()
    
    let formatter = DateFormatter()
    formatter.dateStyle = .medium
    formatter.timeStyle = .medium
    timestampLabel.text = formatter.string(from: dropp.date)
    contentLabel.text = dropp.message!
    if dropp.message!.isOnlyEmoji {
      contentLabel.font = UIFont(name: contentLabel.font.fontName, size: 40.0)
    }
    
    updateHeightConstraint()
    NotificationCenter.default.addObserver(self, selector: #selector(deviceDidRotate), name: NSNotification.Name.UIDeviceOrientationDidChange, object: nil)
    
    let span = MKCoordinateSpan(latitudeDelta: 0.008, longitudeDelta: 0.008)
    let region = MKCoordinateRegion(center: dropp.location.coordinate, span: span)
    mapView.setRegion(region, animated: true)
  }
  
  override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
    NotificationCenter.default.removeObserver(self)
  }
  
  func addInfoButton() {
    var infoButton: UIButton
    if dropp.postedByCurrentUser {
      infoButton = UIButton(type: .infoLight)
      infoButton.addTarget(self, action: #selector(showDroppOptions), for: .touchUpInside)
    } else {
      infoButton = UIButton(type: .detailDisclosure)
      infoButton.addTarget(self, action: #selector(showUserProfile), for: .touchUpInside)
    }
    
    navigationItem.rightBarButtonItem = UIBarButtonItem(customView: infoButton)
  }
  
  func addEditingCancelButton() {
    guard dropp.postedByCurrentUser else {
      return
    }
    
    navigationItem.leftBarButtonItem = UIBarButtonItem(barButtonSystemItem: .cancel, target: self, action: #selector(didTapEditingCancelButton))
    navigationItem.leftBarButtonItem?.tintColor = .salmon
  }
  
  func addEditingDoneButton() {
    guard dropp.postedByCurrentUser else {
      return
    }
    
    navigationItem.rightBarButtonItem = UIBarButtonItem(barButtonSystemItem: .done, target: self, action: #selector(didTapEditingDoneButton))
    navigationItem.rightBarButtonItem?.tintColor = .salmon
  }
  
  func fetchMedia() {
    toggleLoadingImageIndicator(visible: true)
    DroppService.getImage(forDropp: self.dropp, success: { [weak self] (image: UIImage) in
      guard let strongSelf = self else {
        return
      }
      
      DispatchQueue.main.async {
        strongSelf.toggleLoadingImageIndicator(visible: false)
        strongSelf.imageView.image = image
        guard !strongSelf.deletingDropp && !strongSelf.editingDropp else {
          return
        }
        
        strongSelf.updateHeightConstraint()
      }
    }, failure: { [weak self] (getImageError: NSError) in
      guard let strongSelf = self else {
        return
      }
    
      debugPrint("Failed getting image from dropp", strongSelf.dropp, getImageError)
      strongSelf.toggleLoadingImageIndicator(visible: false)
      DispatchQueue.main.async {
        strongSelf.fetchImageErrorLabel.isHidden = false
      }
    })
  }
  
  @objc
  func showUserProfile() {
    guard !dropp.postedByCurrentUser else {
      return
    }
    
    let profileStoryboard = UIStoryboard(name: "Profile", bundle: nil)
    guard let profileViewController = profileStoryboard.instantiateInitialViewController() as? ProfileViewController else {
      debugPrint("Initial view controller for Profile storyboard was nil")
      return
    }
    
    profileViewController.user = dropp.user
    navigationController?.pushViewController(profileViewController, animated: true)
  }
  
  @objc
  func showDroppOptions() {
    guard dropp.postedByCurrentUser else {
      return
    }
    
    let alert = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet, color: .salmon)
    if let image = imageView.image {
      alert.addAction(UIAlertAction(title: "Save photo", style: .default, handler: { _ in
        Utils.save(image: image, withTimestamp: self.dropp.date, andLocation: self.dropp.location, success: nil, failure: { (savePhotoError: Error?) in
          debugPrint("Failed to save photo to user's photos", savePhotoError)
          let errorAlert = UIAlertController(title: "Error", message: "Unable to save photo", preferredStyle: .alert, color: .salmon, addDefaultAction: true)
          Utils.present(viewController: errorAlert, animated: true, completion: nil)
        })
      }))
    }
    
    alert.addAction(UIAlertAction(title: "Edit dropp", style: .default, handler: { _ in
      guard !self.deletingDropp else {
        return
      }
      
      self.enterEditingState()
    }))
    
    alert.addAction(UIAlertAction(title: "Delete dropp", style: .destructive, handler: { _ in
      guard !self.deletingDropp else {
        return
      }
      
      self.deletingDropp = true
      self.toggleDarkLoadingView(visible: true)
      self.navigationItem.setHidesBackButton(true, animated: true)
      DroppService.delete(self.dropp, success: { [weak self] () in
        guard let strongSelf = self else {
          return
        }
        
        let alert = UIAlertController(title: "Success", message: "Your dropp has been deleted", preferredStyle: .alert, color: .salmon, addDefaultAction: true) { _ in
          strongSelf.navigationController?.popViewController(animated: true)
          strongSelf.droppFeedViewControllerDelegate?.shouldRefreshData()
        }
        
        strongSelf.present(alert, animated: true, completion: { () in
          strongSelf.toggleDarkLoadingView(visible: false)
          strongSelf.navigationItem.setHidesBackButton(false, animated: true)
        })
      }, failure: { [weak self] (deleteDroppError: NSError) in
        guard let strongSelf = self else {
          return
        }
        
        let alert = UIAlertController(title: "Error", message: "Unable to delete your dropp", preferredStyle: .alert, color: .salmon, addDefaultAction: true)
        strongSelf.present(alert, animated: true, completion: nil)
        strongSelf.toggleLoadingImageIndicator(visible: false)
        strongSelf.navigationItem.setHidesBackButton(false, animated: true)
      })
    }))
    
    alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
    present(alert, animated: true, completion: nil)
  }
  
  func enterEditingState() {
    guard !editingDropp else {
      return
    }
    
    imageView.animateAlpha(to: 0.0, duration: 0.25)
    DispatchQueue.main.async {
      self.scrollToTextView()
      self.scrollView.isUserInteractionEnabled = false
      self.addEditingCancelButton()
      self.addEditingDoneButton()
      self.navigationController?.navigationItem.setHidesBackButton(true, animated: true)
      self.editingDropp = true
      self.contentLabel.isHidden = true
      self.textView.text = self.contentLabel.text ?? ""
      self.textView.isHidden = false
      self.textView.isEditable = true
      self.textView.becomeFirstResponder()
    }
  }
  
  func exitEditingState() {
    guard editingDropp else {
      return
    }
    
    imageView.animateAlpha(to: 1.0, duration: 0.5)
    DispatchQueue.main.async {
      self.scrollView.scrollRectToVisible(self.mapView.frame, animated: true)
      self.scrollView.isUserInteractionEnabled = true
      self.navigationItem.leftBarButtonItem = nil
      self.addInfoButton()
      self.navigationController?.navigationItem.setHidesBackButton(false, animated: true)
      self.editingDropp = false
      self.textView.isHidden = true
      self.contentLabel.isHidden = false
      self.textView.resignFirstResponder()
    }
  }
  
  @objc
  func didTapEditingCancelButton() {
    editVersion += 1
    exitEditingState()
  }
  
  @objc
  func didTapEditingDoneButton() {
    var shouldSendUpdateRequest = false
    var shouldEndEditing = false
    let editedText = textView.text.trim()
    if editedText == dropp.message! {
      shouldEndEditing = true
    } else if dropp.hasMedia {
      shouldSendUpdateRequest = true
    } else {
      shouldSendUpdateRequest = !editedText.isEmpty
    }
    
    if shouldEndEditing {
      exitEditingState()
    } else if shouldSendUpdateRequest {
      textView.isEditable = false
      textView.resignFirstResponder()
      editingDroppActivityIndicator.startAnimating()
      navigationItem.rightBarButtonItem = UIBarButtonItem(customView: editingDroppActivityIndicator)
      
      let editVersion = self.editVersion
      DroppService.update(dropp, withText: editedText, success: { [weak self] () in
        guard let strongSelf = self else {
          return
        }
        
        guard editVersion == strongSelf.editVersion else {
          return
        }
        
        strongSelf.dropp.message = editedText
        DispatchQueue.main.async {
          strongSelf.contentLabel.text = editedText
        }
        
        strongSelf.exitEditingState()
      }, failure: { [weak self] (updateDroppError: NSError) in
        guard let strongSelf = self else {
          return
        }
        
        guard editVersion == strongSelf.editVersion else {
          return
        }
        
        let alert = UIAlertController(title: "Error", message: "Unable to update your dropp", preferredStyle: .alert, color: .salmon, addDefaultAction: true)
        DispatchQueue.main.async {
          strongSelf.editingDroppActivityIndicator.stopAnimating()
          strongSelf.addEditingDoneButton()
          strongSelf.present(alert, animated: true, completion: { () in
            strongSelf.textView.isEditable = true
          })
        }
      })
    } else {
      let alert = UIAlertController(title: "Invalid update", message: "This dropp must have a message", preferredStyle: .alert, color: .salmon, addDefaultAction: true)
      present(alert, animated: true, completion: nil)
    }
  }
  
  @objc
  func deviceDidRotate() {
    updateHeightConstraint()
    if editingDropp {
      scrollToTextView()
    }
  }
  
  func updateHeightConstraint() {
    if let existingHeightConstraint = containerViewHeightConstraint {
      self.view.removeConstraint(existingHeightConstraint)
    }
    
    let height = mapView.frame.height + timestampLabel.frame.height + contentLabel.frame.height + 5 * 3 + (dropp.hasMedia ? imageView.frame.height + 5 : 0)
    containerViewHeightConstraint = NSLayoutConstraint(item: containerView, attribute: .height, relatedBy: .equal, toItem: nil, attribute: .height, multiplier: 1.0, constant: height)
    self.view.addConstraint(containerViewHeightConstraint!)
  }
  
  func scrollToTextView() {
    let y = textView.frame.origin.y - 5
    scrollView.setContentOffset(CGPoint(x: 0, y: y), animated: true)
  }
  
  private func toggleLoadingImageIndicator(visible: Bool) {
    DispatchQueue.main.async {
      if visible {
        self.imageLoadingViewSpinner.startAnimatingGIF()
        self.imageLoadingViewSpinner.isHidden = false
      } else {
        self.imageLoadingViewSpinner.isHidden = true
        self.imageLoadingViewSpinner.stopAnimatingGIF()
      }
    }
  }
  
  private func toggleDarkLoadingView(visible: Bool) {
    DispatchQueue.main.async {
      if visible {
        self.darkLoadingViewSpinnerView.startAnimatingGIF()
        self.darkLoadingView.isHidden = false
        self.darkLoadingViewSpinnerView.isHidden = false
      } else {
        self.darkLoadingView.isHidden = true
        self.darkLoadingViewSpinnerView.isHidden = true
        self.darkLoadingViewSpinnerView.stopAnimatingGIF()
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
