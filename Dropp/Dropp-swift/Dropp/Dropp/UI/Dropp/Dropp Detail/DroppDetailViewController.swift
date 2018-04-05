//
//  DroppDetailViewController.swift
//  Dropp
//
//  Created by Steven McCracken on 4/4/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import MapKit
import CoreLocation

class DroppDetailViewController: UIViewController {
  
  // MARK: IBOutlets
  @IBOutlet weak var mapView: MKMapView!
  @IBOutlet weak var tableView: UITableView!
  @IBOutlet weak var headerView: DroppDetailHeaderView!
  
  // MARK: Navigation bar items
  private var originalTitle: String?
  private lazy var deletingActivityIndicator = UIActivityIndicatorView(activityIndicatorStyle: .gray)
  private lazy var activityIndicatorBarButton = UIBarButtonItem(customView: deletingActivityIndicator)
  private lazy var editButton = UIBarButtonItem(barButtonSystemItem: .edit, target: self, action: #selector(didTapEditButton(_:)))
  private lazy var deleteButton = UIBarButtonItem(barButtonSystemItem: .trash, target: self, action: #selector(didTapDeleteButton(_:)))
  private lazy var profileButton = UIBarButtonItem(title: dropp.user.username, style: .plain, target: self, action: #selector(didTapProfileButton(_:)))
  
  // MARK: Data sources
  var dropp: Dropp!
  private var image: UIImage?
  private var isFetching = false
  private var isDeleting = false
  private var firstTimeView = true
  private var didFailImageFetch = false
  
  // MARK: Location updates
  private var lastLocation: CLLocation?
  private var userLocationUpdatedEventHandler: Disposable?
  
  // MARK: Delegates
  weak var feedViewControllerDelegate: FeedViewControllerDelegate?
  
  // MARK: View lifecyle
  
  override func viewDidLoad() {
    super.viewDidLoad()
    navigationItem.largeTitleDisplayMode = .never
    if dropp.postedByCurrentUser {
      title = "⭐️Your dropp"
      navigationItem.rightBarButtonItems = [deleteButton, editButton]
    } else {
      title = "\(dropp.username!)'s dropp"
      navigationItem.rightBarButtonItem = profileButton
    }
    
    originalTitle = title
    
    // Configure table view
    tableView.delegate = self
    tableView.dataSource = self
    headerView.setTimestamp(date: dropp.date)
    headerView.updateDistance(forDropp: dropp, fromLocation: LocationManager.shared.currentLocation)
    tableView.register(nibAndReuseIdentifier: DroppMessageTableViewCell.identifier)
    tableView.register(nibAndReuseIdentifier: FetchedImageTableViewCell.identifier)
    
    // Configure map view
    mapView.delegate = self
    mapView.showAnnotations([dropp.pointAnnotation], animated: true)
    
    // Subscribe for location updates
    userLocationUpdatedEventHandler = LocationManager.shared.locationUpdatedEvent.addHandler(target: self, handler: DroppDetailViewController.userLocationDidUpdate)
    
    // Fetch the image if it exists
    fetchImage()
  }
  
  deinit {
    userLocationUpdatedEventHandler?.dispose()
  }
  
  // MARK: IBActions
  
  @objc
  private func didTapProfileButton(_ sender: UIBarButtonItem) {
    performSegue(withIdentifier: Constants.showProfileSegueId, sender: sender)
  }
  
  @objc
  private func didTapEditButton(_ sender: UIBarButtonItem) {
    performSegue(withIdentifier: Constants.showEditDroppSegueId, sender: sender)
  }
  
  @IBAction
  private func didTapDeleteButton(_ sender: UIBarButtonItem) {
    let alert = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet, color: .salmon)
    if Utils.isPad {
      let popover = alert.popoverPresentationController
      popover?.barButtonItem = sender
      popover?.permittedArrowDirections = .up
    }
    
    alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
    alert.addAction(UIAlertAction(title: "Delete dropp", style: .destructive) { _ in
      self.performDeleteAction()
    })
    
    present(alert, animated: true)
  }
  
  // MARK: State
  private func toggleDeletingState(enabled: Bool) {
    guard enabled != isDeleting else {
      return
    }
    
    isDeleting = enabled
    navigationItem.setHidesBackButton(enabled, animated: true)
    if enabled {
      title = "Deleting..."
      deletingActivityIndicator.startAnimating()
      navigationItem.rightBarButtonItems = [activityIndicatorBarButton]
    } else {
      title = originalTitle
      navigationItem.rightBarButtonItems = [deleteButton, editButton]
      deletingActivityIndicator.stopAnimating()
    }
  }
  
  private func performDeleteAction() {
    toggleDeletingState(enabled: true)
    let deleteCompletion = {
      DispatchQueue.main.async {
        self.feedViewControllerDelegate?.shouldRemoveDropp?(self.dropp)
        self.navigationController?.popViewController(animated: true)
      }
    }
    
    DroppService.delete(dropp, success: { [weak self] in
      guard let _ = self else {
        return
      }
      
      deleteCompletion()
    }) { [weak self] (deleteError) in
      guard let strongSelf = self else {
        return
      }
      
      guard deleteError.code != 404 else {
        deleteCompletion()
        return
      }
      
      debugPrint("Error while trying to delete dropp", deleteError)
      let alert = UIAlertController(title: "Error", message: "We're sorry, but we were unable to delete your dropp", preferredStyle: .alert, color: .salmon, addDefaultAction: true)
      DispatchQueue.main.async {
        strongSelf.present(alert, animated: true) {
          strongSelf.toggleDeletingState(enabled: false)
        }
      }
    }
  }
  
  // MARK: Navigation
  
  override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
    if segue.identifier == Constants.showProfileSegueId,
       let profileViewController = segue.destination as? ProfileViewController {
      profileViewController.user = dropp.user
    } else if segue.identifier == Constants.showEditDroppSegueId,
              let editDroppViewController = segue.destination as? EditDroppViewController {
      editDroppViewController.dropp = dropp
      editDroppViewController.delegate = self
    }
  }
  
  // MARK: Event handlers
  
  private func userLocationDidUpdate(_ location: CLLocation) {
    lastLocation = location
    DispatchQueue.main.async {
      self.headerView.updateDistance(forDropp: self.dropp, fromLocation: location)
    }
  }
  
  // MARK: Image handling
  private func fetchImage() {
    guard dropp.hasMedia, !isFetching else {
      return
    }
    
    isFetching = true
    DroppService.getImage(forDropp: dropp, success: { [weak self] (image) in
      guard let strongSelf = self else {
        return
      }
      
      strongSelf.image = image
      strongSelf.isFetching = false
      strongSelf.didFailImageFetch = false
      DispatchQueue.main.async {
        strongSelf.tableView.reloadSections(IndexSet(integer: 1), with: .fade)
      }
    }) { [weak self] (fetchError) in
      guard let strongSelf = self else {
        return
      }
      
      strongSelf.image = nil
      strongSelf.isFetching = false
      strongSelf.didFailImageFetch = true
      DispatchQueue.main.async {
        strongSelf.tableView.reloadSections(IndexSet(integer: 1), with: .fade)
      }
    }
  }
}

// MARK: UITableViewDataSource
extension DroppDetailViewController: UITableViewDataSource {
  
  func numberOfSections(in tableView: UITableView) -> Int {
    return dropp.hasMedia ? 2 : 1
  }
  
  func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    return 1
  }
  
  func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    var cell: UITableViewCell
    if indexPath.section == 0,
       let messageCell = tableView.dequeueReusableCell(withIdentifier: DroppMessageTableViewCell.identifier, for: indexPath) as? DroppMessageTableViewCell {
      messageCell.addContent(dropp: dropp)
      cell = messageCell
    } else if indexPath.section == 1,
      let imageCell = tableView.dequeueReusableCell(withIdentifier: FetchedImageTableViewCell.identifier, for: indexPath) as? FetchedImageTableViewCell {
      imageCell.addContent(image: image)
      imageCell.toggleLoadingIndicator(visible: isFetching)
      imageCell.toggleErrorLabel(visible: didFailImageFetch)
      cell = imageCell
    } else {
      cell = UITableViewCell()
    }
    
    return cell
  }
}

// MARK: UITableViewDelegate
extension DroppDetailViewController: UITableViewDelegate {
  
  func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
    return UIView()
  }
  
  func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
    var height: CGFloat
    switch section {
    case 1:
      height = 25
    default:
      height = 0
    }
    
    return height
  }
}

// MARK: FeedViewControllerDelegate
extension DroppDetailViewController: FeedViewControllerDelegate {
  
  func shouldRefreshData() {
    tableView.reloadData()
    feedViewControllerDelegate?.shouldRefreshData()
  }
  
  func shouldRefresh(dropp: Dropp, with newDropp: Dropp?) {
    feedViewControllerDelegate?.shouldRefresh(dropp: dropp, with: newDropp)
    guard let newDropp = newDropp else {
      return
    }
    
    self.dropp = newDropp
    tableView.reloadData()
  }
  
  func shouldRemoveDropp(_ dropp: Dropp) {
    feedViewControllerDelegate?.shouldRemoveDropp?(dropp)
  }
}

// MARK: MKMapViewDelegate
extension DroppDetailViewController: MKMapViewDelegate {
  
  func mapView(_ mapView: MKMapView, didSelect view: MKAnnotationView) {
    guard let coordinate = view.annotation?.coordinate else {
      return
    }
    
    let region = MKCoordinateRegion(center: coordinate, span: MKCoordinateSpan(latitudeDelta: 0.01, longitudeDelta: 0.01))
    mapView.setRegion(region, animated: true)
  }
}

