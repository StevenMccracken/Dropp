//
//  MapViewController.swift
//  Dropp
//
//  Created by Steven McCracken on 1/19/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import UIKit
import MapKit

class MapViewController: UIViewController {
  
  @IBOutlet weak var mapView: MKMapView!
  @IBOutlet weak var statusBarBlurViewHeightConstraint: NSLayoutConstraint!
  @IBOutlet weak var refreshButtonBackgroundView: UIView!
  @IBOutlet weak var locateUserButton: UIButton!
  @IBOutlet weak var refreshButton: UIButton!
  @IBOutlet weak var activityIndicator: UIActivityIndicatorView!
  @IBOutlet weak var droppCountButton: UIButton!
  
  // MARK: Data sources
  private var dropps = [Dropp]()
  private var isRefreshing = false
  private var shouldTrackUserLocation = true
  private var annotations = [MKPointAnnotation]()
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    // Configure map view
    mapView.delegate = self
    let panGestureRecognizer = UIPanGestureRecognizer(target: self, action: #selector(userDidDragMap))
    panGestureRecognizer.delegate = self
    mapView.addGestureRecognizer(panGestureRecognizer)
    
    refreshButtonBackgroundView.layer.cornerRadius = 10
    droppCountButton.layer.cornerRadius = 5
    droppCountButton.contentEdgeInsets = UIEdgeInsets(top: 5, left: 5, bottom: 5, right: 5)
    didTapRefreshButton(self)
  }
  
  override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    NotificationCenter.default.addObserver(self, selector: #selector(deviceDidRotate), name: NSNotification.Name.UIDeviceOrientationDidChange, object: nil)
    navigationController?.setNavigationBarHidden(true, animated: true)
    deviceDidRotate()
  }
  
  override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
    navigationController?.setNavigationBarHidden(false, animated: true)
    NotificationCenter.default.removeObserver(self)
  }
  
  override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
    guard segue.identifier == Constants.showDroppDetailSegueId,
          let detailViewController = segue.destination as? DroppDetailViewController,
          let view = sender as? MKAnnotationView,
          let annotation = view.annotation,
          let pointAnnotation = annotation as? MKPointAnnotation,
          let index = annotations.index(of: pointAnnotation),
          index < dropps.count else {
      return
    }
    
    detailViewController.dropp = dropps[index]
    detailViewController.feedViewControllerDelegate = self
  }
  
  @IBAction func didTapRefreshButton(_ sender: Any) {
    guard !isRefreshing else {
      return
    }
    
    toggleDroppCountButton(hidden: true)
    toggleRefreshButton(enabled: false)
    toggleActivityIndicator(visible: true)
    retrieveDropps(success: { [weak self] (nearbyDropps: [Dropp]) in
      guard let strongSelf = self else {
        return
      }
      
      DispatchQueue.main.async {
        strongSelf.updateDroppCountButton(nearbyDropps)
        strongSelf.toggleDroppCountButton(hidden: false)
        strongSelf.updateMapView(withDropps: nearbyDropps)
        strongSelf.toggleActivityIndicator(visible: false)
        strongSelf.toggleRefreshButton(enabled: true)
      }
    }) { [weak self] error in
      guard let strongSelf = self else {
        return
      }
      
      DispatchQueue.main.async {
        strongSelf.toggleDroppCountButton(hidden: false)
        strongSelf.toggleActivityIndicator(visible: false)
        strongSelf.toggleRefreshButton(enabled: true)
      }
    }
  }
  
  @IBAction func didTapLocateUserButton(_ sender: UIButton) {
    sender.isEnabled = false
    shouldTrackUserLocation = true
    mapView.deselectSelectedAnnotations(animated: true)
    updateMapView(withDropps: dropps)
    sender.isEnabled = true
  }
  
  func retrieveDropps(success: (([Dropp]) -> Void)? = nil, failure: ((NSError) -> Void)? = nil) {
    guard !isRefreshing else {
      return
    }
    
    isRefreshing = true
    let range = SettingsManager.shared.maxFetchDistance
    let userLocation = LocationManager.shared.currentLocation
    mapView.deselectSelectedAnnotations(animated: true)
    DroppService.getDropps(near: userLocation, withRange: range, sorted: true, success: { [weak self] (nearbyDropps: [Dropp]) in
      guard let strongSelf = self else {
        return
      }
      
      strongSelf.isRefreshing = false
      success?(nearbyDropps)
    }, failure: { [weak self] (getNearbyDroppsError: NSError) in
      guard let strongSelf = self else {
        return
      }
      
      strongSelf.isRefreshing = false
      failure?(getNearbyDroppsError)
    })
  }
  
  func updateMapView(withDropps dropps: [Dropp]) {
    mapView.removeAnnotations(annotations)
    self.dropps = dropps
    annotations = dropps.map { $0.pointAnnotation }
    
    var userAnnotation: MKPointAnnotation?
    var allAnnotations = annotations
    if let userCoordinates = LocationManager.shared.currentCoordinates {
      userAnnotation = MKPointAnnotation()
      userAnnotation!.coordinate = userCoordinates
      allAnnotations.append(userAnnotation!)
    }
    
    mapView.showAnnotations(allAnnotations, animated: true)
    if let userAnnotation = userAnnotation {
      mapView.removeAnnotation(userAnnotation)
    }
  }
  
  @objc
  func deviceDidRotate() {
    if Utils.isPhone {
      let orientation = UIApplication.shared.statusBarOrientation
      let isPortrait = orientation == .portrait || orientation == .portraitUpsideDown
      statusBarBlurViewHeightConstraint.constant = isPortrait ? Constants.statusBarHeight : 0
    }
  }
  
  private func toggleDroppCountButton(hidden: Bool) {
    let alpha: CGFloat = hidden ? 0 : 1
    droppCountButton.animateAlpha(to: alpha, duration: 0.25)
  }
  
  private func updateDroppCountButton(_ dropps: [Dropp]) {
    var text: String
    if dropps.isEmpty {
      text = "No nearby dropps😢"
    } else {
      text = "\(dropps.count) dropp\(dropps.count == 1 ? "" : "s") nearby"
    }
    
    droppCountButton.setTitle(text, for: .disabled)
  }
  
  private func toggleRefreshButton(enabled: Bool) {
    refreshButton.isHidden = !enabled
    refreshButton.isEnabled = enabled
  }
  
  private func toggleActivityIndicator(visible: Bool) {
    activityIndicator.isHidden = !visible
    if visible {
      activityIndicator.startAnimating()
    } else {
      activityIndicator.stopAnimating()
    }
  }
}

extension MapViewController: MKMapViewDelegate {
  
  @objc
  private func userDidDragMap(_ gesture: UIGestureRecognizer) {
    if gesture.state == .began && shouldTrackUserLocation {
      shouldTrackUserLocation = false
    }
  }
  
  func mapView(_ mapView: MKMapView, didSelect view: MKAnnotationView) {
    // Make sure the selected annotation is found in the current list of dropps so the segue will not crash
    guard let annotation = view.annotation,
          let pointAnnotation = annotation as? MKPointAnnotation,
          let index = annotations.index(of: pointAnnotation),
          index < dropps.count else {
      return
    }
    
    shouldTrackUserLocation = false
    mapView.showAnnotations([annotation], animated: true)
    performSegue(withIdentifier: Constants.showDroppDetailSegueId, sender: view)
  }
  
  func mapView(_ mapView: MKMapView, didUpdate userLocation: MKUserLocation) {
    if shouldTrackUserLocation {
      updateMapView(withDropps: dropps)
    }
  }
}

extension MapViewController: FeedViewControllerDelegate {
  
  func shouldRefreshData() {
    didTapRefreshButton(self)
  }
  
  func shouldRefresh(dropp: Dropp, with newDropp: Dropp?) {
    guard let index = dropps.index(of: dropp) else {
      return
    }
    
    guard let newDropp = newDropp else {
      return
    }
    
    let newAnnotation = newDropp.pointAnnotation
    dropps[index] = newDropp
    DispatchQueue.main.async {
      self.mapView.removeAnnotation(self.annotations[index])
      self.annotations[index] = newAnnotation
      self.mapView.showAnnotations([newAnnotation], animated: true)
    }
  }
  
  func shouldAddDropp(_ dropp: Dropp) {
    dropps.append(dropp)
    let droppAnnotation = dropp.pointAnnotation
    annotations.append(droppAnnotation)
    mapView.showAnnotations([droppAnnotation], animated: true)
    DispatchQueue.main.async {
      self.updateDroppCountButton(self.dropps)
    }
  }
  
  func shouldRemoveDropp(_ dropp: Dropp) {
    guard let index = dropps.index(of: dropp) else {
      return
    }
    
    dropps.remove(at: index)
    updateMapView(withDropps: dropps)
    DispatchQueue.main.async {
      self.updateDroppCountButton(self.dropps)
    }
  }
}

extension MapViewController: UIGestureRecognizerDelegate {
  
  func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
    return true
  }
}
