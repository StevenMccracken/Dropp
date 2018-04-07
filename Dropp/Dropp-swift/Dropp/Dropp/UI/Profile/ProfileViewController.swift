//
//  ProfileViewController.swift
//  Dropp
//
//  Created by Steven McCracken on 1/6/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import UIKit

protocol ProfileViewDelegate: class {
  func didUnfollowUser(_ user: User)
}

class ProfileViewController: UIViewController {
  
  // MARK: IBOutlets
  @IBOutlet weak var tableView: UITableView!
  @IBOutlet weak var profileHeaderView: ProfileHeaderView!
  @IBOutlet weak var toolbar: UIToolbar!
  @IBOutlet weak var toolbarHeight: NSLayoutConstraint!
  
  // MARK: Data sources
  var user: User!
  private var dropps = [Dropp]()
  weak var profileViewDelegate: ProfileViewDelegate?
  private var sortingType: DroppFeedSortingType = .chronological
  
  // MARK: State members
  private var isFetchingDropps = false
  private var isFetchingUserInfo = false
  private var currentUserUpdatedEventHandler: Disposable?
  
  // MARK: Buttons
  private lazy var sortButton = UIBarButtonItem(title: "Sort", style: .plain, target: self, action: #selector(didTapSortButton(_:)))
  private lazy var infoButton: UIBarButtonItem = {
    let button = UIButton(type: .detailDisclosure)
    button.addTarget(self, action: #selector(didTapInfoButton(_:)), for: .touchUpInside)
    return UIBarButtonItem(customView: button)
  }()
  
  // MARK: Table view subviews
  private lazy var fetchFailedLabel = UILabel("\nUnable to get dropps😢", forTableView: tableView, fontSize: 20)
  private lazy var noDroppsPostedLabel = UILabel("\nNo dropps posted😒", forTableView: tableView, fontSize: 20)
  private lazy var notFollowingLabel = UILabel("\nFollow this user to see all of their dropps🔑", forTableView: tableView, fontSize: 20)
  private lazy var followRequestSentLabel = UILabel("\nFollow request sent👌🏽", forTableView: tableView, fontSize: 20)
  private lazy var refreshIndicator: UIRefreshControl = {
    let refreshControl = UIRefreshControl()
    refreshControl.tintColor = .salmon
    refreshControl.addTarget(self, action: #selector(didPullTableViewToRefresh), for: .valueChanged)
    return refreshControl
  }()
  
  // MARK: Toolbar items
  private lazy var followButton = UIBarButtonItem(title: "Follow", style: .plain, target: self, action: #selector(didTapFollowButton(_:)))
  private lazy var unfollowButton = UIBarButtonItem(title: "Unfollow", style: .plain, target: self, action: #selector(didTapUnfollowButton(_:)))
  private lazy var removeFollowRequestButton = UIBarButtonItem(title: "Remove follow request", style: .plain, target: self, action: #selector(didTapRemoveFollowRequestButton(_:)))
  private lazy var toolbarActivityIndicator = UIActivityIndicatorView(activityIndicatorStyle: .gray)
  private var toolbarActivityIndicatorBarButton: UIBarButtonItem {
    toolbarActivityIndicator.startAnimating()
    return UIBarButtonItem(customView: toolbarActivityIndicator)
  }
  
  // MARK: View lifecycle
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    // Configure navigation bar
    sortButton.isEnabled = false
    if LoginManager.shared.isCurrentUser(user) {
      toolbarHeight.constant = 0
      navigationItem.leftBarButtonItem = sortButton
      navigationItem.rightBarButtonItem = infoButton
      navigationItem.largeTitleDisplayMode = .automatic
      currentUserUpdatedEventHandler = LoginManager.shared.currentUserUpdatedEvent.addHandler(target: self, handler: ProfileViewController.updateUserProfile)
    } else {
      title = "\(user.username)"
      navigationItem.largeTitleDisplayMode = .never
      updateToolbar(withItem: toolbarActivityIndicatorBarButton)
    }
    
    // Configure table view
    tableView.delegate = self
    tableView.dataSource = self
    tableView.isScrollEnabled = false
    profileHeaderView.delegate = self
    tableView.refreshControl = refreshIndicator
    tableView.register(nibAndReuseIdentifier: DroppTableViewCell.identifier)
    
    // Fetch data
    let group = DispatchGroup()
    group.enter()
    fetchUserInfo {
      group.leave()
    }
    
    group.enter()
    fetchUserDropps {
      group.leave()
    }
    
    group.notify(queue: .main) { [weak self] in
      self?.tableView?.isScrollEnabled = true
    }
  }
  
  override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    if let indexPath = tableView.indexPathForSelectedRow {
      tableView.deselectRow(at: indexPath, animated: true)
    }
  }
  
  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    if LoginManager.shared.isCurrentUser(user) && currentUserUpdatedEventHandler == nil {
      currentUserUpdatedEventHandler = LoginManager.shared.currentUserUpdatedEvent.addHandler(target: self, handler: ProfileViewController.updateUserProfile)
    }
  }
  
  override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
    isFetchingDropps = false
    tableView.refreshControl?.endRefreshing()
    currentUserUpdatedEventHandler?.dispose()
    currentUserUpdatedEventHandler = nil
  }
  
  // MARK: Event handlers
  
  private func updateUserProfile(newUser: User) {
    user = newUser
    DispatchQueue.main.async {
      self.profileHeaderView.updateFollowers(newUser.followers)
      self.profileHeaderView.updateFollowing(newUser.following)
    }
  }
  
  @objc
  private func didPullTableViewToRefresh() {
    let group = DispatchGroup()
    group.enter()
    fetchUserDropps {
      group.leave()
    }
    
    group.enter()
    fetchUserInfo {
      group.leave()
    }
    
    group.notify(queue: .main) { [weak self] in
      self?.tableView?.refreshControl?.endRefreshing()
    }
  }
  
  // MARK: Button actions
  
  @objc
  private func didTapInfoButton(_ sender: UIButton) {
    performSegue(withIdentifier: Constants.showProfileDetailsSegueId, sender: sender)
  }
  
  @objc
  private func didTapFollowButton(_ sender: UIBarButtonItem) {
    updateToolbar(withItem: toolbarActivityIndicatorBarButton)
    requestToFollowUser()
  }
  
  @objc
  private func didTapUnfollowButton(_ sender: UIBarButtonItem) {
    let alert = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet, color: .salmon)
    if Utils.isPad {
      let popover = alert.popoverPresentationController
      popover?.permittedArrowDirections = .up
      popover?.barButtonItem = sender
    }
    
    alert.addAction(UIAlertAction(title: sender.title ?? "", style: .destructive) { _ in
      self.updateToolbar(withItem: self.toolbarActivityIndicatorBarButton)
      self.unfollowUser()
    })
    
    alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
    present(alert, animated: true)
  }
  
  @objc
  private func didTapRemoveFollowRequestButton(_ sender: UIBarButtonItem) {
    let alert = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet, color: .salmon)
    if Utils.isPad {
      let popover = alert.popoverPresentationController
      popover?.permittedArrowDirections = .up
      popover?.barButtonItem = sender
    }
    
    alert.addAction(UIAlertAction(title: sender.title ?? "", style: .destructive) { _ in
      self.updateToolbar(withItem: self.toolbarActivityIndicatorBarButton)
      self.removePendingFollowRequest()
    })
    
    alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
    present(alert, animated: true)
  }
  
  @objc
  private func didTapSortButton(_ sender: UIBarButtonItem) {
    let alert = UIAlertController(title: nil, message: "Sort By", preferredStyle: .actionSheet, color: .salmon)
    if Utils.isPad {
      let popover = alert.popoverPresentationController
      popover?.permittedArrowDirections = .up
      popover?.barButtonItem = sender
    }
    
    let closestTitle = "Closest\(sortingType == .closest ? " ✓" : "")"
    alert.addAction(UIAlertAction(title: closestTitle, style: .default) { _ in
      guard self.sortingType != .closest else {
        return
      }
      
      if let location = LocationManager.shared.currentLocation {
        self.sortingType = .closest
        self.dropps = Dropp.sort(self.dropps, by: .closest, currentLocation: location)
        self.tableView.reloadData()
      }
      
    })
    
    let farthestTitle = "Farthest\(sortingType == .farthest ? " ✓" : "")"
    alert.addAction(UIAlertAction(title: farthestTitle, style: .default) { _ in
      guard self.sortingType != .farthest else {
        return
      }
      
      if let location = LocationManager.shared.currentLocation {
        self.sortingType = .farthest
        self.dropps = Dropp.sort(self.dropps, by: .farthest, currentLocation: location)
        self.tableView.reloadData()
      }
    })
    
    let newestTitle = "Newest\(sortingType == .chronological ? " ✓" : "")"
    alert.addAction(UIAlertAction(title: newestTitle, style: .default) { _ in
      guard self.sortingType != .chronological else {
        return
      }
      
      self.sortingType = .chronological
      self.dropps = Dropp.sort(self.dropps, by: .chronological)
      self.tableView.reloadData()
    })
    
    let oldestTitle = "Oldest\(sortingType == .reverseChronological ? " ✓" : "")"
    alert.addAction(UIAlertAction(title: oldestTitle, style: .default) { _ in
      guard self.sortingType != .reverseChronological else {
        return
      }
      
      self.sortingType = .reverseChronological
      self.dropps = Dropp.sort(self.dropps, by: .reverseChronological)
      self.tableView.reloadData()
    })
    
    alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
    present(alert, animated: true, completion: nil)
  }
  
  // MARK: Data accessors
  
  private func fetchUserInfo(_ completion: (() -> Void)? = nil) {
    guard !isFetchingUserInfo else {
      return
    }
    
    isFetchingUserInfo = true
    UserService.getUser(username: user.username, success: { [weak self] (updatedUser) in
      guard let strongSelf = self else {
        return
      }
      
      if LoginManager.shared.isCurrentUser(strongSelf.user) {
        LoginManager.shared.updateCurrentUser(with: updatedUser)
        strongSelf.isFetchingUserInfo = false
        completion?()
      } else {
        strongSelf.updateUserProfile(newUser: updatedUser)
        DispatchQueue.main.async {
          if let doesFollowUser = LoginManager.shared.currentUser?.follows(updatedUser),
             doesFollowUser == true {
            strongSelf.updateToolbar(withItem: strongSelf.unfollowButton)
          } else if let hasRequestedFollow = LoginManager.shared.currentUser?.hasRequestedFollow(updatedUser),
                    hasRequestedFollow == true {
            strongSelf.updateToolbar(withItem: strongSelf.removeFollowRequestButton)
            strongSelf.toggleFollowRequestSentLabel(visible: true)
          } else {
            strongSelf.toggleNotFollowingLabel(visible: true)
            strongSelf.updateToolbar(withItem: strongSelf.followButton)
          }
          
          strongSelf.isFetchingUserInfo = false
          completion?()
        }
      }
      
      DispatchQueue.main.async {
        strongSelf.updatePrompt()
      }
    }) { [weak self] (getUserError) in
      guard let strongSelf = self else {
        return
      }
      
      debugPrint("Failed to get updated user profile", getUserError)
      strongSelf.isFetchingUserInfo = false
      completion?()
    }
  }
  
  private func fetchUserDropps(_ completion: (() -> Void)? = nil) {
    guard !isFetchingDropps else {
      return
    }
    
    isFetchingDropps = true
    DroppService.getDropps(forUser: user, success: { [weak self] (dropps) in
      guard let strongSelf = self else {
        return
      }
      
      debugPrint("Got \(dropps.count) dropps posted by the user")
      let sortedDropps = Dropp.sort(dropps, by: strongSelf.sortingType, currentLocation: LocationManager.shared.currentLocation)
      DispatchQueue.main.async {
        strongSelf.updateTableView(sortedDropps)
        strongSelf.sortButton.isEnabled = !sortedDropps.isEmpty
        strongSelf.toggleNoDroppsPostedLabel(visible: sortedDropps.isEmpty)
        strongSelf.isFetchingDropps = false
        completion?()
      }
    }) { [weak self] (getDroppsError) in
      guard let strongSelf = self else {
        return
      }
      
      debugPrint("Failed to get user's dropps", getDroppsError)
      if getDroppsError.code != 403 && strongSelf.dropps.isEmpty {
        strongSelf.toggleFetchFailedLabel(visible: true)
      }
      
      DispatchQueue.main.async {
        strongSelf.sortButton.isEnabled = getDroppsError.code != 403 && !strongSelf.dropps.isEmpty
        strongSelf.isFetchingDropps = false
        completion?()
      }
    }
  }
  
  // MARK: UI updating functions
  
  private func updateToolbar(withItem item: UIBarButtonItem) {
    toolbar.setItems([.flexibleSpace, item, .flexibleSpace], animated: true)
  }
  
  private func updateTableView(_ dropps: [Dropp]) {
    self.dropps = dropps
    tableView.reloadData()
  }
  
  private func enableNotFollowingState() {
    updateTableView([])
    updateToolbar(withItem: followButton)
    toggleNotFollowingLabel(visible: true)
    profileHeaderView.updateFollowers(user.followers)
    profileHeaderView.updateFollowing(user.following)
  }
  
  private func toggleFetchFailedLabel(visible: Bool) {
    DispatchQueue.main.async {
      self.toggleTableViewLabel(self.fetchFailedLabel, visible: visible)
    }
  }
  
  private func toggleNoDroppsPostedLabel(visible: Bool) {
    DispatchQueue.main.async {
      self.toggleTableViewLabel(self.noDroppsPostedLabel, visible: visible)
    }
  }
  
  private func toggleNotFollowingLabel(visible: Bool) {
    DispatchQueue.main.async {
      self.toggleTableViewLabel(self.notFollowingLabel, visible: visible)
    }
  }
  
  private func toggleFollowRequestSentLabel(visible: Bool) {
    DispatchQueue.main.async {
      self.toggleTableViewLabel(self.followRequestSentLabel, visible: visible)
    }
  }
  
  private func toggleTableViewLabel(_ label: UILabel, visible: Bool) {
    if visible {
      tableView.separatorStyle = .none
      tableView.backgroundView = label
      profileHeaderView.toggleFooterView(visible: false)
    } else {
      tableView.backgroundView = nil
      tableView.separatorStyle = .singleLine
      profileHeaderView.toggleFooterView(visible: true)
    }
  }
  
  private func updatePrompt() {
    let requests = LoginManager.shared.currentUser?.followerRequests ?? []
    guard requests.contains(user) else {
      return
    }
    
    navigationItem.prompt = "\(user.username) has requested to follow you"
  }
  
  // MARK: Navigation
   
  override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
    if segue.identifier == Constants.showDroppDetailSegueId,
       let indexPath = sender as? IndexPath,
       let detailViewController = segue.destination as? DroppDetailViewController {
      detailViewController.dropp = dropps[indexPath.section]
      detailViewController.feedViewControllerDelegate = self
    } else if segue.identifier == Constants.showProfileDetailsSegueId,
              let profileDetailsViewController = segue.destination as? ProfileDetailsViewController {
      profileDetailsViewController.user = user
    } else if segue.identifier == Constants.showConnectionsSegueId,
              let connectionsViewController = segue.destination as? ConnectionsViewController {
      connectionsViewController.user = user
      connectionsViewController.profileViewDelegate = self
      if let connectionType = sender as? UserConnectionType {
        connectionsViewController.connectionType = connectionType
      }
    }
  }
}

// MARK: UITableViewDataSource
extension ProfileViewController: UITableViewDataSource {
  
  func numberOfSections(in tableView: UITableView) -> Int {
    return dropps.count
  }
  
  func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    return 1
  }
  
  func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    var cell: UITableViewCell
    if let droppCell = tableView.dequeueReusableCell(withIdentifier: DroppTableViewCell.identifier, for: indexPath) as? DroppTableViewCell {
      let dropp = dropps[indexPath.section]
      droppCell.addContent(from: dropp)
      cell = droppCell
    } else {
      cell = UITableViewCell()
    }
    
    return cell
  }
}

// MARK: UITableViewDelegate
extension ProfileViewController: UITableViewDelegate {
  
  func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
    performSegue(withIdentifier: Constants.showDroppDetailSegueId, sender: indexPath)
  }
}

// MARK: FeedViewControllerDelegate
extension ProfileViewController: FeedViewControllerDelegate {
  
  func shouldRefreshData() {
    fetchUserDropps()
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
      self.tableView.scrollToRow(at: IndexPath(row: 0, section: index), at: scrollPosition, animated: true)
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

// MARK: ProfileHeaderViewDelegate
extension ProfileViewController: ProfileHeaderViewDelegate {
  
  func didTapFollowersButton(_ sender: UIButton) {
    performSegue(withIdentifier: Constants.showConnectionsSegueId, sender: UserConnectionType.follower)
  }
  
  func didTapFollowingButton(_ sender: UIButton) {
    performSegue(withIdentifier: Constants.showConnectionsSegueId, sender: UserConnectionType.following)
  }
}

// MARK: ProfileViewDelegate
extension ProfileViewController: ProfileViewDelegate {
  
  func didUnfollowUser(_ user: User) {
    profileViewDelegate?.didUnfollowUser(user)
    if LoginManager.shared.isCurrentUser(self.user) {
      profileHeaderView.updateFollowing(self.user.following)
    } else if user == self.user {
      enableNotFollowingState()
    }
  }
}

// MARK: Connection server interaction
extension ProfileViewController {
  
  private func requestToFollowUser() {
    UserService.requestToFollow(user: user, success: { [weak self] in
      guard let strongSelf = self else {
        return
      }
      
      LoginManager.shared.currentUser?.followRequests?.append(strongSelf.user)
      DispatchQueue.main.async {
        strongSelf.toggleFollowRequestSentLabel(visible: true)
        strongSelf.updateToolbar(withItem: strongSelf.removeFollowRequestButton)
      }
    }) { [weak self] (requestToFollowError) in
      guard let strongSelf = self else {
        return
      }
      
      debugPrint("Error while trying to follow user", requestToFollowError)
      let alert = UIAlertController(title: "Error", message: "Unable to send your follow request. Please try again later.", preferredStyle: .alert, color: .salmon, addDefaultAction: true)
      DispatchQueue.main.async {
        strongSelf.present(alert, animated: true) {
          strongSelf.updateToolbar(withItem: strongSelf.followButton)
        }
      }
    }
  }
  
  private func removePendingFollowRequest() {
    UserService.removePendingFollowRequest(toUser: user, success: { [weak self] in
      guard let strongSelf = self else {
        return
      }
      
      LoginManager.shared.currentUser?.removeFollowRequest(toUser: strongSelf.user)
      DispatchQueue.main.async {
        strongSelf.toggleNotFollowingLabel(visible: true)
        strongSelf.updateToolbar(withItem: strongSelf.followButton)
      }
    }) { [weak self] (removeFollowRequestError) in
      guard let strongSelf = self else {
        return
      }
      
      debugPrint("Error while removing pending follow request", removeFollowRequestError)
      let errorAlert = UIAlertController(title: "Error", message: "Unable to remove your follow request. Please try again later.", preferredStyle: .alert, color: .salmon, addDefaultAction: true)
      DispatchQueue.main.async {
        strongSelf.present(errorAlert, animated: true) {
          strongSelf.updateToolbar(withItem: strongSelf.removeFollowRequestButton)
        }
      }
    }
  }
  
  private func unfollowUser() {
    UserService.unfollow(user, success: { [weak self] in
      guard let strongSelf = self else {
        return
      }
      
      LoginManager.shared.currentUser?.removeFollow(strongSelf.user)
      if let currentUser = LoginManager.shared.currentUser {
        strongSelf.user.removeFollower(currentUser)
      }
      
      DispatchQueue.main.async {
        strongSelf.enableNotFollowingState()
        strongSelf.profileViewDelegate?.didUnfollowUser(strongSelf.user)
      }
    }) { [weak self] (unfollowError) in
      guard let strongSelf = self else {
        return
      }
      
      debugPrint("Error while trying to unfollow user", unfollowError)
      let alert = UIAlertController(title: "Error", message: "Unable to send your unfollow request. Please try again later.", preferredStyle: .alert, color: .salmon, addDefaultAction: true)
      DispatchQueue.main.async {
        strongSelf.present(alert, animated: true) {
          strongSelf.updateToolbar(withItem: strongSelf.unfollowButton)
        }
      }
    }
  }
}
