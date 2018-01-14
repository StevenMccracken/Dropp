//
//  ProfileViewController.swift
//  Dropp
//
//  Created by Steven McCracken on 1/6/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import UIKit

class ProfileViewController: UITableViewController {
  
  var user: User!
  var dropps: [Dropp] = []
  var filteredDropps: [Dropp] = []
  private var sortingType: DroppFeedSortingType = .chronological
  private var refreshing = false
  private var searchController: UISearchController!
  private var isFiltering: Bool {
    return searchController.isActive && !((searchController.searchBar.text ?? "").isEmpty)
  }
  
  private lazy var fetchFailedLabel: UILabel = {
    let label = UILabel(frame: CGRect(x: 0, y: 0, width: tableView.bounds.size.width, height: tableView.bounds.size.height))
    label.textColor = .salmon
    label.textAlignment = .center
    label.lineBreakMode = .byWordWrapping
    label.text = "Unable to get dropps😢"
    label.font = UIFont(name: label.font.fontName, size: 25.0)
    label.sizeToFit()
    return label
  }()
  
  private lazy var noDroppsPostedLabel: UILabel = {
    let label = UILabel(frame: CGRect(x: 0, y: 0, width: tableView.bounds.size.width, height: tableView.bounds.size.height))
    label.textColor = .salmon
    label.textAlignment = .center
    label.text = "No dropps posted😒"
    label.lineBreakMode = .byWordWrapping
    label.font = UIFont(name: label.font.fontName, size: 30.0)
    label.sizeToFit()
    
    return label
  }()
  
  private lazy var notFollowingLabel: UILabel = {
    let label = UILabel(frame: CGRect(x: 0, y: 0, width: tableView.bounds.size.width, height: tableView.bounds.size.height))
    label.textColor = .salmon
    label.textAlignment = .center
    label.lineBreakMode = .byWordWrapping
    label.text = "Follow this user to see all of their dropps🔑"
    label.font = UIFont(name: label.font.fontName, size: 20.0)
    label.sizeToFit()
    
    return label
  }()
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    navigationController?.navigationBar.tintColor = .salmon
    let sortButton = UIBarButtonItem(title: "Sort", style: .plain, target: self, action: #selector(didTapSortButton))
    if user.isCurrentUser {
      let infoButton = UIButton(type: .detailDisclosure)
      infoButton.addTarget(self, action: #selector(didTapInfoButton), for: .touchUpInside)
      navigationItem.rightBarButtonItem = UIBarButtonItem(customView: infoButton)
      navigationItem.leftBarButtonItem = sortButton
      navigationItem.largeTitleDisplayMode = .automatic
    } else {
      title = "\(user.username)"
      navigationItem.rightBarButtonItem = sortButton
      navigationItem.largeTitleDisplayMode = .never
    }
    
    searchController = UISearchController(searchResultsController: nil)
    searchController.searchResultsUpdater = self
    searchController.obscuresBackgroundDuringPresentation = false
    searchController.searchBar.placeholder = "Search"
    searchController.searchBar.tintColor = .salmon
    searchController.searchBar.delegate = self
    navigationItem.searchController = searchController
    definesPresentationContext = true
    
    tableView.rowHeight = UITableViewAutomaticDimension
    tableView.estimatedRowHeight = 150
    
    let refreshControl = UIRefreshControl()
    refreshControl.tintColor = .salmon
    refreshControl.addTarget(self, action: #selector(tableViewWasPulled), for: .valueChanged)
    self.refreshControl = refreshControl
    
    getDropps()
    getFollowers()
    getFollowing()
  }
  
  override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
    refreshing = false
    self.refreshControl?.endRefreshing()
  }
  
  @objc
  func didTapInfoButton() {
    guard user == LoginManager.shared.currentUser else {
      return
    }
    
    let profileDetailsStoryboard = UIStoryboard(name: "ProfileDetails", bundle: nil)
    guard let profileDetailsViewController = profileDetailsStoryboard.instantiateInitialViewController() as? ProfileDetailsViewController else {
      debugPrint("Initial view controller for ProfileDetails was invalid")
      return
    }
    
    profileDetailsViewController.user = user
    navigationController?.pushViewController(profileDetailsViewController, animated: true)
  }
  
  func getDropps(_ done: (() -> Void)? = nil) {
    guard !refreshing else {
      return
    }
    
    let completion = {
      self.refreshing = false
      done?()
    }
    
    refreshing = true
    DroppService.getDropps(forUser: user, success: { [weak self] (dropps: [Dropp]) in
      guard let strongSelf = self else {
        return
      }
      
      debugPrint("Got \(dropps.count) dropps posted by the user")
      strongSelf.refreshTableView(with: dropps, done: { () in
        strongSelf.toggleNoDroppsPostedLabel(visible: dropps.isEmpty)
        completion()
      })
    }, failure: { [weak self] (getDroppsError: NSError) in
      guard let strongSelf = self else {
        return
      }
      
      debugPrint("Failed to get user's dropps", getDroppsError)
      if getDroppsError.code == 403 {
        strongSelf.toggleNotFollowingLabel(visible: true)
      } else if strongSelf.dropps.isEmpty {
        strongSelf.toggleFetchFailedLabel(visible: true)
      }
      
      completion()
    })
  }
  
  func refreshTableView(with dropps: [Dropp], done: (() -> Void)? = nil) {
    let originalCount = self.dropps.count
    DispatchQueue.main.async {
      self.tableView.reloadSections(IndexSet(integer: 0), with: .fade)
      self.dropps.removeAll()
      if originalCount > 0 {
        let deleteSet = IndexSet(integersIn: 1 ..< originalCount + 1)
        self.tableView.deleteSections(deleteSet, with: .fade)
      }
      
      self.dropps.append(contentsOf: dropps)
      let insertSet = IndexSet(integersIn: 1 ..< self.dropps.count + 1)
      self.tableView.insertSections(insertSet, with: .fade)
      done?()
    }
  }
  
  @objc
  func didTapSortButton() {
    let droppsType = user.isCurrentUser ? "your dropps" : "dropps"
    let disclosure = "If you choose to sort by distance and your location cannot be determined, \(droppsType) will be sorted by newest first."
    let alert = UIAlertController(title: "Sort Dropps", message: disclosure, preferredStyle: .actionSheet, color: .salmon)
    
    let distanceTitle = "Distance\(sortingType == .distance ? " ✓" : "")"
    alert.addAction(UIAlertAction(title: distanceTitle, style: .default, handler: { _ in
      guard self.sortingType != .distance else {
        return
      }
      
      if let location = LocationManager.shared.currentLocation {
        self.sortingType = .distance
        self.dropps = Dropp.sort(self.dropps, by: .distance, currentLocation: location)
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
    present(alert, animated: true, completion: nil)
  }
  
  func getFollowers(_ done: (() -> Void)? = nil) {
    UserService.getFollowers(forUser: user, success: { [weak self] (followers: [User]) in
      guard let strongSelf = self else {
        return
      }
      
      debugPrint("The user has \(followers.count) follower(s)")
      strongSelf.user.followers = followers
      strongSelf.updateFollowersCount()
      done?()
    }, failure: { [weak self] (getFollowersError: NSError) in
      guard let _ = self else {
        return
      }
      
      debugPrint("Failed to get user's followers", getFollowersError)
      done?()
    })
  }
  
  func getFollowing(_ done: (() -> Void)? = nil) {
    UserService.getFollowing(forUser: user, success: { [weak self] (following: [User]) in
      guard let strongSelf = self else {
        return
      }
      
      debugPrint("The user is following \(following.count) user(s)")
      strongSelf.user.following = following
      strongSelf.updateFollowingCount()
      done?()
    }, failure: { [weak self] (getFollowingError: NSError) in
      guard let _ = self else {
        return
      }
      
      debugPrint("Failed to get user's following", getFollowingError)
      done?()
    })
  }
  
  func updateFollowersCount() {
    DispatchQueue.main.async {
      self.tableView.reloadSections(IndexSet(integer: 0), with: .automatic)
    }
  }
  
  func updateFollowingCount() {
    DispatchQueue.main.async {
      self.tableView.reloadSections(IndexSet(integer: 0), with: .automatic)
    }
  }
  
  @objc
  func tableViewWasPulled() {
    getDropps({ [weak self] () in
      guard let strongSelf = self else {
        return
      }
      
      DispatchQueue.main.async {
        strongSelf.refreshControl?.endRefreshing()
      }
    })
    
    getFollowing({ [weak self] () in
      guard let strongSelf = self else {
        return
      }
      
      DispatchQueue.main.async {
        strongSelf.refreshControl?.endRefreshing()
      }
    })
    
    getFollowers({ [weak self] () in
      guard let strongSelf = self else {
        return
      }
      
      DispatchQueue.main.async {
        strongSelf.refreshControl?.endRefreshing()
      }
    })
  }
  
  func toggleFetchFailedLabel(visible: Bool) {
    DispatchQueue.main.async {
      self.toggleTableViewLabel(self.fetchFailedLabel, visible: visible)
    }
  }
  
  func toggleNoDroppsPostedLabel(visible: Bool) {
    DispatchQueue.main.async {
      self.toggleTableViewLabel(self.noDroppsPostedLabel, visible: visible)
    }
  }
  
  func toggleNotFollowingLabel(visible: Bool) {
    DispatchQueue.main.async {
      self.toggleTableViewLabel(self.notFollowingLabel, visible: visible)
    }
  }
  
  func toggleTableViewLabel(_ label: UILabel, visible: Bool) {
    if visible {
      tableView.separatorStyle = .none
      tableView.backgroundView = label
    } else {
      tableView.separatorStyle = .singleLine
      tableView.backgroundView = nil
    }
  }
  
  // MARK: - Table view data source
  
  override func numberOfSections(in tableView: UITableView) -> Int {
    return isFiltering ? filteredDropps.count : dropps.count + 1
  }
  
  override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    return 1
  }
  
  override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    var cell: UITableViewCell
    if indexPath.section == 0 && !isFiltering {
      let headerCell = tableView.dequeueReusableCell(withIdentifier: "ProfileHeaderTableViewCell", for: indexPath) as! ProfileHeaderTableViewCell
      if let followersCount = user.followers?.count {
        headerCell.updateFollowers(followersCount)
      }
      
      if let followingCount = user.following?.count {
        headerCell.updateFollowing(followingCount)
      }
      
      headerCell.toggleInteractionButton(visible: !user.isCurrentUser)
      if let _ = user.followers {
        let following = LoginManager.shared.currentUser!.isFollowing(user) ?? false
        let buttonText = following ? "Unfollow" : "Follow"
        headerCell.toggleInteractionButton(enabled: true)
        headerCell.updateInteractionButton(buttonText, state: .normal)
      } else {
        headerCell.toggleInteractionButton(enabled: false)
        headerCell.updateInteractionButton("Loading...", state: .disabled)
      }
      
      headerCell.delegate = self
      cell = headerCell
    } else {
      let droppCell = tableView.dequeueReusableCell(withIdentifier: "DroppTableViewCell", for: indexPath) as! DroppTableViewCell
      let dropp = isFiltering ? filteredDropps[indexPath.section] : dropps[indexPath.section - 1]
      droppCell.addContent(from: dropp)
      cell = droppCell
    }
    
    return cell
  }
  
  override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
    if indexPath.section > 0 {
      performSegue(withIdentifier: Constants.showDroppDetailSegueId, sender: self)
    }
  }
  
  // MARK: - Navigation
   
  override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
    guard segue.identifier == Constants.showDroppDetailSegueId else {
      return
    }
    
    guard let indexPath = tableView.indexPathForSelectedRow else {
      return
    }
    
    guard indexPath.section > 0 else {
      return
    }
    
    guard let destination = segue.destination as? DroppDetailViewController else {
      return
    }
    
    destination.dropp = isFiltering ? filteredDropps[indexPath.section] : dropps[indexPath.section - 1]
    destination.droppFeedViewControllerDelegate = self
  }
}

extension ProfileViewController: UISearchBarDelegate {
  
  func searchBar(_ searchBar: UISearchBar, textDidChange searchText: String) {
    guard !searchText.trim().isEmpty else {
      return
    }
    
    filterContent(searchText)
  }
}

extension ProfileViewController: UISearchResultsUpdating {
  
  func updateSearchResults(for searchController: UISearchController) {
    filterContent(searchController.searchBar.text!)
  }
  
  func filterContent(_ filter: String) {
    filteredDropps = dropps.filter {
      return $0.message!.contains(filter, options: .caseInsensitive)
    }
    
    tableView.reloadData()
  }
}

extension ProfileViewController: DroppFeedViewControllerDelegate {
  
  func shouldRefreshData() {
    getDropps()
  }
}

extension ProfileViewController: ProfileHeaderTableViewCellDelegate {
  
  func didTapFollowersButton() {
    guard let _ = user.followers else {
      return
    }
    
    let followersStoryboard = UIStoryboard(name: "Connections", bundle: nil)
    guard let connectionsViewController = followersStoryboard.instantiateInitialViewController() as? ConnectionsViewController else {
      debugPrint("Initial view controller for Followers storyboard was nil")
      return
    }
    
    connectionsViewController.user = user
    connectionsViewController.connectionType = .follower
    navigationController?.pushViewController(connectionsViewController, animated: true)
  }
  
  func didTapFollowingButton() {
    guard let _ = user.following else {
      return
    }
    
    let followersStoryboard = UIStoryboard(name: "Connections", bundle: nil)
    guard let connectionsViewController = followersStoryboard.instantiateInitialViewController() as? ConnectionsViewController else {
      debugPrint("Initial view controller for Followers storyboard was nil")
      return
    }
    
    connectionsViewController.user = user
    connectionsViewController.connectionType = .following
    navigationController?.pushViewController(connectionsViewController, animated: true)
  }
  
  func didTapInteractionButton() {
    if let isFollowing = LoginManager.shared.currentUser!.isFollowing(user) {
      if isFollowing {
        // Send unfollow request
      } else {
        // Send follow request
      }
    }
  }
}
