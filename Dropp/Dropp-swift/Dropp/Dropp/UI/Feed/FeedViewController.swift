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
  private var refreshing = false
  private var sortingType: DroppFeedSortingType = .closest
  private var locationAuthorizationEventHandler: Disposable?
  private lazy var fetchFailedLabel: UILabel = {
    let label = UILabel("\nUnable to get dropps😟", forTableView: tableView, fontSize: 20)
    return label
  }()
  
  private lazy var noNearbyDroppsLabel: UILabel = {
    let label = UILabel("\nNo dropps😢", forTableView: tableView, fontSize: 20)
    return label
  }()
  
  override func viewDidLoad() {
    super.viewDidLoad()
    tableView.register(UINib(nibName: DroppTableViewCell.identifier, bundle: nil), forCellReuseIdentifier: DroppTableViewCell.identifier)
    
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
    DroppService.getAllDropps(currentLocation: LocationManager.shared.currentLocation, withRange: SettingsManager.shared.maxFetchDistance, success: { [weak self] (dropps: [Dropp]) in
      guard let strongSelf = self else {
        return
      }
      
      debugPrint("Got \(dropps.count) dropps")
      strongSelf.dropps = Dropp.sort(dropps, by: strongSelf.sortingType, currentLocation: LocationManager.shared.currentLocation)
      strongSelf.toggleNoNearbyDroppsLabel(visible: dropps.isEmpty)
      completion()
    }, failure: { [weak self] (getDroppsError: NSError) in
      guard let strongSelf = self else {
        return
      }
      
      debugPrint("Failed to get dropps", getDroppsError)
      strongSelf.toggleFetchFailedLabel(visible: strongSelf.dropps.isEmpty)
      completion()
    })
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
    let cell = tableView.dequeueReusableCell(withIdentifier: DroppTableViewCell.identifier, for: indexPath) as! DroppTableViewCell
    
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
    guard let detailViewController = segue.destination as? DroppDetailViewController else {
      return
    }
    
    guard let indexPath = tableView.indexPathForSelectedRow else {
      return
    }
    
    let dropp = dropps[indexPath.section]
    detailViewController.dropp = dropp
    detailViewController.feedViewControllerDelegate = self
  }
}

extension FeedViewController: FeedViewControllerDelegate {
  
  func shouldRefreshData() {
    refreshData()
  }
  
  func shouldRefresh(dropp: Dropp, with newDropp: Dropp? = nil) {
    guard let index = dropps.index(of: dropp) else {
      return
    }
    
    if let newDropp = newDropp {
      dropps[index] = newDropp
    }
    
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
