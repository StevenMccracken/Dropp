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
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    // Uncomment the following line to preserve selection between presentations
    // self.clearsSelectionOnViewWillAppear = false
    
    let createDroppButton = UIBarButtonItem(barButtonSystemItem: .add, target: self, action: #selector(didTapCreateDroppButton))
    let refreshDroppsButton = UIBarButtonItem(barButtonSystemItem: .refresh, target: self, action: #selector(didTapRefreshDroppsButton))
    
    navigationItem.leftBarButtonItem = refreshDroppsButton
    navigationItem.rightBarButtonItem = createDroppButton
    
    tableView.rowHeight = UITableViewAutomaticDimension
    tableView.estimatedRowHeight = 150
    
    // Do any additional setup after loading the view.
    didTapRefreshDroppsButton()
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
  func didTapRefreshDroppsButton() {
    guard !refreshing else {
      return
    }
    
    refreshing = true
    DroppService.getDropps(near: LocationManager.shared.userCoordinates, withRange: 100.0, success: { [weak self] (dropps: [Dropp]) in
      guard let strongSelf = self else {
        return
      }
      
      debugPrint("Got \(dropps.count) nearby dropps")
      strongSelf.dropps = dropps
      DispatchQueue.main.async {
        strongSelf.tableView.reloadData()
        strongSelf.refreshing = false
      }
    }, failure: { [weak self] (getDroppsError: Error) in
      guard let strongSelf = self else {
        return
      }
      
      debugPrint("Failed to get nearby dropps", getDroppsError)
      strongSelf.refreshing = false
    })
  }
  
  // MARK: - Table view data source
  
  override func numberOfSections(in tableView: UITableView) -> Int {
    return dropps.count
  }
  
  override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    return 1
  }
  
  override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    let cell = tableView.dequeueReusableCell(withIdentifier: "DroppTableViewCell", for: indexPath) as! DroppTableViewCell
    
    // Configure the cell
    let dropp = dropps[indexPath.section]
    cell.addContent(from: dropp)
    return cell
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
  
  /*
   // MARK: - Navigation
   
   // In a storyboard-based application, you will often want to do a little preparation before navigation
   override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
   // Get the new view controller using segue.destinationViewController.
   // Pass the selected object to the new view controller.
   }
   */
  
}

extension FeedViewController: PresentingViewControllerDelegate {
  
  func didDismissPresentedView(from source: UIViewController) {
    didTapRefreshDroppsButton()
  }
}
