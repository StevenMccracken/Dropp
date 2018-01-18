//
//  ProfileViewController.swift
//  Dropp
//
//  Created by Steven McCracken on 1/6/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import UIKit

class ProfileViewController: UITableViewController {
  
  var currentUserUpdatedEventHandler: Disposable?
  var user: User!
  var dropps: [Dropp] = []
  var filteredDropps: [Dropp] = []
  var sortButton: UIBarButtonItem!
  var infoButton: UIBarButtonItem!
  
  private var sortingType: DroppFeedSortingType = .chronological
  private var refreshing = false
  private var searchController: UISearchController!
  private var isFiltering: Bool {
    return searchController.isActive && !((searchController.searchBar.text ?? "").isEmpty)
  }
  
  private lazy var fetchFailedLabel: UILabel = {
    let label = UILabel(withText: "\nUnable to get dropps😢", forTableViewBackground: tableView, andFontSize: 300)
    return label
  }()
  
  private lazy var noDroppsPostedLabel: UILabel = {
    let label = UILabel(withText: "\nNo dropps posted😒", forTableViewBackground: tableView, andFontSize: 30)
    return label
  }()
  
  private lazy var notFollowingLabel: UILabel = {
    let label = UILabel(withText: "\nFollow this user to see all of their dropps🔑", forTableViewBackground: tableView, andFontSize: 30)
    return label
  }()
  
  private lazy var followRequestSentLabel: UILabel = {
    let label = UILabel(withText: "\nFollow request sent👌🏽", forTableViewBackground: tableView, andFontSize: 30)
    return label
  }()
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    navigationController?.navigationBar.tintColor = .salmon
    sortButton = UIBarButtonItem(title: "Sort", style: .plain, target: self, action: #selector(didTapSortButton))
    let disclosureButton = UIButton(type: .detailDisclosure)
    disclosureButton.addTarget(self, action: #selector(didTapInfoButton), for: .touchUpInside)
    infoButton = UIBarButtonItem(customView: disclosureButton)
    
    if user.isCurrentUser {
      navigationItem.leftBarButtonItem = sortButton
      navigationItem.rightBarButtonItem = infoButton
      navigationItem.largeTitleDisplayMode = .automatic
    } else {
      title = "\(user.username)"
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
    
    sortButton.isEnabled = false
    getDropps()
    getUserInfo()
  }
  
  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    if user.isCurrentUser {
      currentUserUpdatedEventHandler = LoginManager.shared.currentUserUpdatedEvent.addHandler(target: self, handler: ProfileViewController.updateUserProfile)
    }
  }
  
  override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
    refreshing = false
    self.refreshControl?.endRefreshing()
    currentUserUpdatedEventHandler?.dispose()
  }
  
  private func updateUserProfile(newUser: User) {
    user = newUser
    updateFollowersCount()
    updateFollowingCount()
  }
  
  @objc
  func didTapInfoButton() {
    if user.isCurrentUser {
      let profileDetailsStoryboard = UIStoryboard(name: "ProfileDetails", bundle: nil)
      guard let profileDetailsViewController = profileDetailsStoryboard.instantiateInitialViewController() as? ProfileDetailsViewController else {
        debugPrint("Initial view controller for ProfileDetails was invalid")
        return
      }
      
      profileDetailsViewController.user = user
      navigationController?.pushViewController(profileDetailsViewController, animated: true)
    } else {
      let alert = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet, color: .salmon)
      alert.addAction(UIAlertAction(title: "Remove follow request", style: .destructive, handler: { _ in
        self.navigationItem.setHidesBackButton(true, animated: true)
        let activityIndicator = UIActivityIndicatorView(activityIndicatorStyle: .gray)
        activityIndicator.startAnimating()
        self.navigationItem.rightBarButtonItem = UIBarButtonItem(customView: activityIndicator)
        UserService.removePendingFollowRequest(toUser: self.user, success: { [weak self] () in
          guard let strongSelf = self else {
            return
          }
          
          strongSelf.dropps = []
          strongSelf.filteredDropps = []
          strongSelf.toggleNotFollowingLabel(visible: true)
          DispatchQueue.main.async {
            strongSelf.tableView.reloadData()
            strongSelf.navigationItem.rightBarButtonItem = nil
            strongSelf.navigationItem.setHidesBackButton(false, animated: true)
          }
        }, failure: { [weak self] (removeFollowRequestError: NSError) in
          guard let strongSelf = self else {
            return
          }
          
          debugPrint("Error while removing pending follow request", removeFollowRequestError)
          let errorAlert = UIAlertController(title: "Error", message: "Unable to remove follow request at this time. Please try again later.", preferredStyle: .alert, color: .salmon, addDefaultAction: true)
          DispatchQueue.main.async {
            strongSelf.present(errorAlert, animated: true) { () in
              strongSelf.navigationItem.setHidesBackButton(false, animated: true)
              strongSelf.navigationItem.rightBarButtonItem = strongSelf.infoButton
            }
          }
        })
      }))
      
      alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
      if Utils.isPad() {
        let popover = alert.popoverPresentationController
        popover?.permittedArrowDirections = .up
        popover?.barButtonItem = infoButton
      }
      
      present(alert, animated: true, completion: nil)
    }
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
      let sortedDropps = Dropp.sort(dropps, by: strongSelf.sortingType, currentLocation: LocationManager.shared.currentLocation)
      strongSelf.refreshTableView(with: sortedDropps, done: { () in
        strongSelf.toggleNoDroppsPostedLabel(visible: sortedDropps.isEmpty)
        completion()
      })
      
      DispatchQueue.main.async {
        strongSelf.sortButton.isEnabled = !sortedDropps.isEmpty
      }
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
      
      DispatchQueue.main.async {
        strongSelf.sortButton.isEnabled = getDroppsError.code != 403 && !strongSelf.dropps.isEmpty
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
      popover?.barButtonItem = sortButton
    }
    
    present(alert, animated: true, completion: nil)
  }
  
  func getUserInfo(_ done: (() -> Void)? = nil) {
    UserService.getUser(username: user.username, success: { [weak self] (updatedUser: User) in
      guard let strongSelf = self else {
        return
      }
      
      if strongSelf.user.isCurrentUser {
        LoginManager.shared.updateCurrentUser(with: updatedUser)
      } else {
        strongSelf.updateUserProfile(newUser: updatedUser)
        if let doesFollowUser = LoginManager.shared.currentUser?.follows(updatedUser), doesFollowUser == true {
          DispatchQueue.main.async {
            strongSelf.navigationItem.rightBarButtonItem = strongSelf.sortButton
            let headerCell = strongSelf.tableView.dequeueReusableCell(withIdentifier: ProfileHeaderTableViewCell.reuseIdentifier, for: IndexPath(row: 0, section: 0)) as! ProfileHeaderTableViewCell
            headerCell.toggleInteractionButton(enabled: true, withTitle: "Unfollow")
          }
        } else if let hasRequestedFollow = LoginManager.shared.currentUser?.hasRequestedFollow(updatedUser), hasRequestedFollow == true {
          DispatchQueue.main.async {
            strongSelf.navigationItem.rightBarButtonItem = strongSelf.infoButton
            let headerCell = strongSelf.tableView.dequeueReusableCell(withIdentifier: ProfileHeaderTableViewCell.reuseIdentifier, for: IndexPath(row: 0, section: 0)) as! ProfileHeaderTableViewCell
            headerCell.toggleInteractionButton(enabled: false, withTitle: "Request pending...")
          }
        }
      }
      
      done?()
    }, failure: { [weak self] (getUserError: NSError) in
      guard let _ = self else {
        return
      }
      
      debugPrint("Failed to get updated user profile", getUserError)
      done?()
    })
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
    
    getUserInfo({ [weak self] () in
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
  
  func toggleFollowRequestSentLabel(visible: Bool) {
    DispatchQueue.main.async {
      self.toggleTableViewLabel(self.followRequestSentLabel, visible: visible)
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
      let headerCell = tableView.dequeueReusableCell(withIdentifier: ProfileHeaderTableViewCell.reuseIdentifier, for: indexPath) as! ProfileHeaderTableViewCell
      if let followersCount = user.followers?.count {
        headerCell.updateFollowers(followersCount)
        headerCell.toggleFollowersButton(enabled: followersCount > 0)
      } else {
        headerCell.toggleFollowersButton(enabled: false)
      }
      
      if let followingCount = user.following?.count {
        headerCell.updateFollowing(followingCount)
        headerCell.toggleFollowingButton(enabled: followingCount > 0)
      } else {
        headerCell.toggleFollowingButton(enabled: false)
      }
      
      headerCell.toggleInteractionButton(visible: !user.isCurrentUser)
      if let _ = user.followers {
        let following = LoginManager.shared.currentUser!.follows(user) ?? false
        headerCell.toggleInteractionButton(enabled: true, withTitle: following ? "Unfollow" : "Follow")
      } else {
        headerCell.toggleInteractionButton(enabled: false, withTitle: "Loading...")
      }
      
      if user.isCurrentUser {
        headerCell.setInteractionButtonHeight(0)
      }
      
      headerCell.delegate = self
      cell = headerCell
    } else {
      let droppCell = tableView.dequeueReusableCell(withIdentifier: DroppTableViewCell.reuseIdentifier, for: indexPath) as! DroppTableViewCell
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
    
    guard indexPath.section > 0 || isFiltering else {
      return
    }
    
    guard let destination = segue.destination as? DroppDetailViewController else {
      return
    }
    
    destination.dropp = isFiltering ? filteredDropps[indexPath.section] : dropps[indexPath.section - 1]
    destination.feedViewControllerDelegate = self
  }
  
  func toggleLoadingView(hidden: Bool, newRightBarButtonItem: UIBarButtonItem? = nil, _ completion: (() -> Void)? = nil) {
    updateInteractionButton(enabled: hidden) {
      if hidden {
        self.navigationItem.setHidesBackButton(false, animated: true)
        self.navigationItem.rightBarButtonItem = newRightBarButtonItem
      } else {
        self.navigationItem.setHidesBackButton(true, animated: true)
        let activityIndicator = UIActivityIndicatorView(activityIndicatorStyle: .gray)
        activityIndicator.startAnimating()
        self.navigationItem.rightBarButtonItem = UIBarButtonItem(customView: activityIndicator)
      }
      
      completion?()
    }
  }
  
  func updateInteractionButton(enabled: Bool, withTitle title: String? = nil, _ completion: (() -> Void)? = nil) {
    DispatchQueue.main.async {
      let headerCell = self.tableView.dequeueReusableCell(withIdentifier: ProfileHeaderTableViewCell.reuseIdentifier, for: IndexPath(row: 0, section: 0)) as! ProfileHeaderTableViewCell
      headerCell.toggleInteractionButton(enabled: enabled, withTitle: title)
      completion?()
    }
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

extension ProfileViewController: FeedViewControllerDelegate {
  
  func shouldRefreshData() {
    getDropps()
  }
  
  func shouldRefresh(dropp: Dropp, with newDropp: Dropp? = nil) {
    guard let index = dropps.index(of: dropp) else {
      return
    }
    
    if let newDropp = newDropp {
      dropps[index] = newDropp
    }
    
    let indexPath = IndexPath(row: 0, section: index + 1)
    DispatchQueue.main.async {
      self.tableView.reloadRows(at: [indexPath], with: .fade)
    }
  }
  
  func shouldAddDropp(_ dropp: Dropp) {
    if dropps.isEmpty {
      toggleFetchFailedLabel(visible: false)
      toggleNoDroppsPostedLabel(visible: false)
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
      
      self.tableView.insertSections(IndexSet(integer: index + 1), with: rowAnimation)
      let visibleIndexPaths = self.tableView.indexPathsForVisibleRows ?? []
      let indexPathToScrollTo = IndexPath(row: 0, section: index + 1)
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
      self.tableView.deleteSections(IndexSet(integer: index + 1), with: .left)
      if self.dropps.isEmpty {
        self.toggleNoDroppsPostedLabel(visible: true)
      }
    }
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
  
  func didTapInteractionButton(_ sender: ProfileHeaderTableViewCell) {
    if let hasRequestedToFollow = LoginManager.shared.currentUser?.hasRequestedFollow(user), hasRequestedToFollow == true {
      removePendingFollowRequest(sender)
    } else if let isFollowing = LoginManager.shared.currentUser!.follows(user), isFollowing == true {
      unfollowUser(sender)
    } else {
      requestToFollowUser(sender)
    }
  }
  
  func requestToFollowUser(_ headerTableViewCell: ProfileHeaderTableViewCell) {
    toggleLoadingView(hidden: false)
    UserService.requestToFollow(user: user, success: { [weak self] () in
      guard let strongSelf = self else {
        return
      }
      
      LoginManager.shared.currentUser?.followRequests?.append(strongSelf.user)
      strongSelf.toggleLoadingView(hidden: true, newRightBarButtonItem: strongSelf.infoButton) {
        DispatchQueue.main.async {
          headerTableViewCell.toggleInteractionButton(enabled: true, withTitle: "Remove follow request")
        }
      }
    }, failure: { [weak self] (requestToFollowError: NSError) in
      guard let strongSelf = self else {
        return
      }
      
      debugPrint("Error while trying to follow user", requestToFollowError)
      let alert = UIAlertController(title: "Error", message: "Unable to request to follow that user. Please try again later.", preferredStyle: .alert, color: .salmon, addDefaultAction: true)
      DispatchQueue.main.async {
        strongSelf.present(alert, animated: true) {
          strongSelf.toggleLoadingView(hidden: true, newRightBarButtonItem: strongSelf.infoButton)
        }
      }
    })
  }
  
  func removePendingFollowRequest(_ headerTableViewCell: ProfileHeaderTableViewCell) {
    toggleLoadingView(hidden: false)
    UserService.removePendingFollowRequest(toUser: self.user, success: { [weak self] () in
      guard let strongSelf = self else {
        return
      }
      
      strongSelf.dropps = []
      strongSelf.filteredDropps = []
      strongSelf.toggleNotFollowingLabel(visible: true)
      strongSelf.toggleLoadingView(hidden: true) {
        strongSelf.updateInteractionButton(enabled: true, withTitle: "Follow")
      }
    }, failure: { [weak self] (removeFollowRequestError: NSError) in
      guard let strongSelf = self else {
        return
      }
      
      debugPrint("Error while removing pending follow request", removeFollowRequestError)
      let errorAlert = UIAlertController(title: "Error", message: "Unable to remove follow request at this time. Please try again later.", preferredStyle: .alert, color: .salmon, addDefaultAction: true)
      DispatchQueue.main.async {
        strongSelf.present(errorAlert, animated: true) { () in
          strongSelf.toggleLoadingView(hidden: true, newRightBarButtonItem: strongSelf.infoButton)
        }
      }
    })
  }
  
  func unfollowUser(_ headerTableViewCell: ProfileHeaderTableViewCell) {
    headerTableViewCell.toggleInteractionButton(enabled: false)
    UserService.unfollow(user, success: { [weak self] () in
      guard let strongSelf = self else {
        return
      }
      
      LoginManager.shared.currentUser?.removeFollow(strongSelf.user)
      strongSelf.user.removeFollower(LoginManager.shared.currentUser!)
      strongSelf.dropps = []
      strongSelf.filteredDropps = []
      strongSelf.toggleNotFollowingLabel(visible: true)
      strongSelf.updateInteractionButton(enabled: true, withTitle: "Follow") {
        strongSelf.tableView.reloadData()
      }
    }, failure: { [weak self] (unfollowError: NSError) in
      guard let strongSelf = self else {
        return
      }
      
      debugPrint("Error while trying to unfollow user", unfollowError)
      let alert = UIAlertController(title: "Error", message: "Unable to unfollow that user. Please try again later.", preferredStyle: .alert, color: .salmon, addDefaultAction: true)
      DispatchQueue.main.async {
        strongSelf.present(alert, animated: true) {
          headerTableViewCell.toggleInteractionButton(enabled: true)
        }
      }
    })
  }
}
