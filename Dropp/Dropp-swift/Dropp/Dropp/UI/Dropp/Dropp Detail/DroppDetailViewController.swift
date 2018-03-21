//
//  DroppDetailViewController.swift
//  Dropp
//
//  Created by Steven McCracken on 12/31/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import UIKit
import MapKit

class DroppDetailViewController: UIViewController {
  
  @IBOutlet weak var containerView: UIView!
  @IBOutlet weak var scrollView: UIScrollView!
  @IBOutlet weak var loadingImageBackgroundView: UIView!
  @IBOutlet weak var loadingImageActivityIndicatorView: UIActivityIndicatorView!
  @IBOutlet weak var imageView: UIImageView!
  @IBOutlet weak var mapView: MKMapView!
  @IBOutlet weak var locateButtonBackgroundView: UIView!
  @IBOutlet weak var locateUserButton: UIButton!
  @IBOutlet weak var activeDistanceButton: UIButton!
  @IBOutlet weak var timestampLabel: UICopyableLabel!
  @IBOutlet weak var contentLabel: UICopyableLabel!
  @IBOutlet weak var textView: UITextView!
  @IBOutlet weak var fetchImageErrorLabel: UILabel!
  
  weak var feedViewControllerDelegate: FeedViewControllerDelegate?
  private var originalTitle: String!
  var dropp: Dropp!
  var droppPointAnnotation: MKPointAnnotation!
  var deletingDropp = false
  var editingDropp = false
  var editVersion: UInt = 0
  var shouldUpdateMapRegion = true
  var shouldZoomToDroppOnAppearance = false
  var containerViewHeightConstraint: NSLayoutConstraint?
  private lazy var editingDroppActivityIndicator: UIActivityIndicatorView = {
    return UIActivityIndicatorView(activityIndicatorStyle: .gray)
  }()
  
  override func viewDidLoad() {
    super.viewDidLoad()
    mapView.delegate = self
    droppPointAnnotation = MKPointAnnotation()
    droppPointAnnotation.coordinate = dropp.location.coordinate
    
    locateButtonBackgroundView.layer.cornerRadius = 10
    
    activeDistanceButton.layer.cornerRadius = 5
    activeDistanceButton.setTitleColor(.salmon, for: .disabled)
    activeDistanceButton.contentEdgeInsets = UIEdgeInsets(top: 5, left: 5, bottom: 5, right: 5)
    
    loadingImageBackgroundView.layer.cornerRadius = 10
    textView.layer.cornerRadius = 5
    textView.backgroundColor = UIColor(white: 0.95, alpha: 1)
    
    if dropp.postedByCurrentUser {
      title = "⭐️Your dropp"
    } else {
      title = "\(dropp.username!)'s dropp"
    }
    
    originalTitle = title ?? ""
    if dropp.hasMedia {
      fetchMedia()
    }
    
    navigationItem.largeTitleDisplayMode = .never
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
    
    if shouldZoomToDroppOnAppearance {
      shouldUpdateMapRegion = false
      mapView.showAnnotations([droppPointAnnotation], animated: true)
      revealLocateUserButton()
    } else if let userCoordinates = LocationManager.shared.currentCoordinates {
      resizeMapView(withUserCoordinates: userCoordinates)
    }
    
    let panGestureRecognizer = UIPanGestureRecognizer(target: self, action: #selector(userDidDragMap))
    panGestureRecognizer.delegate = self
    mapView.addGestureRecognizer(panGestureRecognizer)
    
    let spacing = UIBarButtonItem(barButtonSystemItem: .flexibleSpace, target: nil, action: nil)
    let clearButton = UIBarButtonItem(title: "Clear", style: .plain, target: self, action: #selector(clearTextView))
    textView.addToolbar(withItems: [spacing, clearButton])
    
    activeDistanceButton.setTitle(dropp.distanceAwayMessage(from: LocationManager.shared.currentLocation), for: .disabled)
  }
  
  override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    NotificationCenter.default.addObserver(self, selector: #selector(deviceDidRotate), name: NSNotification.Name.UIDeviceOrientationDidChange, object: nil)
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
    if editingDroppActivityIndicator.isAnimating {
      editingDroppActivityIndicator.stopAnimating()
    }
  }
  
  func addDroppActivityIndicator() {
    editingDroppActivityIndicator.startAnimating()
    navigationItem.rightBarButtonItem = UIBarButtonItem(customView: editingDroppActivityIndicator)
  }
  
  func addEditingCancelButton() {
    guard dropp.postedByCurrentUser else {
      return
    }
    
    navigationItem.leftBarButtonItem = UIBarButtonItem(barButtonSystemItem: .cancel, target: self, action: #selector(didTapEditingCancelButton))
  }
  
  func addEditingDoneButton() {
    guard dropp.postedByCurrentUser else {
      return
    }
    
    navigationItem.rightBarButtonItem = UIBarButtonItem(barButtonSystemItem: .done, target: self, action: #selector(didTapEditingDoneButton))
    if editingDroppActivityIndicator.isAnimating {
      editingDroppActivityIndicator.stopAnimating()
    }
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
        Utils.save(image: image, withTimestamp: self.dropp.date, andLocation: self.dropp.location, success: nil, failure: { (savePhotoError: Error) in
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
      self.title = "Deleting..."
      self.addDroppActivityIndicator()
      self.navigationItem.setHidesBackButton(true, animated: true)
      self.mapView.isUserInteractionEnabled = false
      DroppService.delete(self.dropp, success: { [weak self] () in
        guard let strongSelf = self else {
          return
        }
        
        DispatchQueue.main.async {
          strongSelf.navigationItem.setHidesBackButton(false, animated: true)
          strongSelf.navigationController?.popViewController(animated: true)
          strongSelf.feedViewControllerDelegate?.shouldRemoveDropp?(strongSelf.dropp)
        }
      }, failure: { [weak self] (deleteDroppError: NSError) in
        guard let strongSelf = self else {
          return
        }
        
        let errorCompletion = {
          strongSelf.addInfoButton()
          strongSelf.title = strongSelf.originalTitle
          strongSelf.navigationItem.setHidesBackButton(false, animated: true)
          strongSelf.mapView.isUserInteractionEnabled = true
        }
        
        guard deleteDroppError.code != 404 else {
          let alert = UIAlertController(title: "Error", message: "We're sorry, but this dropp no longer exists", preferredStyle: .alert, color: .salmon, addDefaultAction: true) { _ in
              strongSelf.navigationItem.setHidesBackButton(false, animated: true)
              strongSelf.navigationController?.popViewController(animated: true)
              strongSelf.feedViewControllerDelegate?.shouldRemoveDropp?(strongSelf.dropp)
          }
          
          DispatchQueue.main.async {
            errorCompletion()
            strongSelf.present(alert, animated: true, completion: nil)
          }
         
          return
        }
        
        debugPrint("Error while trying to delete dropp", deleteDroppError)
        let alert = UIAlertController(title: "Error", message: "We're sorry, but we were unable to delete your dropp", preferredStyle: .alert, color: .salmon, addDefaultAction: true)
        DispatchQueue.main.async {
          strongSelf.present(alert, animated: true, completion: nil)
          errorCompletion()
        }
      })
    }))
    
    alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
    if Utils.isPad {
      let popover = alert.popoverPresentationController
      popover?.permittedArrowDirections = .up
      popover?.barButtonItem = navigationItem.rightBarButtonItem
    }
    
    present(alert, animated: true, completion: nil)
  }
  
  func enterEditingState() {
    guard !editingDropp else {
      return
    }
    
    imageView.animateAlpha(to: 0.0, duration: 0.25)
    DispatchQueue.main.async {
      self.title = "Editing dropp"
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
  
  func exitEditingState(_ done: (() -> Void)? = nil) {
    guard editingDropp else {
      done?()
      return
    }
    
    imageView.animateAlpha(to: 1.0, duration: 0.5)
    DispatchQueue.main.async {
      self.title = self.originalTitle
      self.scrollView.scrollRectToVisible(self.mapView.frame, animated: true)
      self.scrollView.isUserInteractionEnabled = true
      self.navigationItem.leftBarButtonItem = nil
      self.addInfoButton()
      self.navigationController?.navigationItem.setHidesBackButton(false, animated: true)
      self.editingDropp = false
      self.textView.isHidden = true
      self.contentLabel.isHidden = false
      self.textView.resignFirstResponder()
      done?()
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
      self.title = "Updating..."
      self.addDroppActivityIndicator()
      navigationItem.leftBarButtonItem?.isEnabled = false
      
      let editVersion = self.editVersion
      DroppService.update(dropp, withText: editedText, success: { [weak self] () in
        guard let strongSelf = self else {
          return
        }
        
        guard editVersion == strongSelf.editVersion else {
          return
        }
        
        let oldDropp: Dropp = strongSelf.dropp
        strongSelf.dropp.message = editedText
        strongSelf.feedViewControllerDelegate?.shouldRefresh(dropp: oldDropp, with: strongSelf.dropp)
        DispatchQueue.main.async {
          strongSelf.contentLabel.text = editedText
          if editedText.isOnlyEmoji {
            strongSelf.contentLabel.font = UIFont(name: strongSelf.contentLabel.font.fontName, size: 40.0)
          } else {
            strongSelf.contentLabel.font = UIFont(name: strongSelf.contentLabel.font.fontName, size: 20.0)
          }
        }
        
        strongSelf.exitEditingState() {
          strongSelf.updateHeightConstraint()
        }
      }, failure: { [weak self] (updateDroppError: NSError) in
        guard let strongSelf = self else {
          return
        }
        
        guard editVersion == strongSelf.editVersion else {
          return
        }
        
        let errorCompletion = {
          DispatchQueue.main.async {
            strongSelf.addEditingDoneButton()
            strongSelf.title = "Editing dropp"
          }
        }
        
        guard updateDroppError.code != 404 else {
          let alert = UIAlertController(title: "Error", message: "We're sorry, but this dropp no longer exists", preferredStyle: .alert, color: .salmon, addDefaultAction: true) { _ in
            strongSelf.navigationItem.setHidesBackButton(false, animated: true)
            strongSelf.navigationController?.popViewController(animated: true)
            strongSelf.feedViewControllerDelegate?.shouldRemoveDropp?(strongSelf.dropp)
          }
          
          strongSelf.present(alert, animated: true, completion: errorCompletion)
          return
        }
        
        debugPrint("Error while trying to update dropp", updateDroppError)
        let alert = UIAlertController(title: "Error", message: "We're sorry, but we were unable to update your dropp", preferredStyle: .alert, color: .salmon, addDefaultAction: true)
        strongSelf.present(alert, animated: true) {
          errorCompletion()
          DispatchQueue.main.async {
            strongSelf.textView.isEditable = true
            strongSelf.navigationItem.leftBarButtonItem?.isEnabled = true
          }
        }
      })
    } else {
      let alert = UIAlertController(title: "Invalid update", message: "This dropp must have a message", preferredStyle: .alert, color: .salmon, addDefaultAction: true)
      present(alert, animated: true, completion: nil)
    }
  }
  
  @objc
  func clearTextView() {
    textView.text = ""
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
      self.loadingImageBackgroundView.isHidden = !visible
      self.loadingImageActivityIndicatorView.isHidden = !visible
    }
  }
  
  @objc
  private func userDidDragMap(_ gesture: UIGestureRecognizer) {
    if gesture.state == .began && shouldUpdateMapRegion {
      shouldUpdateMapRegion = false
      revealLocateUserButton()
    }
  }
  
  @IBAction func didTapLocateUserButton(_ sender: UIButton) {
    sender.isEnabled = false
    locateButtonBackgroundView.animateAlpha(to: 0, duration: 0.2)
    if let userCoordinates = LocationManager.shared.currentCoordinates {
      resizeMapView(withUserCoordinates: userCoordinates)
    }
    
    mapView.deselectAnnotation(droppPointAnnotation, animated: true)
    shouldUpdateMapRegion = true
  }
  
  private func resizeMapView(withUserCoordinates coordinates: CLLocationCoordinate2D) {
    let userAnnotation = MKPointAnnotation()
    userAnnotation.coordinate = coordinates
    mapView.showAnnotations([userAnnotation, droppPointAnnotation], animated: true)
    mapView.removeAnnotation(userAnnotation)
  }
  
  private func revealLocateUserButton() {
    guard locateButtonBackgroundView.alpha == 0 else {
      return
    }
    
    locateButtonBackgroundView.animateAlpha(to: 1, duration: 0.2) {
      self.locateUserButton.isEnabled = true
    }
  }
}

extension DroppDetailViewController: MKMapViewDelegate {
  
  func mapView(_ mapView: MKMapView, didUpdate userLocation: MKUserLocation) {
    activeDistanceButton.setTitle(dropp.distanceAwayMessage(from: userLocation.location), for:  .disabled)
    if shouldUpdateMapRegion {
      resizeMapView(withUserCoordinates: userLocation.coordinate)
    } else {
      revealLocateUserButton()
    }
  }
  
  func mapView(_ mapView: MKMapView, didSelect view: MKAnnotationView) {
    guard let pointAnnotation = view.annotation as? MKPointAnnotation, pointAnnotation == droppPointAnnotation else {
      return
    }
    
    shouldUpdateMapRegion = false
    let region = MKCoordinateRegion(center: dropp.location.coordinate, span: MKCoordinateSpan(latitudeDelta: 0.01, longitudeDelta: 0.01))
    mapView.setRegion(region, animated: true)
    revealLocateUserButton()
  }
}

extension DroppDetailViewController: UIGestureRecognizerDelegate {
  
  func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
    return true
  }
}
