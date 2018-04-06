//
//  ProfileViewController.swift
//  Dropp
//
//  Created by Steven McCracken on 1/6/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import UIKit

class ProfileViewController: UITableViewController {
  
  // MARK: IBOutlets
  @IBOutlet weak var profileHeaderView: ProfileHeaderView!
  
  // MARK: Data sources
  var user: User!
  private var dropps = [Dropp]()
  private var currentUserUpdatedEventHandler: Disposable?
  
  private var sortingType: DroppFeedSortingType = .chronological
  private var isRefreshing = false
  
  // MARK: Buttons
  
  private lazy var sortButton = UIBarButtonItem(title: "Sort", style: .plain, target: self, action: #selector(didTapSortButton))
  private lazy var infoButton: UIBarButtonItem = {
    let button = UIButton(type: .detailDisclosure)
    button.addTarget(self, action: #selector(didTapInfoButton), for: .touchUpInside)
    return UIBarButtonItem(customView: button)
  }()
  
  // MARK: Table view labels
  private lazy var fetchFailedLabel = UILabel("\nUnable to get dropps😢", forTableView: tableView, fontSize: 30)
  private lazy var noDroppsPostedLabel = UILabel("\nNo dropps posted😒", forTableView: tableView, fontSize: 30)
  private lazy var notFollowingLabel = UILabel("\nFollow this user to see all of their dropps🔑", forTableView: tableView, fontSize: 25)
  private lazy var followRequestSentLabel = UILabel("\nFollow request sent👌🏽", forTableView: tableView, fontSize: 30)
  
  override func viewDidLoad() {
    super.viewDidLoad()
    if LoginManager.shared.isCurrentUser(user) {
      navigationItem.leftBarButtonItem = sortButton
      navigationItem.rightBarButtonItem = infoButton
      navigationItem.largeTitleDisplayMode = .automatic
    } else {
      title = "\(user.username)"
      navigationItem.largeTitleDisplayMode = .never
    }
    
    profileHeaderView.delegate = self
    profileHeaderView.toggleInteractionButton(visible: false)
    tableView.register(nibAndReuseIdentifier: DroppTableViewCell.identifier)
    
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
    if LoginManager.shared.isCurrentUser(user) {
      currentUserUpdatedEventHandler = LoginManager.shared.currentUserUpdatedEvent.addHandler(target: self, handler: ProfileViewController.updateUserProfile)
    }
  }
  
  override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
    isRefreshing = false
    self.refreshControl?.endRefreshing()
    currentUserUpdatedEventHandler?.dispose()
  }
  
  private func updateUserProfile(newUser: User) {
    user = newUser
    DispatchQueue.main.async {
      self.profileHeaderView.updateFollowers(newUser.followers)
      self.profileHeaderView.updateFollowing(newUser.following)
    }
  }
  
  @objc
  func didTapInfoButton() {
    if LoginManager.shared.isCurrentUser(user) {
      let profileDetailsStoryboard = UIStoryboard(name: "ProfileDetails", bundle: nil)
      guard let profileDetailsViewController = profileDetailsStoryboard.instantiateInitialViewController() as? ProfileDetailsViewController else {
        debugPrint("Initial view controller for ProfileDetails was invalid")
        return
      }
      
      profileDetailsViewController.user = user
      navigationController?.pushViewController(profileDetailsViewController, animated: true)
    } else {
      let alert = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet, color: .salmon)
      if Utils.isPad {
        let popover = alert.popoverPresentationController
        popover?.permittedArrowDirections = .up
        popover?.barButtonItem = infoButton
      }
      
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
      
      alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
      present(alert, animated: true)
    }
  }
  
  func getDropps(_ done: (() -> Void)? = nil) {
    guard !isRefreshing else {
      return
    }
    
    let completion = {
      self.isRefreshing = false
      done?()
    }
    
    isRefreshing = true
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
      self.dropps.removeAll()
      if originalCount > 0 {
        let deleteSet = IndexSet(integersIn: 0 ..< originalCount)
        self.tableView.deleteSections(deleteSet, with: .fade)
      }
      
      self.dropps.append(contentsOf: dropps)
      let insertSet = IndexSet(integersIn: 0 ..< self.dropps.count)
      self.tableView.insertSections(insertSet, with: .fade)
      done?()
    }
  }
  
  @objc
  func didTapSortButton() {
    let alert = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet, color: .salmon)
    let closestTitle = "Closest\(sortingType == .closest ? " ✓" : "")"
    alert.addAction(UIAlertAction(title: closestTitle, style: .default, handler: { _ in
      guard self.sortingType != .closest else {
        return
      }
      
      if let location = LocationManager.shared.currentLocation {
        self.sortingType = .closest
        self.dropps = Dropp.sort(self.dropps, by: .closest, currentLocation: location)
        self.tableView.reloadData()
      }
      
    }))
    
    let farthestTitle = "Farthest\(sortingType == .farthest ? " ✓" : "")"
    alert.addAction(UIAlertAction(title: farthestTitle, style: .default, handler: { _ in
      guard self.sortingType != .farthest else {
        return
      }
      
      if let location = LocationManager.shared.currentLocation {
        self.sortingType = .farthest
        self.dropps = Dropp.sort(self.dropps, by: .farthest, currentLocation: location)
        self.tableView.reloadData()
      }
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
    if Utils.isPad {
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
      
      if LoginManager.shared.isCurrentUser(strongSelf.user) {
        LoginManager.shared.updateCurrentUser(with: updatedUser)
      } else {
        strongSelf.updateUserProfile(newUser: updatedUser)
        DispatchQueue.main.async {
          if let doesFollowUser = LoginManager.shared.currentUser?.follows(updatedUser), doesFollowUser == true {
            strongSelf.profileHeaderView.toggleInteractionButton(enabled: true, withTitle: "Unfollow")
          } else if let hasRequestedFollow = LoginManager.shared.currentUser?.hasRequestedFollow(updatedUser), hasRequestedFollow == true {
            strongSelf.profileHeaderView.toggleInteractionButton(enabled: false, withTitle: "Request pending")
          }
          
          strongSelf.profileHeaderView.toggleInteractionButton(visible: true)
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
    return dropps.count
  }
  
  override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    return 1
  }
  
  override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    var cell: UITableViewCell
    if indexPath.section == 2 {
      cell = UITableViewCell()
//      let headerCell = tableView.dequeueReusableCell(withIdentifier: ProfileHeaderTableViewCell.identifier, for: indexPath) as! ProfileHeaderTableViewCell
//      if let followersCount = user.followers?.count {
//        headerCell.updateFollowers(followersCount)
//        headerCell.toggleFollowersButton(enabled: followersCount > 0)
//      } else {
//        headerCell.toggleFollowersButton(enabled: false)
//      }
//
//      if let followingCount = user.following?.count {
//        headerCell.updateFollowing(followingCount)
//        headerCell.toggleFollowingButton(enabled: followingCount > 0)
//      } else {
//        headerCell.toggleFollowingButton(enabled: false)
//      }
//
//      headerCell.toggleInteractionButton(visible: !user.isCurrentUser)
//      if let _ = user.followers {
//        let following = LoginManager.shared.currentUser!.follows(user) ?? false
//        headerCell.toggleInteractionButton(enabled: true, withTitle: following ? "Unfollow" : "Follow")
//      } else {
//        headerCell.toggleInteractionButton(enabled: false, withTitle: "Loading...")
//      }
//
//      if user.isCurrentUser {
//        headerCell.setInteractionButtonHeight(0)
//      }
//
//      headerCell.delegate = self
//      cell = headerCell
    } else {
      let droppCell = tableView.dequeueReusableCell(withIdentifier: DroppTableViewCell.identifier, for: indexPath) as! DroppTableViewCell
      let dropp = dropps[indexPath.section]
      droppCell.addContent(from: dropp)
      cell = droppCell
    }
    
    return cell
  }
  
  override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
    performSegue(withIdentifier: Constants.showDroppDetailSegueId, sender: self)
  }
  
  // MARK: - Navigation
   
  override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
    guard segue.identifier == Constants.showDroppDetailSegueId else {
      return
    }
    
    guard let indexPath = tableView.indexPathForSelectedRow else {
      return
    }
    
    guard let detailViewController = segue.destination as? DroppDetailViewController else {
      return
    }
    
    detailViewController.dropp = dropps[indexPath.section]
    detailViewController.feedViewControllerDelegate = self
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
      self.profileHeaderView.toggleInteractionButton(enabled: enabled, withTitle: title)
      completion?()
    }
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
    
    let indexPath = IndexPath(row: 0, section: index)
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
        index = self.dropps.count
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
        self.toggleNoDroppsPostedLabel(visible: true)
      }
    }
  }
}

extension ProfileViewController: ProfileHeaderViewDelegate {
  
  func didTapFollowersButton(_ sender: UIButton) {
    let followersStoryboard = UIStoryboard(name: "Connections", bundle: nil)
    guard let connectionsViewController = followersStoryboard.instantiateInitialViewController() as? ConnectionsViewController else {
      debugPrint("Initial view controller for Followers storyboard was nil")
      return
    }
    
    connectionsViewController.user = user
    connectionsViewController.connectionType = .follower
    navigationController?.pushViewController(connectionsViewController, animated: true)
  }
  
  func didTapFollowingButton(_ sender: UIButton) {
    let followersStoryboard = UIStoryboard(name: "Connections", bundle: nil)
    guard let connectionsViewController = followersStoryboard.instantiateInitialViewController() as? ConnectionsViewController else {
      debugPrint("Initial view controller for Followers storyboard was nil")
      return
    }
    
    connectionsViewController.user = user
    connectionsViewController.connectionType = .following
    navigationController?.pushViewController(connectionsViewController, animated: true)
  }
  
  func didTapInteractionButton(_ sender: UIButton) {
    if let hasRequestedToFollow = LoginManager.shared.currentUser?.hasRequestedFollow(user), hasRequestedToFollow == true {
      removePendingFollowRequest()
    } else if let isFollowing = LoginManager.shared.currentUser!.follows(user), isFollowing == true {
      unfollowUser()
    } else {
      requestToFollowUser()
    }
  }
  
  func requestToFollowUser() {
    toggleLoadingView(hidden: false)
    UserService.requestToFollow(user: user, success: { [weak self] () in
      guard let strongSelf = self else {
        return
      }
      
      LoginManager.shared.currentUser?.followRequests?.append(strongSelf.user)
      strongSelf.toggleLoadingView(hidden: true, newRightBarButtonItem: strongSelf.infoButton) {
        DispatchQueue.main.async {
          strongSelf.profileHeaderView.toggleInteractionButton(enabled: true, withTitle: "Remove follow request")
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
  
  func removePendingFollowRequest() {
    toggleLoadingView(hidden: false)
    UserService.removePendingFollowRequest(toUser: self.user, success: { [weak self] () in
      guard let strongSelf = self else {
        return
      }
      
      strongSelf.dropps = []
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
  
  func unfollowUser() {
    profileHeaderView.toggleInteractionButton(enabled: false)
    UserService.unfollow(user, success: { [weak self] () in
      guard let strongSelf = self else {
        return
      }
      
      LoginManager.shared.currentUser?.removeFollow(strongSelf.user)
      strongSelf.user.removeFollower(LoginManager.shared.currentUser!)
      strongSelf.dropps = []
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
          strongSelf.profileHeaderView.toggleInteractionButton(enabled: true)
        }
      }
    })
  }
}
