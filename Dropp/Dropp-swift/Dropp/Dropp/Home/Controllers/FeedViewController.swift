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
  private let showDetailSegueId = "showDroppDetail"
  private var locationAuthorizationEventHandler: Disposable?
  private lazy var noDataLabel: UILabel = {
    let label = UILabel(frame: CGRect(x: 0, y: 0, width: tableView.bounds.size.width, height: tableView.bounds.size.height))
    label.text = "No nearby dropps😢"
    label.textAlignment = .center
    label.textColor = .salmon
    label.font = UIFont(name: label.font.fontName, size: 30.0)
    label.sizeToFit()
    
    return label
  }()
  
  private lazy var selectedBackgroundView: UIView = {
    let view = UIView()
    view.backgroundColor = .mutedSalmon
    return view
  }()
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    let createDroppButton = UIBarButtonItem(barButtonSystemItem: .add, target: self, action: #selector(didTapCreateDroppButton))
    navigationItem.rightBarButtonItem = createDroppButton
    
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
  
  private func didUpdateLocationAuthorization(authorizationGranted: Bool) {
    if authorizationGranted {
      refreshData()
      locationAuthorizationEventHandler?.dispose()
    }
  }
  
  @objc
  func didTapCreateDroppButton() {
    let createDroppStoryboard = UIStoryboard(name: "CreateDropp", bundle: nil)
    guard let createDroppNavigationController = createDroppStoryboard.instantiateInitialViewController() else {
      debugPrint("Initial view controller for CreateDropp storyboard was nil")
      return
    }
    
    if let initialViewController = createDroppNavigationController.childViewControllers.first as? CreateDroppViewController {
      initialViewController.presentingViewControllerDelegate = self
    }
    
    present(createDroppNavigationController, animated: true, completion: nil)
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
  
  private func refreshData(done: (() -> Void)? = nil) {
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
    DroppService.getDropps(near: LocationManager.shared.currentCoordinates, withRange: 100.0, success: { [weak self] (dropps: [Dropp]) in
      guard let strongSelf = self else {
        return
      }
      
      debugPrint("Got \(dropps.count) nearby dropps")
      strongSelf.dropps = dropps
      strongSelf.toggleNoDataLabel(visible: dropps.isEmpty)
      completion()
    }, failure: { [weak self] (getDroppsError: NSError) in
      guard let strongSelf = self else {
        return
      }
      
      debugPrint("Failed to get nearby dropps", getDroppsError)
      strongSelf.toggleNoDataLabel(visible: strongSelf.dropps.isEmpty)
      completion()
    })
  }
  
  func toggleNoDataLabel(visible: Bool) {
    DispatchQueue.main.async {
      if visible {
        self.tableView.separatorStyle = .none
        self.tableView.backgroundView = self.noDataLabel
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
    return dropps.isEmpty ? 0 : 1
  }
  
  override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    let cell = tableView.dequeueReusableCell(withIdentifier: "DroppTableViewCell", for: indexPath) as! DroppTableViewCell
    
    // Configure the cell
    let dropp = dropps[indexPath.section]
    cell.addContent(from: dropp)
    cell.selectedBackgroundView = selectedBackgroundView
    return cell
  }
  
  override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
    performSegue(withIdentifier: showDetailSegueId, sender: self)
  }
  
  // MARK: - Navigation
   
  // In a storyboard-based application, you will often want to do a little preparation before navigation
  override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
    guard segue.identifier == showDetailSegueId else {
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
    
    destination.dropp = dropps[indexPath.section]
  }
}

extension FeedViewController: PresentingViewControllerDelegate {
  
  func didDismissPresentedView(from source: UIViewController) {
    refreshData()
  }
}
