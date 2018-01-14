//
//  CreateDroppViewController.swift
//  Dropp
//
//  Created by Steven McCracken on 12/16/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import Gifu
import UIKit

class CreateDroppViewController: UIViewController {
  
  @IBOutlet weak var textView: UITextView!
  @IBOutlet weak var placeholderLabel: UILabel!
  @IBOutlet weak var addPhotoButton: UIButton!
  @IBOutlet weak var imageView: UIImageView!
  @IBOutlet weak var loadingView: UIView!
  @IBOutlet weak var activityIndicatorView: GIFImageView!
  
  weak var droppFeedViewControllerDelegate: DroppFeedViewControllerDelegate?
  var postingDropp = false
  var cameraOptionsSheet: UIAlertController!
  lazy var imagePicker: UIImagePickerController = {
    let picker = UIImagePickerController()
    picker.delegate = self
    picker.allowsEditing = false
    picker.navigationBar.tintColor = .salmon
    return picker
  }()
  
  lazy var resetDroppAlert: UIAlertController = {
    let alert = UIAlertController(title: "Reset", message: "Are you sure you want to reset everything here?", preferredStyle: .alert, color: .salmon)
    alert.addAction(UIAlertAction(title: "No", style: .cancel, handler: nil))
    alert.addAction(UIAlertAction(title: "Yes", style: .destructive, handler: { _ in
      self.resetInputs()
    }))
    
    return alert
  }()
  
  lazy var mediaSourceUnavailableAlert: UIAlertController = {
    let alert = UIAlertController(title: "Error", message: "Sorry, this device does not have that media source.", preferredStyle: .alert, color: .salmon, addDefaultAction: true)
    return alert
  }()
  
  lazy var mediaSourceIncompatibleAlert: UIAlertController = {
    let alert = UIAlertController(title: "Error", message: "Sorry, that media format is not supported at this time.", preferredStyle: .alert, color: .salmon, addDefaultAction: true)
    return alert
  }()
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    let postButton = UIBarButtonItem(title: "Share", style: .done, target: self, action: #selector(didTapPostButton(_:)))
    let cancelButton = UIBarButtonItem(title: "Cancel", style: .plain, target: self, action: #selector(didTapCancelButton))
    navigationItem.leftBarButtonItem = cancelButton
    navigationItem.rightBarButtonItem = postButton
    
    addPhotoButton.layer.cornerRadius = 5
    togglePostButton(enabled: false)
    
    // Customize the text view
    textView.delegate = self
    textView.layer.cornerRadius = 5
    textView.backgroundColor = UIColor(white: 0.95, alpha: 1)
    
    addDismissKeyboardGesture()
    addKeyboardToolbar()
    
    // Add photo alerts configuration
    configureCameraOptionsSheet(includeDeleteOption: false)
    activityIndicatorView.prepareForAnimation(withGIFNamed: Constants.activityIndicatorFileName)
  }
  
  private func configureCameraOptionsSheet(includeDeleteOption: Bool) {
    cameraOptionsSheet = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet, color: .salmon)
    let cameraOption = UIAlertAction(title: "Take Photo", style: .default, handler: { _ in
      self.presentImagePicker(for: .camera)
    })
    
    let photoLibraryOption = UIAlertAction(title: "Choose Photo", style: .default, handler: { _ in
      self.presentImagePicker(for: .photoLibrary)
    })
    
    if includeDeleteOption {
      let deleteOption = UIAlertAction(title: "Remove Photo", style: .destructive, handler: { _ in
        self.imageView.image = nil
        self.addPhotoButton.setTitle("Add photo", for: .normal)
        self.configureCameraOptionsSheet(includeDeleteOption: false)
        
        let shouldEnable = !self.textView.text.trim().isEmpty
        self.togglePostButton(enabled: shouldEnable)
        if shouldEnable {
          self.navigationItem.rightBarButtonItem?.isEnabled = true
          self.navigationItem.rightBarButtonItem?.tintColor = .salmon
        } else {
          self.navigationItem.rightBarButtonItem?.isEnabled = false
          self.navigationItem.rightBarButtonItem?.tintColor = .lightGray
        }
      })
      
      cameraOptionsSheet.addAction(deleteOption)
    }
    
    cameraOptionsSheet.addAction(cameraOption)
    cameraOptionsSheet.addAction(photoLibraryOption)
    cameraOptionsSheet.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
  }
  
  @objc
  func didTapCancelButton() {
    guard !postingDropp else {
      return
    }
    
    dismissKeyboard()
    dismiss(animated: true, completion: nil)
  }
  
  @IBAction func didTapAddPhotoButton(_ sender: Any) {
    if Utils.isPad() {
      let popover = cameraOptionsSheet.popoverPresentationController
      popover?.permittedArrowDirections = .up
      popover?.sourceView = addPhotoButton
      popover?.sourceRect = addPhotoButton.bounds
    }
    
    present(cameraOptionsSheet, animated: true, completion: nil)
  }
  
  private func presentImagePicker(for sourceType: UIImagePickerControllerSourceType) {
    guard UIImagePickerController.isSourceTypeAvailable(sourceType) else {
      present(mediaSourceUnavailableAlert, animated: true, completion: nil)
      return
    }
    
    imagePicker.sourceType = sourceType
    if sourceType == .camera {
      imagePicker.cameraCaptureMode = .photo
    } else {
      imagePicker.mediaTypes = UIImagePickerController.availableMediaTypes(for: sourceType) ?? []
      if Utils.isPad() {
        imagePicker.modalPresentationStyle = .popover
        let popover = imagePicker.popoverPresentationController
        popover?.permittedArrowDirections = .any
        popover?.sourceView = addPhotoButton
        popover?.sourceRect = addPhotoButton.bounds
      }
    }
    
    present(imagePicker, animated: true, completion: nil)
  }
  
  @IBAction func didTapPostButton(_ sender: Any) {
    guard !textView.text.trim().isEmpty || imageView.image != nil else {
      return
    }
    
    dismissKeyboard()
    toggleLoadingView(visible: true)
    togglePostButton(enabled: false)
    toggleCancelButton(enabled: false)
    let now = Date()
    let image = imageView.image
    let message = textView.text.trim()
    let location = LocationManager.shared.currentLocation
    postingDropp = true
    DroppService.createDropp(at: location, on: now, withMessage: message, hasMedia: image != nil, success: { [weak self] (droppId: String) in
      guard let strongSelf = self else {
        return
      }
      
      guard let image = image else {
        strongSelf.displayAddDroppSuccess()
        return
      }
      
      DroppService.upload(image: image, forDropp: droppId, success: { [weak self] () in
        guard let strongSelf = self else {
          return
        }
        
        strongSelf.displayAddDroppSuccess()
        Utils.save(image: image, withTimestamp: now, andLocation: location, success: nil, failure: { (error: Error?) in
          debugPrint("Failed to save posted image to user's photos", error)
        })
      }, failure: { [weak self] (addImageError: NSError) in
        guard let strongSelf = self else {
          return
        }
        
        debugPrint("Post dropp image error", addImageError)
        DroppService.delete(droppId)
        strongSelf.displayAddDroppFailure()
      })
    }, failure: { [weak self] (createDroppError: NSError) in
      guard let strongSelf = self else {
        return
      }
      
      debugPrint("Post dropp content error", createDroppError)
      strongSelf.displayAddDroppFailure()
    })
  }
  
  private func displayAddDroppSuccess() {
    let alert = UIAlertController(title: "Dropped", message: "We got your dropp!😄", preferredStyle: .alert, color: .salmon, addDefaultAction: true) { _ in
      self.droppFeedViewControllerDelegate?.shouldRefreshData()
      self.dismiss(animated: true, completion: nil)
    }
    
    present(alert, animated: true, completion: { () in
      self.postingDropp = false
      self.toggleCancelButton(enabled: true)
      self.toggleLoadingView(visible: false)
    })
  }
  
  private func displayAddDroppFailure() {
    let alert = UIAlertController(title: "Error", message: "Unable to post your dropp😕", preferredStyle: .alert, color: .salmon, addDefaultAction: true) { _ in
      self.togglePostButton(enabled: true)
      self.toggleCancelButton(enabled: true)
    }
    
    present(alert, animated: true, completion: { () in
      self.postingDropp = false
      self.toggleLoadingView(visible: false)
    })
  }
  
  private func toggleCancelButton(enabled: Bool) {
    DispatchQueue.main.async {
      self.navigationItem.leftBarButtonItem?.isEnabled = enabled
    }
  }
  
  private func togglePostButton(enabled: Bool) {
    DispatchQueue.main.async {
      self.navigationItem.rightBarButtonItem?.isEnabled = enabled
    }
  }
  
  private func toggleLoadingView(visible: Bool) {
    DispatchQueue.main.async {
      self.loadingView.isHidden = !visible
      if visible {
        self.activityIndicatorView.startAnimatingGIF()
        self.activityIndicatorView.isHidden = false
      } else {
        self.activityIndicatorView.isHidden = true
        self.activityIndicatorView.stopAnimatingGIF()
      }
    }
  }
  
  func resetInputs() {
    configureCameraOptionsSheet(includeDeleteOption: false)
    togglePostButton(enabled: false)
    DispatchQueue.main.async {
      self.imageView.image = nil
      self.clearTextView()
      self.textView.resignFirstResponder()
      self.addPhotoButton.setTitle("Add photo", for: .normal)
    }
  }
  
  @objc
  private func clearTextView() {
    textView.text = ""
    placeholderLabel.isHidden = false
    let shouldEnable = imageView.image != nil
    togglePostButton(enabled: shouldEnable)
  }
  
  func addKeyboardToolbar() {
    let toolbar = UIToolbar()
    toolbar.sizeToFit()
    toolbar.barTintColor = .white
    
    let spacing = UIBarButtonItem(barButtonSystemItem: .flexibleSpace, target: self, action: nil)
    let doneButton = UIBarButtonItem(title: "Done", style: .plain, target: self, action: #selector(dismissKeyboard))
    let clearButton = UIBarButtonItem(title: "Clear", style: .plain, target: self, action: #selector(clearTextView))
    doneButton.tintColor = .salmon
    clearButton.tintColor = .salmon
    
    // Add custom buttons to keyboard toolbar
    toolbar.items = [clearButton, spacing, doneButton]
    textView.inputAccessoryView = toolbar
  }
}

extension CreateDroppViewController: UITextViewDelegate {
  
  func textViewDidChange(_ textView: UITextView) {
    let textViewIsEmpty = textView.text.trim().isEmpty
    let shouldBeEnabled = !textViewIsEmpty || imageView.image != nil
    togglePostButton(enabled: shouldBeEnabled)
    placeholderLabel.isHidden = !textViewIsEmpty
  }
}

extension CreateDroppViewController: UIImagePickerControllerDelegate, UINavigationControllerDelegate {
  
  func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [String : Any]) {
    guard let image = info[UIImagePickerControllerOriginalImage] as? UIImage else {
      picker.dismiss(animated: true, completion: { () in
        self.present(self.mediaSourceIncompatibleAlert, animated: true, completion: nil)
      })
      
      return
    }
    
    imageView.image = image
    addPhotoButton.setTitle("Edit photo", for: .normal)
    configureCameraOptionsSheet(includeDeleteOption: true)
    picker.dismiss(animated: true, completion: nil)
    togglePostButton(enabled: true)
  }
}
