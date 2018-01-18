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
    return section == 0 ? 10 : 15
  }
  
  override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    var cell: UITableViewCell
    // Check if cell is not the last section
    if indexPath.section < tableView.numberOfSections - 1 {
      let usernameCell = tableView.dequeueReusableCell(withIdentifier: ProfileDetailsUsernameTableViewCell.reuseIdentifier, for: indexPath) as! ProfileDetailsUsernameTableViewCell
      usernameCell.addContent(user.username)
      cell = usernameCell
    } else {
      cell = tableView.dequeueReusableCell(withIdentifier: "LogoutTableViewCell", for: indexPath)
    }
    
    return cell
  }
  
  override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
    if indexPath.section == tableView.numberOfSections - 1 {
      LoginManager.shared.logout()
      navigationController?.dismiss(animated: true) {
        LoginManager.shared.ensureLogin()
      }
    } else {
      tableView.deselectRow(at: indexPath, animated: true)
    }
  }
  
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
  
  /*
   // MARK: - Navigation
   
   // In a storyboard-based application, you will often want to do a little preparation before navigation
   override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
   // Get the new view controller using segue.destinationViewController.
   // Pass the selected object to the new view controller.
   }
   */
  
}
