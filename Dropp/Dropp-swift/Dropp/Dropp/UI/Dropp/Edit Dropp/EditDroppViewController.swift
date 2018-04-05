//
//  EditDroppViewController.swift
//  Dropp
//
//  Created by Steven McCracken on 4/2/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import UIKit

class EditDroppViewController: UIViewController {
  
  // MARK: IBOutlets
  @IBOutlet weak var textView: UITextView!
  @IBOutlet weak var placeholderLabel: UILabel!
  
  // MARK: Text view
  private var currentText: String {
    return textView.text.trim()
  }
  
  private var hasText: Bool {
    return !currentText.isEmpty
  }
  
  // MARK: View controller members
  var dropp: Dropp!
  private var isUpdating: Bool = false
  weak var delegate: FeedViewControllerDelegate?
  
  // MARK: Navigation bar members
  private var originalTitle: String?
  private var updateButton = UIBarButtonItem(title: "Update", style: .done, target: self, action: #selector(didTapUpdateButton(_:)))
  private lazy var editingDroppActivityIndicator: UIActivityIndicatorView = UIActivityIndicatorView(activityIndicatorStyle: .gray)
  
  // MARK: View lifecycle
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    // Configure navigation bar
    originalTitle = title
    navigationItem.hidesBackButton = true
    let cancelButton = UIBarButtonItem(title: "Cancel", style: .plain, target: self, action: #selector(didTapCancelButton))
    navigationItem.leftBarButtonItem = cancelButton
    navigationItem.rightBarButtonItem = updateButton
    
    // Configure the text view
    textView.delegate = self
    textView.layer.cornerRadius = 5
    textView.backgroundColor = UIColor(white: 0.95, alpha: 1)
    let spacing = UIBarButtonItem(barButtonSystemItem: .flexibleSpace, target: nil, action: nil)
    let clearButton = UIBarButtonItem(title: "Clear", style: .plain, target: self, action: #selector(clearTextView))
    textView.addToolbar(withItems: [spacing, clearButton])
    
    // Add initial text
    textView.text = dropp.message
    textViewDidChange(textView)
    textView.becomeFirstResponder()
  }
  
  @objc
  private func didTapCancelButton() {
    guard !isUpdating else {
      return
    }
    
//    textView.resignFirstResponder()
    navigationController?.popViewController(animated: true)
  }
  
  @objc
  private func didTapUpdateButton(_ sender: UIBarButtonItem) {
    guard !isUpdating else {
      return
    }
    
    guard currentText != dropp.message else {
      navigationController?.popViewController(animated: true)
      return
    }
    
    guard !(currentText.isEmpty && !dropp.hasMedia) else {
      let alert = UIAlertController(title: "Invalid update", message: "This dropp must have a message", preferredStyle: .alert, color: .salmon, addDefaultAction: true)
      present(alert, animated: true)
      return
    }
    
    enterUpdatingState()
    let newText = currentText
    DroppService.update(dropp, withText: newText, success: { [weak self] () in
      guard let strongSelf = self else {
        return
      }
      
      strongSelf.dropp.message = newText
      strongSelf.isUpdating = false
      DispatchQueue.main.async {
        strongSelf.delegate?.shouldRefresh(dropp: strongSelf.dropp, with: strongSelf.dropp)
        strongSelf.navigationController?.popViewController(animated: true)
      }
    }, failure: { [weak self] (updateDroppError: NSError) in
      guard let strongSelf = self else {
        return
      }
      
      let completion = {
        strongSelf.enterEditingState()
      }
      
      guard updateDroppError.code != 404 else {
        let alert = UIAlertController(title: "Error", message: "We're sorry, but this dropp no longer exists", preferredStyle: .alert, color: .salmon, addDefaultAction: true) { _ in
          strongSelf.delegate?.shouldRemoveDropp?(strongSelf.dropp)
          strongSelf.navigationController?.popToRootViewController(animated: true)
        }
        
        DispatchQueue.main.async {
          strongSelf.present(alert, animated: true, completion: completion)
        }
        
        return
      }
      
      debugPrint("Error while trying to update dropp", updateDroppError)
      let alert = UIAlertController(title: "Error", message: "We're sorry, but we were unable to update your dropp", preferredStyle: .alert, color: .salmon, addDefaultAction: true)
      DispatchQueue.main.async {
        strongSelf.present(alert, animated: true, completion: completion)
      }
    })
  }
  
  private func enterUpdatingState() {
    guard !isUpdating else {
      return
    }
    
    isUpdating = true
    title = "Updating..."
    textView.isEditable = false
    textView.isSelectable = false
    editingDroppActivityIndicator.startAnimating()
    navigationItem.leftBarButtonItem?.isEnabled = false
    navigationItem.rightBarButtonItem = UIBarButtonItem(customView: editingDroppActivityIndicator)
  }
  
  private func enterEditingState() {
    isUpdating = false
    title = originalTitle
    textView.isEditable = true
    textView.isSelectable = true
    editingDroppActivityIndicator.stopAnimating()
    navigationItem.rightBarButtonItem = updateButton
    navigationItem.leftBarButtonItem?.isEnabled = true
  }
}

extension EditDroppViewController: UITextViewDelegate {
  
  @objc
  private func clearTextView() {
    textView.text = ""
    textViewDidChange(textView)
  }
  
  func textViewDidChange(_ textView: UITextView) {
    placeholderLabel.isHidden = !textView.text.isEmpty
  }
}
