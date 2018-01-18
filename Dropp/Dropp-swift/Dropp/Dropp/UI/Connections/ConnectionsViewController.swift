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
  var filteredConnections: [User] = []
  var connections: [User]? {
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
    let cell = tableView.dequeueReusableCell(withIdentifier: ConnectionTableViewCell.reuseIdentifier, for: indexPath) as! ConnectionTableViewCell
    let user = isFiltering ? filteredConnections[indexPath.row] : connections![indexPath.row]
    cell.addContent(user)
    cell.selectionStyle = user.isCurrentUser ? .none : .default
    cell.isUserInteractionEnabled = !user.isCurrentUser
    cell.accessoryType = user.isCurrentUser ? .none : .disclosureIndicator
    return cell
  }
  
  override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
    performSegue(withIdentifier: Constants.showProfileSegueId, sender: self)
  }
  
  /*
   // Override to support conditional editing of the table view.
   override func tableView(_ tableView: UITableView, canEditRowAt indexPath: IndexPath) -> Bool {
   // Return false if you do not want the specified item to be editable.
   return true
   }
   */
  
  /*
   // Override to support editing the table view.
   override func tableView(_ tableView: UITableView, commit editingStyle: UITableViewCellEditingStyle, forRowAt indexPath: IndexPath) {
   if editingStyle == .delete {
   // Delete the row from the data source
   tableView.deleteRows(at: [indexPath], with: .fade)
   } else if editingStyle == .insert {
   // Create a new instance of the appropriate class, insert it into the array, and add a new row to the table view
   }
   }
   */
  
  /*
   // Override to support rearranging the table view.
   override func tableView(_ tableView: UITableView, moveRowAt fromIndexPath: IndexPath, to: IndexPath) {
   
   }
   */
  
  /*
   // Override to support conditional rearranging of the table view.
   override func tableView(_ tableView: UITableView, canMoveRowAt indexPath: IndexPath) -> Bool {
   // Return false if you do not want the item to be re-orderable.
   return true
   }
   */
  
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
