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
  @IBOutlet weak var containerView: UIView!
  @IBOutlet weak var containerViewHeightConstraint: NSLayoutConstraint!
  
  weak var feedViewControllerDelegate: FeedViewControllerDelegate?
  private var originalTitle: String!
  var postingDropp = false
  var cameraOptionsSheet: UIAlertController!
  lazy var imagePicker: UIImagePickerController = {
    let picker = UIImagePickerController()
    picker.delegate = self
    picker.allowsEditing = false
    picker.navigationBar.tintColor = .salmon
    return picker
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
    originalTitle = title ?? ""
    
    let postButton = UIBarButtonItem(title: "Share", style: .done, target: self, action: #selector(didTapPostButton(_:)))
    let cancelButton = UIBarButtonItem(title: "Cancel", style: .plain, target: self, action: #selector(didTapCancelButton))
    navigationItem.leftBarButtonItem = cancelButton
    navigationItem.rightBarButtonItem = postButton
    
    addPhotoButton.layer.cornerRadius = 5
    addPhotoButton.backgroundColor = .salmon
    addPhotoButton.setTitleColor(.white, for: .normal)
    togglePostButton(enabled: false)
    
    // Customize the text view
    textView.delegate = self
    textView.layer.cornerRadius = 5
    textView.backgroundColor = UIColor(white: 0.95, alpha: 1)
    
    addDismissKeyboardGesture()
    let spacing = UIBarButtonItem(barButtonSystemItem: .flexibleSpace, target: nil, action: nil)
    let doneButton = UIBarButtonItem(title: "Done", style: .plain, target: self, action: #selector(dismissKeyboard))
    let clearButton = UIBarButtonItem(title: "Clear", style: .plain, target: self, action: #selector(clearTextView))
    textView.addToolbar(withItems: [clearButton, spacing, doneButton])
    
    // Add photo alerts configuration
    configureCameraOptionsSheet(imageViewContainsImage: false)
    
    NotificationCenter.default.addObserver(self, selector: #selector(deviceDidRotate), name: NSNotification.Name.UIDeviceOrientationDidChange, object: nil)
  }
  
  override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
    NotificationCenter.default.removeObserver(self)
  }
  
  private func configureCameraOptionsSheet(imageViewContainsImage: Bool) {
    cameraOptionsSheet = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet, color: .salmon)
    let cameraOption = UIAlertAction(title: "Take Photo", style: .default, handler: { _ in
      self.presentImagePicker(for: .camera)
    })
    
    let photoLibraryOption = UIAlertAction(title: "Choose Photo", style: .default, handler: { _ in
      self.presentImagePicker(for: .photoLibrary)
    })
    
    cameraOptionsSheet.addAction(cameraOption)
    cameraOptionsSheet.addAction(photoLibraryOption)
    if imageViewContainsImage {
      let saveOption = UIAlertAction(title: "Save Photo", style: .default, handler: { _ in
        let message = "The image will be saved to your photos once you successfully post your dropp. Would you still like to save the image now?"
        let saveAlert = UIAlertController(title: "Save Photo", message: message, preferredStyle: .alert, color: .salmon)
        saveAlert.addAction(UIAlertAction(title: "No", style: .cancel, handler: nil))
        saveAlert.addAction(UIAlertAction(title: "Yes", style: .default, handler: { _ in
          Utils.save(image: self.imageView.image!, withTimestamp: Date(), andLocation: LocationManager.shared.currentLocation, success: nil, failure: { [weak self] (saveImageError: Error) in
            guard let strongSelf = self else {
              return
            }
            
            debugPrint("Error saving image", saveImageError)
            let errorAlert = UIAlertController(title: "Error", message: "Unable to save image", preferredStyle: .alert, color: .salmon, addDefaultAction: true)
            strongSelf.present(errorAlert, animated: true, completion: nil)
          })
        }))
        
        self.present(saveAlert, animated: true, completion: nil)
      })
      
      let deleteOption = UIAlertAction(title: "Remove Photo", style: .destructive, handler: { _ in
        self.imageView.image = nil
        self.updateHeightConstraint()
        self.addPhotoButton.setTitle("Add photo", for: .normal)
        self.configureCameraOptionsSheet(imageViewContainsImage: false)
        
        let shouldEnable = !self.textView.text.trim().isEmpty
        self.togglePostButton(enabled: shouldEnable)
      })
      
      cameraOptionsSheet.addAction(saveOption)
      cameraOptionsSheet.addAction(deleteOption)
    }
    
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
    
    enterPostingState()
    
    let now = Date()
    let image = imageView.image
    let message = textView.text.trim()
    let location = LocationManager.shared.currentLocation
    DroppService.createDropp(at: location, on: now, withMessage: message, hasMedia: image != nil, success: { [weak self] (dropp: Dropp) in
      guard let strongSelf = self else {
        return
      }
      
      guard let image = image else {
        strongSelf.performSuccessCleanup(dropp)
        return
      }
      
      DroppService.upload(image: image, forDropp: dropp, success: { [weak self] () in
        guard let strongSelf = self else {
          return
        }
        
        strongSelf.performSuccessCleanup(dropp)
        Utils.save(image: image, withTimestamp: now, andLocation: location, success: nil, failure: { (error: Error) in
          debugPrint("Failed to save posted image to user's photos", error)
        })
      }, failure: { [weak self] (addImageError: NSError) in
        guard let strongSelf = self else {
          return
        }
        
        debugPrint("Post dropp image error", addImageError)
        DroppService.delete(dropp)
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
  
  private func enterPostingState() {
    guard !postingDropp else {
      return
    }
    
    postingDropp = true
    dismissKeyboard()
    let loadingIndicator = UIActivityIndicatorView(activityIndicatorStyle: .gray)
    loadingIndicator.startAnimating()
    toggleCancelButton(enabled: false)
    DispatchQueue.main.async {
      self.title = "Sharing..."
      self.navigationItem.rightBarButtonItem = UIBarButtonItem(customView: loadingIndicator)
      self.textView.isEditable = false
      self.textView.isSelectable = false
      self.addPhotoButton.toggle(enabled: false)
    }
  }
  
  private func exitPostingState() {
    guard postingDropp else {
      return
    }
    
    postingDropp = false
    toggleCancelButton(enabled: true)
    DispatchQueue.main.async {
      self.title = self.originalTitle
      self.navigationItem.rightBarButtonItem = UIBarButtonItem(title: "Share", style: .done, target: self, action: #selector(self.didTapPostButton(_:)))
      self.textView.isEditable = true
      self.textView.isSelectable = true
      self.addPhotoButton.toggle(enabled: true)
    }
  }
  
  private func performSuccessCleanup(_ dropp: Dropp) {
    self.exitPostingState()
    self.dismiss(animated: true) {
      self.feedViewControllerDelegate?.shouldAddDropp?(dropp)
    }
  }
  
  private func displayAddDroppFailure() {
    let alert = UIAlertController(title: "Error", message: "Unable to share your dropp😕", preferredStyle: .alert, color: .salmon, addDefaultAction: true)
    present(alert, animated: true, completion: { () in
      self.exitPostingState()
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
  
  func resetInputs() {
    configureCameraOptionsSheet(imageViewContainsImage: false)
    togglePostButton(enabled: false)
    DispatchQueue.main.async {
      self.imageView.image = nil
      self.updateHeightConstraint()
      self.clearTextView()
      self.textView.resignFirstResponder()
      self.addPhotoButton.setTitle("Add photo", for: .normal)
    }
  }
  
  @objc
  private func clearTextView() {
    textView.text = ""
    placeholderLabel.isHidden = false
    togglePostButton(enabled: imageView.image != nil)
  }
  
  @objc
  func deviceDidRotate() {
    updateHeightConstraint()
  }
  
  func updateHeightConstraint() {
    if let existingHeightConstraint = containerViewHeightConstraint {
      self.view.removeConstraint(existingHeightConstraint)
    }
    
    let height = textView.frame.height + addPhotoButton.frame.height + (imageView.image == nil ? 250 : imageView.frame.height) + 35
    containerViewHeightConstraint = NSLayoutConstraint(item: containerView, attribute: .height, relatedBy: .equal, toItem: nil, attribute: .height, multiplier: 1.0, constant: height)
    self.view.addConstraint(containerViewHeightConstraint!)
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
    updateHeightConstraint()
    addPhotoButton.setTitle("Edit photo", for: .normal)
    configureCameraOptionsSheet(imageViewContainsImage: true)
    picker.dismiss(animated: true, completion: nil)
    togglePostButton(enabled: true)
  }
}
