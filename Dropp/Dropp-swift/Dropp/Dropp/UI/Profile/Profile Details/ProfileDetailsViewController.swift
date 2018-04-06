//
//  ProfileDetailsViewController.swift
//  Dropp
//
//  Created by Steven McCracken on 1/10/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import UIKit

class ProfileDetailsViewController: UITableViewController {
  
  var user: User!
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    // TODO: Add user data here and allow the current user to edit their profile attributes
    navigationItem.largeTitleDisplayMode = .never
  }
  
  // MARK: - Table view data source
  
  override func numberOfSections(in tableView: UITableView) -> Int {
    return 2
  }
  
  override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    return 1
  }
  
  override func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
    return section == 0 ? 45 : 10
  }
  
  override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    var cell: UITableViewCell
    // Check if cell is not the last section
    if indexPath.section < tableView.numberOfSections - 1 {
      let usernameCell = tableView.dequeueReusableCell(withIdentifier: ProfileDetailsUsernameTableViewCell.identifier, for: indexPath) as! ProfileDetailsUsernameTableViewCell
      usernameCell.addContent(user.username)
      cell = usernameCell
    } else {
      cell = tableView.dequeueReusableCell(withIdentifier: "LogoutTableViewCell", for: indexPath)
    }
    
    return cell
  }
  
  override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
    if indexPath.section == tableView.numberOfSections - 1 {
      let alert = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet, color: .salmon)
      if Utils.isPad,
        let cell = tableView.cellForRow(at: indexPath)
      {
        alert.popoverPresentationController?.sourceView = cell
        alert.popoverPresentationController?.sourceRect = cell.bounds
      }
      
      alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
      alert.addAction(UIAlertAction(title: "Log out", style: .destructive) { _ in
        LoginManager.shared.logout()
        self.navigationController?.dismiss(animated: true) {
          LoginManager.shared.ensureLogin()
        }
      })
      
      present(alert, animated: true)
      tableView.deselectRow(at: indexPath, animated: true)
    } else {
      tableView.deselectRow(at: indexPath, animated: true)
    }
  }
  
  override func tableView(_ tableView: UITableView, titleForHeaderInSection section: Int) -> String? {
    var title: String?
    if section == 0 {
      title = "Username"
    }
    
    return title
  }
}
