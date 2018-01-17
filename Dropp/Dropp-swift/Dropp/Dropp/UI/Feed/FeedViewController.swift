//
//  FeedViewController.swift
//  Dropp
//
//  Created by Steven McCracken on 12/23/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import UIKit

class FeedViewController: UITableViewController {
  
  var dropps: [Dropp] = []
  var filteredDropps: [Dropp] = []
  private var refreshing = false
  private var sortingType: DroppFeedSortingType = .closest
  private var locationAuthorizationEventHandler: Disposable?
  private lazy var fetchFailedLabel: UILabel = {
    let label = UILabel(withText: "\nUnable to get dropps😟", forTableViewBackground: tableView, andFontSize: 30)
    return label
  }()
  
  private lazy var noNearbyDroppsLabel: UILabel = {
    let label = UILabel(withText: "\nNo nearby dropps😢", forTableViewBackground: tableView, andFontSize: 30)

    return label
  }()
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    navigationItem.rightBarButtonItem = UIBarButtonItem(title: "Sort", style: .plain, target: self, action: #selector(didTapSortButton))
    navigationItem.rightBarButtonItem?.isEnabled = false
    tableView.rowHeight = UITableViewAutomaticDimension
    tableView.estimatedRowHeight = 150
    
    let refreshControl = UIRefreshControl()
    refreshControl.tintColor = .salmon
    refreshControl.addTarget(self, action: #selector(tableViewWasPulled), for: .valueChanged)
    self.refreshControl = refreshControl
    if !LocationManager.shared.canGetLocation {
      locationAuthorizationEventHandler = LocationManager.shared.authorizationUpdatedEvent.addHandler(target: self, handler: FeedViewController.didUpdateLocationAuthorization)
    } else {
      refreshData()
    }
  }
  
  override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
    refreshing = false
    self.refreshControl?.endRefreshing()
  }
  
  private func didUpdateLocationAuthorization(authorizationGranted: Bool) {
    if authorizationGranted {
      refreshData()
      locationAuthorizationEventHandler?.dispose()
    }
  }
  
  @objc
  func tableViewWasPulled() {
    refreshData() { [weak self] () in
      guard let strongSelf = self else {
        return
      }
      
      strongSelf.refreshControl?.endRefreshing()
    }
  }
  
  private func refreshData(_ done: (() -> Void)? = nil) {
    guard !refreshing else {
      return
    }
    
    let completion = {
      DispatchQueue.main.async {
        self.tableView.reloadData()
        self.refreshing = false
        done?()
      }
    }
    
    refreshing = true
    DroppService.getAllDropps(currentLocation: LocationManager.shared.currentLocation, withRange: 1000.0, success: { [weak self] (dropps: [Dropp]) in
      guard let strongSelf = self else {
        return
      }
      
      debugPrint("Got \(dropps.count) dropps")
      strongSelf.dropps = Dropp.sort(dropps, by: strongSelf.sortingType, currentLocation: LocationManager.shared.currentLocation)
      strongSelf.toggleNoNearbyDroppsLabel(visible: dropps.isEmpty)
      DispatchQueue.main.async {
        strongSelf.navigationItem.rightBarButtonItem?.isEnabled = !dropps.isEmpty
      }
      
      completion()
    }, failure: { [weak self] (getDroppsError: NSError) in
      guard let strongSelf = self else {
        return
      }
      
      debugPrint("Failed to get dropps", getDroppsError)
      strongSelf.toggleFetchFailedLabel(visible: strongSelf.dropps.isEmpty)
      DispatchQueue.main.async {
        strongSelf.navigationItem.rightBarButtonItem?.isEnabled = !strongSelf.dropps.isEmpty
      }
      
      completion()
    })
  }
  
  @objc
  func didTapSortButton() {
    let disclosure = "If you choose to sort by distance and your location cannot be determined, your feed will be sorted by newest dropps first."
    let alert = UIAlertController(title: "Sort Feed", message: disclosure, preferredStyle: .actionSheet, color: .salmon)
    
    let closestTitle = "Closest\(sortingType == .closest ? " ✓" : "")"
    alert.addAction(UIAlertAction(title: closestTitle, style: .default, handler: { _ in
      guard self.sortingType != .closest else {
        return
      }
      
      if let location = LocationManager.shared.currentLocation {
        self.sortingType = .closest
        self.dropps = Dropp.sort(self.dropps, by: .closest, currentLocation: location)
      } else {
        self.sortingType = .chronological
        self.dropps = Dropp.sort(self.dropps, by: .chronological)
      }
      
      self.tableView.reloadData()
    }))
    
    let farthestTitle = "Farthest\(sortingType == .farthest ? " ✓" : "")"
    alert.addAction(UIAlertAction(title: farthestTitle, style: .default, handler: { _ in
      guard self.sortingType != .farthest else {
        return
      }
      
      if let location = LocationManager.shared.currentLocation {
        self.sortingType = .farthest
        self.dropps = Dropp.sort(self.dropps, by: .farthest, currentLocation: location)
      } else {
        self.sortingType = .chronological
        self.dropps = Dropp.sort(self.dropps, by: .chronological)
      }
      
      self.tableView.reloadData()
    }))
    
    let newestTitle = "Newest\(sortingType == .chronological ? " ✓" : "")"
    alert.addAction(UIAlertAction(title: newestTitle, style: .default, handler: { _ in
      guard self.sortingType != .chronological else {
        return
      }
      
      self.sortingType = .chronological
      self.dropps = Dropp.sort(self.dropps, by: .chronological)
      self.tableView.reloadData()
    }))
    
    let oldestTitle = "Oldest\(sortingType == .reverseChronological ? " ✓" : "")"
    alert.addAction(UIAlertAction(title: oldestTitle, style: .default, handler: { _ in
      guard self.sortingType != .reverseChronological else {
        return
      }
      
      self.sortingType = .reverseChronological
      self.dropps = Dropp.sort(self.dropps, by: .reverseChronological)
      self.tableView.reloadData()
    }))
    
    alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
    if Utils.isPad() {
      let popover = alert.popoverPresentationController
      popover?.permittedArrowDirections = .up
      popover?.barButtonItem = navigationItem.rightBarButtonItem
    }
    
    present(alert, animated: true, completion: nil)
  }
  
  func toggleFetchFailedLabel(visible: Bool) {
    DispatchQueue.main.async {
      if visible {
        self.tableView.separatorStyle = .none
        self.tableView.backgroundView = self.fetchFailedLabel
      } else {
        self.tableView.separatorStyle = .singleLine
        self.tableView.backgroundView = nil
      }
    }
  }
  
  func toggleNoNearbyDroppsLabel(visible: Bool) {
    DispatchQueue.main.async {
      if visible {
        self.tableView.separatorStyle = .none
        self.tableView.backgroundView = self.noNearbyDroppsLabel
      } else {
        self.tableView.separatorStyle = .singleLine
        self.tableView.backgroundView = nil
      }
    }
  }
  
  // MARK: - Table view data source
  
  override func numberOfSections(in tableView: UITableView) -> Int {
    return dropps.count
  }
  
  override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    return 1
  }
  
  override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    let cell = tableView.dequeueReusableCell(withIdentifier: DroppTableViewCell.reuseIdentifier, for: indexPath) as! DroppTableViewCell
    
    // Configure the cell
    let dropp = dropps[indexPath.section]
    cell.addContent(from: dropp)
    return cell
  }
  
  override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
    performSegue(withIdentifier: Constants.showDroppDetailSegueId, sender: self)
  }
  
  // MARK: - Navigation
   
  // In a storyboard-based application, you will often want to do a little preparation before navigation
  override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
    guard segue.identifier == Constants.showDroppDetailSegueId else {
      return
    }
    
     // Get the new view controller using segue.destinationViewController.
     // Pass the selected object to the new view controller.
    guard let destination = segue.destination as? DroppDetailViewController else {
      return
    }
    
    guard let indexPath = tableView.indexPathForSelectedRow else {
      return
    }
    
    let dropp = dropps[indexPath.section]
    destination.dropp = dropp
    destination.displayInfoButton = !dropp.postedByCurrentUser
    destination.feedViewControllerDelegate = self
    let _ = destination.view
  }
}

extension FeedViewController: FeedViewControllerDelegate {
  
  func shouldRefreshData() {
    refreshData()
  }
  
  func shouldRefresh(dropp: Dropp, with newDropp: Dropp) {
    guard let index = dropps.index(of: dropp) else {
      return
    }
    
    dropps[index] = newDropp
    let indexPath = IndexPath(row: 0, section: index)
    DispatchQueue.main.async {
      self.tableView.reloadRows(at: [indexPath], with: .fade)
    }
  }
  
  func shouldAddDropp(_ dropp: Dropp) {
    if dropps.isEmpty {
      toggleFetchFailedLabel(visible: false)
      toggleNoNearbyDroppsLabel(visible: false)
    }
    
    DispatchQueue.main.async {
      var index: Int
      var rowAnimation: UITableViewRowAnimation
      var scrollPosition: UITableViewScrollPosition
      if self.sortingType == .reverseChronological || self.sortingType == .farthest {
        self.dropps.append(dropp)
        index = self.dropps.count - 1
        rowAnimation = .bottom
        scrollPosition = .bottom
      } else {
        self.dropps.insert(dropp, at: 0)
        index = 0
        rowAnimation = .top
        scrollPosition = .top
      }
      
      self.tableView.insertSections(IndexSet(integer: index), with: rowAnimation)
      
      let visibleIndexPaths = self.tableView.indexPathsForVisibleRows ?? []
      let indexPathToScrollTo = IndexPath(row: 0, section: index)
      guard !visibleIndexPaths.contains(indexPathToScrollTo) else {
        return
      }
      
      self.tableView.selectRow(at: indexPathToScrollTo, animated: true, scrollPosition: scrollPosition)
      DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(500)) {
        self.tableView.deselectRow(at: indexPathToScrollTo, animated: true)
      }
    }
  }
  
  func shouldRemoveDropp(_ dropp: Dropp) {
    guard let index = dropps.index(of: dropp) else {
      return
    }
    
    DispatchQueue.main.async {
      self.dropps.remove(at: index)
      self.tableView.deleteSections(IndexSet(integer: index), with: .left)
      if self.dropps.isEmpty {
        self.toggleNoNearbyDroppsLabel(visible: true)
      }
    }
  }
}
