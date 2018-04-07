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
  
  // MARK: Buttons
  private lazy var refreshButton = UIBarButtonItem(barButtonSystemItem: .refresh, target: self, action: #selector(didTapRefreshButton(_:)))
  private var activityIndicatorBarButton: UIBarButtonItem {
    activityIndicator.startAnimating()
    return UIBarButtonItem(customView: activityIndicator)
  }
  
  private lazy var locationButton: UIButton = {
    let button = UIButton(type: .custom)
    button.frame = CGRect(x: 0, y: 0, width: 20, height: 20)
    button.setImage(UIImage(named: "location_arrow_empty"), for: .normal)
    button.setImage(UIImage(named: "location_arrow_empty"), for: .disabled)
    button.setImage(UIImage(named: "location_arrow_filled"), for: .selected)
    button.addTarget(self, action: #selector(didTapLocateUserButton(_:)), for: .touchUpInside)
    return button
  }()
  
  private var locationBarButton: UIBarButtonItem {
    let button = UIBarButtonItem(customView: locationButton)
    let widthConstraint = button.customView?.widthAnchor.constraint(equalToConstant: 20)
    let heightConstraint = button.customView?.heightAnchor.constraint(equalToConstant: 20)
    widthConstraint?.isActive = true
    heightConstraint?.isActive = true
    return button
  }
  
  // MARK: Navigation bar views
  private lazy var activityIndicator = UIActivityIndicatorView(activityIndicatorStyle: .gray)
  private lazy var titleButton: UIButton = {
    let button = UIButton(type: .custom)
    button.setTitleColor(.black, for: .normal)
    button.titleLabel?.font = .systemFont(ofSize: 17, weight: .semibold)
    return button
  }()
  
  // MARK: Data sources
  private var dropps = [Dropp]()
  private var isRefreshing = false
  private var shouldTrackUserLocation = true
  private var annotations = [MKPointAnnotation]()
  
  // MARK: View lifecycle
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    // Configure navigation bar
    locationButton.isSelected = true
    navigationItem.leftBarButtonItem = locationBarButton
    
    // Configure map view
    mapView.delegate = self
    let panGestureRecognizer = UIPanGestureRecognizer(target: self, action: #selector(userDidDragMap))
    panGestureRecognizer.delegate = self
    mapView.addGestureRecognizer(panGestureRecognizer)
    
    // Fetch data
    refreshData()
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
  
  // MARK: Button actions
  
  @objc
  private func didTapRefreshButton(_ sender: UIBarButtonItem) {
    refreshData()
  }
  
  @IBAction func didTapLocateUserButton(_ sender: UIButton) {
    guard !shouldTrackUserLocation else {
      return
    }
    
    sender.isSelected = true
    shouldTrackUserLocation = true
    mapView.deselectSelectedAnnotations(animated: true)
    updateMapView(withDropps: dropps)
  }
  
  // MARK: UI updating functions
  
  /**
   Toggles whether or not the refreshing state is enabled.
   - Parameter enabled: whether or not to enable the refreshing state
   */
  private func toggleRefreshingState(enabled: Bool) {
    guard enabled != isRefreshing else {
      return
    }
    
    isRefreshing = enabled
    if enabled {
      mapView.deselectSelectedAnnotations(animated: true)
      navigationItem.rightBarButtonItem = activityIndicatorBarButton
    } else {
      activityIndicator.stopAnimating()
      navigationItem.rightBarButtonItem = refreshButton
    }
  }
  
  /**
   Refreshes the map view for a given list of dropps, including the user's location.
   - Parameter dropps: the dropps to refresh the map view with
   */
  private func updateMapView(withDropps dropps: [Dropp]) {
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
  
  /**
   Updates the title label for a given number of dropps.
   - Parameter dropps: the nearby dropps
   */
  private func updateDroppCount(_ dropps: [Dropp]) {
    var text: String
    if dropps.isEmpty {
      text = "No nearby dropps😢"
    } else {
      text = "\(dropps.count) dropp\(dropps.count == 1 ? "" : "s") nearby"
    }
    
    titleButton.setTitle(text, for: .normal)
    navigationItem.titleView = titleButton
    navigationItem.titleView?.sizeToFit()
  }
  
  // MARK: Remote interaction
  
  private func refreshData() {
    guard !isRefreshing else {
      return
    }
    
    toggleRefreshingState(enabled: true)
    let range = SettingsManager.shared.maxFetchDistance
    let userLocation = LocationManager.shared.currentLocation
    DroppService.getDropps(near: userLocation, withRange: range, sorted: true, success: { [weak self] (nearbyDropps: [Dropp]) in
      guard let strongSelf = self else {
        return
      }
      
      DispatchQueue.main.async {
        strongSelf.updateDroppCount(nearbyDropps)
        strongSelf.toggleRefreshingState(enabled: false)
        strongSelf.updateMapView(withDropps: nearbyDropps)
      }
    }) { [weak self] (getNearbyDroppsError) in
      guard let strongSelf = self else {
        return
      }
      
      let completion = {
        DispatchQueue.main.async {
          strongSelf.toggleRefreshingState(enabled: false)
        }
      }
      
      guard getNearbyDroppsError.code != Constants.locationNotEnabled else {
        completion()
        return()
      }
      
      let alert = UIAlertController(title: "Error", message: getNearbyDroppsError.localizedDescription, preferredStyle: .alert, color: .salmon, addDefaultAction: true)
      DispatchQueue.main.async {
        strongSelf.present(alert, animated: true) {
          completion()
        }
      }
    }
  }
}

extension MapViewController: MKMapViewDelegate {
  
  @objc
  private func userDidDragMap(_ gesture: UIGestureRecognizer) {
    if gesture.state == .began && shouldTrackUserLocation {
      shouldTrackUserLocation = false
      locationButton.isSelected = false
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
    DispatchQueue.main.async {
      self.refreshData()
    }
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
      self.updateDroppCount(self.dropps)
    }
  }
  
  func shouldRemoveDropp(_ dropp: Dropp) {
    guard let index = dropps.index(of: dropp) else {
      return
    }
    
    dropps.remove(at: index)
    updateMapView(withDropps: dropps)
    DispatchQueue.main.async {
      self.updateDroppCount(self.dropps)
    }
  }
}

extension MapViewController: UIGestureRecognizerDelegate {
  
  func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
    return true
  }
}
