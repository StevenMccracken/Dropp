//
//  ConnectionsViewController.swift
//  Dropp
//
//  Created by Steven McCracken on 1/9/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import UIKit

enum UserConnectionType {
  case follower
  case following
}

class ConnectionsViewController: UITableViewController {
  
  var user: User!
  var connectionType: UserConnectionType!
  weak var profileViewDelegate: ProfileViewDelegate?
  
  // MARK: Data sources
  private var connections = [User]()
  private var filteredConnections = [User]()
  
  private var searchController: UISearchController!
  private var isFiltering: Bool {
    return searchController.isActive && !((searchController.searchBar.text ?? "").isEmpty)
  }
  
  private var placeholderMessage: String {
    return "Search \(connections.count) user\(connections.count == 1 ? "" : "s")"
  }
  
  override func viewDidLoad() {
    super.viewDidLoad()
    connections = (connectionType == .following ? user.following : user.followers) ?? []
    
    // Configure navigation bar
    navigationItem.largeTitleDisplayMode = .never
    title = connectionType == .following ? "Following" : "Followers"
    
    // Configure search
    definesPresentationContext = true
    searchController = UISearchController(searchResultsController: nil)
    searchController.searchBar.delegate = self
    searchController.searchResultsUpdater = self
    searchController.searchBar.tintColor = .salmon
    searchController.searchBar.placeholder = placeholderMessage
    searchController.obscuresBackgroundDuringPresentation = false
    navigationItem.searchController = searchController
  }
  
  // MARK: - Table view data source
  
  override func numberOfSections(in tableView: UITableView) -> Int {
    return 1
  }
  
  override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    return isFiltering ? filteredConnections.count : connections.count
  }
  
  override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    guard let cell = tableView.dequeueReusableCell(withIdentifier: ConnectionTableViewCell.identifier, for: indexPath) as? ConnectionTableViewCell else {
      return UITableViewCell()
    }
    
    let user = isFiltering ? filteredConnections[indexPath.row] : connections[indexPath.row]
    cell.addContent(user)
    if LoginManager.shared.isCurrentUser(user) {
      cell.accessoryType = .none
      cell.selectionStyle = .none
      cell.isUserInteractionEnabled = false
    } else {
      cell.selectionStyle = .default
      cell.isUserInteractionEnabled = true
      cell.accessoryType = .disclosureIndicator
    }
    
    return cell
  }
  
  override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
    performSegue(withIdentifier: Constants.showProfileSegueId, sender: self)
  }
  
  // MARK: - Navigation
  override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
    guard segue.identifier == Constants.showProfileSegueId else {
      return
    }
    
    guard let indexPath = tableView.indexPathForSelectedRow else {
      return
    }
    
    guard let destination = segue.destination as? ProfileViewController else {
      return
    }
    
    destination.profileViewDelegate = self
    destination.user = isFiltering ? filteredConnections[indexPath.row] : connections[indexPath.row]
  }
}

extension ConnectionsViewController: UISearchBarDelegate {
  
  func searchBar(_ searchBar: UISearchBar, textDidChange searchText: String) {
    guard !searchText.trim().isEmpty else {
      return
    }
    
    filterContent(searchText)
  }
}

extension ConnectionsViewController: UISearchResultsUpdating {
  
  func updateSearchResults(for searchController: UISearchController) {
    filterContent(searchController.searchBar.text!)
  }
  
  func filterContent(_ filter: String) {
    filteredConnections = connections.filter {
      return $0.username.contains(filter, options: .caseInsensitive)
    }
    
    tableView.reloadData()
  }
}

extension ConnectionsViewController: ProfileViewDelegate {
  
  func didUnfollowUser(_ user: User) {
    profileViewDelegate?.didUnfollowUser(user)
    var potentialUser: User?
    if LoginManager.shared.isCurrentUser(self.user) && connectionType == .following {
      potentialUser = user
    } else if user == self.user && connectionType == .follower {
      potentialUser = LoginManager.shared.currentUser
    }
    
    guard let userToRemove = potentialUser else {
      return
    }
    
    var shouldReloadData = false
    if let index = connections.index(of: userToRemove) {
      connections.remove(at: index)
      shouldReloadData = true
    }
    
    if isFiltering, let index = filteredConnections.index(of: userToRemove) {
      filteredConnections.remove(at: index)
      shouldReloadData = true
    }
    
    if shouldReloadData {
      tableView.reloadData()
      searchController.searchBar.placeholder = placeholderMessage
    }
  }
}
