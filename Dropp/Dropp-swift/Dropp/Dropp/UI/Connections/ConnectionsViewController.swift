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
  private var filteredConnections = [User]()
  private var connections: [User]? {
    return connectionType == .following ? user.following : user.followers
  }
  
  private var searchController: UISearchController!
  private var isFiltering: Bool {
    return searchController.isActive && !((searchController.searchBar.text ?? "").isEmpty)
  }
  
  override func viewDidLoad() {
    super.viewDidLoad()
    title = connectionType == .following ? "Following" : "Followers"
    navigationItem.largeTitleDisplayMode = .never
    
    searchController = UISearchController(searchResultsController: nil)
    searchController.searchResultsUpdater = self
    searchController.obscuresBackgroundDuringPresentation = false
    searchController.searchBar.placeholder = "Search"
    searchController.searchBar.tintColor = .salmon
    searchController.searchBar.delegate = self
    navigationItem.searchController = searchController
    definesPresentationContext = true
  }
  
  // MARK: - Table view data source
  
  override func numberOfSections(in tableView: UITableView) -> Int {
    return 1
  }
  
  override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    let connections: [User] = self.connections ?? []
    return isFiltering ? filteredConnections.count : connections.count
  }
  
  override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    guard let cell = tableView.dequeueReusableCell(withIdentifier: ConnectionTableViewCell.identifier, for: indexPath) as? ConnectionTableViewCell else {
      return UITableViewCell()
    }
    
    let user = isFiltering ? filteredConnections[indexPath.row] : connections![indexPath.row]
    cell.addContent(user)
    cell.isUserInteractionEnabled = !user.isCurrentUser
    if user.isCurrentUser {
      cell.accessoryType = .none
      cell.selectionStyle = .none
    } else {
      cell.selectionStyle = .default
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
    
    destination.user = isFiltering ? filteredConnections[indexPath.row] : connections![indexPath.row]
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
    let connections: [User] = self.connections ?? []
    filteredConnections = connections.filter {
      return $0.username.contains(filter, options: .caseInsensitive)
    }
    
    tableView.reloadData()
  }
}
