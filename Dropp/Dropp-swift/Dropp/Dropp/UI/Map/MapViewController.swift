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
  
  var isRefreshing = false
  var dropps = [Dropp]()
  private var annotations = [MKPointAnnotation]()
  
  override func viewDidLoad() {
    super.viewDidLoad()
    mapView.delegate = self
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
  
  override func didReceiveMemoryWarning() {
    super.didReceiveMemoryWarning()
    // Dispose of any resources that can be recreated.
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
    })
  }
  
  @IBAction func didTapLocateUserButton(_ sender: UIButton) {
    sender.isEnabled = false
    mapView.deselectSelectedAnnotations(animated: true)
    updateMapView(withDropps: dropps) { [weak self] () in
      guard let _ = self else {
        return
      }
      
      sender.isEnabled = true
    }
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
  
  /*
   // MARK: - Navigation
   
   // In a storyboard-based application, you will often want to do a little preparation before navigation
   override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
   // Get the new view controller using segue.destinationViewController.
   // Pass the selected object to the new view controller.
   }
   */
  
  func updateMapView(withDropps dropps: [Dropp], done: (() -> Void)? = nil) {
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
    
    done?()
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
  
  func mapView(_ mapView: MKMapView, didSelect view: MKAnnotationView) {
    guard let annotation = view.annotation else {
      return
    }
    
    mapView.showAnnotations([annotation], animated: true)
    guard let pointAnnotation = annotation as? MKPointAnnotation, let index = annotations.index(of: pointAnnotation), index < dropps.count else {
      return
    }
    
    let droppDetailStoryboard = UIStoryboard(name: "DroppDetail", bundle: nil)
    guard let droppDetailViewController = droppDetailStoryboard.instantiateInitialViewController() as? DroppDetailViewController else {
      return
    }
    
    droppDetailViewController.dropp = dropps[index]
    droppDetailViewController.shouldZoomToDroppOnAppearance = true
    droppDetailViewController.feedViewControllerDelegate = self
    navigationController?.pushViewController(droppDetailViewController, animated: true)
    mapView.deselectAnnotation(annotation, animated: true)
  }
}

extension MapViewController: FeedViewControllerDelegate {
  
  func shouldRefreshData() {
    
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
