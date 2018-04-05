//
//  CreateDroppViewController.swift
//  Dropp
//
//  Created by Steven McCracken on 12/16/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import UIKit

class CreateDroppViewController: UIViewController {
  
  // MARK: IBOutlets
  @IBOutlet weak var textView: UITextView!
  @IBOutlet weak var placeholderLabel: UILabel!
  @IBOutlet weak var imageView: UIImageView!
  @IBOutlet weak var imageToolbar: UIToolbar!
  @IBOutlet weak var addImageButton: UIBarButtonItem!
  @IBOutlet weak var containerView: UIView!
  @IBOutlet weak var containerViewHeightConstraint: NSLayoutConstraint!
  
  // MARK: View controller members
  weak var feedViewControllerDelegate: FeedViewControllerDelegate?
  private var originalTitle: String?
  
  /**
   Indicates whether or not an upload is in progress
   */
  private var isPosting = false
  
  // MARK: Text and image views
  
  /**
   Whether or not the text view truly has text
   */
  private var hasText: Bool {
    return !currentText.isEmpty
  }
  
  /**
   The current text in the text view, with whitespace trimmed off
   */
  private var currentText: String {
    return textView.text.trim()
  }
  
  /**
   Whether or not the user has selected an image
   */
  private var hasImage: Bool {
    return currentImage != nil
  }
  
  /**
   The current image in the image view
   */
  private var currentImage: UIImage? {
    return imageView.image
  }
  
  // MARK: Image picker members
  
  /**
   View controller to select media for the new dropp
   */
  private lazy var imagePicker: UIImagePickerController = {
    let picker = UIImagePickerController()
    picker.delegate = self
    picker.allowsEditing = false
    picker.navigationBar.tintColor = .salmon
    return picker
  }()
  
  private lazy var shareButton = UIBarButtonItem(title: "Share", style: .done, target: self, action: #selector(didTapShareButton(_:)))
  private lazy var cancelButton = UIBarButtonItem(title: "Cancel", style: .plain, target: self, action: #selector(didTapCancelButton(_:)))
  
  /**
   Button to edit the current image
   */
  private lazy var editImageButton: UIBarButtonItem = {
    let button = UIBarButtonItem(title: "Edit photo", style: .plain, target: self, action: #selector(didTapEditImageButton(_:)))
    button.tintColor = .salmon
    return button
  }()
  
  // MARK: Alerts members
  
  /**
   Alert controller to interact with images for the dropp
   */
  private var addImageOptionsAlert: UIAlertController!
  
  /**
   Alerts the user that a given media source is unavailable
   */
  private lazy var mediaSourceUnavailableAlert: UIAlertController = {
    let alert = UIAlertController(title: "Error", message: "Sorry, this device does not have that media source.", preferredStyle: .alert, color: .salmon, addDefaultAction: true)
    return alert
  }()
  
  /**
   Alerts the user that a given media source is incompatible with the backend
   */
  private lazy var mediaSourceIncompatibleAlert: UIAlertController = {
    let alert = UIAlertController(title: "Error", message: "Sorry, that media format is not supported at this time.", preferredStyle: .alert, color: .salmon, addDefaultAction: true)
    return alert
  }()
  
  // MARK: View lifecycle
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    // Configure navigation bar
    originalTitle = title
    navigationItem.leftBarButtonItem = cancelButton
    navigationItem.rightBarButtonItem = shareButton
    togglePostButton(enabled: false)
    
    // Customize the text view
    textView.delegate = self
    textView.layer.cornerRadius = 5
    textView.backgroundColor = UIColor(white: 0.95, alpha: 1)
    
    // Add toolbar to the text view's keyboard
    addDismissKeyboardGesture()
    let spacing = UIBarButtonItem(barButtonSystemItem: .flexibleSpace, target: nil, action: nil)
    let doneButton = UIBarButtonItem(title: "Done", style: .plain, target: self, action: #selector(dismissKeyboard))
    let clearButton = UIBarButtonItem(title: "Clear", style: .plain, target: self, action: #selector(clearTextView))
    textView.addToolbar(withItems: [clearButton, spacing, doneButton])
    
    // Configure image picker members
    configureImageOptionsAlert(editImage: false)
  }
  
  override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
    NotificationCenter.default.removeObserver(self)
  }
  
  // MARK: Actions
  
  /**
   Handles when the user taps on the add image button.
   - Parameter sender: the add image button
   */
  @IBAction func didTapAddImageButton(_ sender: UIBarButtonItem) {
    if Utils.isPad {
      let popover = addImageOptionsAlert.popoverPresentationController
      popover?.permittedArrowDirections = .any
      popover?.barButtonItem = sender
    }
    
    present(addImageOptionsAlert, animated: true, completion: nil)
  }
  
  /**
   Handles when the user taps on the edit image button.
   - Parameter sender: the edit image button
   */
  @objc
  private func didTapEditImageButton(_ sender: UIBarButtonItem) {
    if Utils.isPad {
      let popover = addImageOptionsAlert.popoverPresentationController
      popover?.permittedArrowDirections = .any
      popover?.barButtonItem = sender
    }
    
    present(addImageOptionsAlert, animated: true, completion: nil)
  }
  
  /**
   Handles when the cancel button is tapped.
   - Parameter sender: the cancel button
   */
  @objc
  private func didTapCancelButton(_ sender: UIBarButtonItem) {
    guard !isPosting else {
      return
    }
    
    dismissKeyboard()
    dismiss(animated: true, completion: nil)
  }
  
  /**
   Handles when the share is tapped.
   - Parameter sender: the share button
   */
  @objc
  private func didTapShareButton(_ sender: UIBarButtonItem) {
    guard hasText || hasImage else {
      return
    }
    
    togglePostingState(enabled: true)
    let now = Date()
    let message = currentText
    let currentImage = self.currentImage
    let location = LocationManager.shared.currentLocation
    DroppService.createDropp(at: location, on: now, withMessage: message, hasMedia: hasImage, success: { [weak self] (dropp: Dropp) in
      guard let strongSelf = self else {
        return
      }
      
      guard let image = currentImage else {
        strongSelf.performSuccessCleanup(withDropp: dropp)
        return
      }
      
      DroppService.upload(image: image, forDropp: dropp, success: { [weak self] () in
        guard let strongSelf = self else {
          return
        }
        
        strongSelf.performSuccessCleanup(withDropp: dropp)
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
  
  // MARK: Updating state functions
  
  /**
   Toggles whether or not the view is in the posting state.
   - Parameter enabled: whether or not to enter the posting state
   */
  private func togglePostingState(enabled: Bool) {
    guard enabled != isPosting else {
      return
    }
    
    isPosting = enabled
    textView.isEditable = !enabled
    textView.isSelectable = !enabled
    toggleCancelButton(enabled: !enabled)
    toggleToolbarButtons(enabled: !enabled)
    if enabled {
      dismissKeyboard()
      title = "Sharing..."
      let activityIndicator = UIActivityIndicatorView(activityIndicatorStyle: .gray)
      activityIndicator.startAnimating()
      navigationItem.rightBarButtonItem = UIBarButtonItem(customView: activityIndicator)
    } else {
      title = originalTitle
      navigationItem.rightBarButtonItem = shareButton
    }
  }
  
  /**
   Resets the posting state and dismisses the view.
   */
  private func performSuccessCleanup(withDropp dropp: Dropp) {
    DispatchQueue.main.async {
      self.togglePostingState(enabled: false)
      self.dismiss(animated: true) {
        self.feedViewControllerDelegate?.shouldAddDropp?(dropp)
      }
    }
    
  }
  
  // MARK: Updating UI functions
  
  /**
   Toggles the cancel button enabled state.
   - Parameter enabled: whether or not to enable the button
   */
  private func toggleCancelButton(enabled: Bool) {
    DispatchQueue.main.async {
      self.navigationItem.leftBarButtonItem?.isEnabled = enabled
    }
  }
  
  /**
   Toggles the post button enabled state.
   - Parameter enabled: whether or not to enable the button
   */
  private func togglePostButton(enabled: Bool) {
    DispatchQueue.main.async {
      self.navigationItem.rightBarButtonItem?.isEnabled = enabled
    }
  }
  
  /**
   Configures the buttons and toolbar for a given image.
   - Parameter image: the image to add. Passing nil will reset the image toolbar
   */
  private func updateView(withImage image: UIImage?) {
    var middleButton: UIBarButtonItem
    if image == nil {
      middleButton = addImageButton
      configureImageOptionsAlert(editImage: false)
    } else {
      middleButton = editImageButton
      configureImageOptionsAlert(editImage: true)
    }
    
    // Update image toolbar
    imageToolbar.setItems([.flexibleSpace, middleButton, .flexibleSpace], animated: true)
    
    // Update image and post button
    imageView.image = image
    updateHeightConstraint()
    togglePostButton(enabled: hasImage || hasText)
  }
  
  /**
   Toggles the buttons in the toolbar to be enabled or disabled.
   - Parameter enabled: whether or not to enable the buttons
   */
  private func toggleToolbarButtons(enabled: Bool) {
    imageToolbar.items?.forEach {
      $0.isEnabled = enabled
    }
  }
  
  /**
   Resets all the UI elements to their initial state.
   */
  private func resetInputs() {
    DispatchQueue.main.async {
      self.clearTextView()
      self.updateView(withImage: nil)
      self.textView.resignFirstResponder()
    }
  }
  
  /**
   Resets the text view to it's initial state.
   */
  @objc
  private func clearTextView() {
    textView.text = ""
    placeholderLabel.isHidden = false
    togglePostButton(enabled: hasImage)
  }
  
  /**
   Updates the container view's height constraint based on the UI elements within it.
   */
  private func updateHeightConstraint() {
    if let existingHeightConstraint = containerViewHeightConstraint {
      self.view.removeConstraint(existingHeightConstraint)
    }
    
    let imageViewHeightAdjustment = hasImage ? imageView.frame.height + 10 : 0
    let height = textView.frame.height + imageViewHeightAdjustment + 20
    containerViewHeightConstraint = NSLayoutConstraint(item: containerView, attribute: .height, relatedBy: .equal, toItem: nil, attribute: .height, multiplier: 1.0, constant: height)
    self.view.addConstraint(containerViewHeightConstraint!)
  }
  
  // MARK: Alert functions
  
  /**
   Notifies the user that their post failed to upload.
   */
  private func displayAddDroppFailure() {
    let alert = UIAlertController(title: "Error", message: "Unable to share your dropp😕", preferredStyle: .alert, color: .salmon, addDefaultAction: true)
    present(alert, animated: true) {
      self.togglePostingState(enabled: false)
    }
  }
  
  /**
   Configures the image picker alert.
   - Parameter editImage: Determines whether to configure the alert to add a new image or edit an existing one
   */
  private func configureImageOptionsAlert(editImage: Bool) {
    let editTitle = editImage ? " New" : ""
    addImageOptionsAlert = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet, color: .salmon)
    let cameraOption = UIAlertAction(title: "Take\(editTitle) Photo", style: .default) { _ in
      self.presentImagePicker(for: .camera)
    }
    
    let photoLibraryOption = UIAlertAction(title: "Choose\(editTitle) Photo", style: .default) { _ in
      self.presentImagePicker(for: .photoLibrary)
    }
    
    addImageOptionsAlert.addAction(cameraOption)
    addImageOptionsAlert.addAction(photoLibraryOption)
    if editImage {
      let deletePhotoOption = UIAlertAction(title: "Delete Photo", style: .destructive) { _ in
        self.updateView(withImage: nil)
      }
      
      addImageOptionsAlert.addAction(deletePhotoOption)
    }
    
    addImageOptionsAlert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
  }
  
  /**
   Presents an image picker, using a popover if the current device is an iPad.
   - Parameter sourceType: the type of media to use for the image picker
   */
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
    }
    
    if Utils.isPad {
      imagePicker.modalPresentationStyle = .popover
      let popover = imagePicker.popoverPresentationController
      popover?.permittedArrowDirections = .any
      popover?.barButtonItem = addImageButton
    }
    
    present(imagePicker, animated: true, completion: nil)
  }
}

extension CreateDroppViewController: UITextViewDelegate {
  
  func textViewDidChange(_ textView: UITextView) {
    placeholderLabel.isHidden = !textView.text.isEmpty
    if hasText {
      togglePostButton(enabled: true)
    } else {
      togglePostButton(enabled: hasImage)
    }
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
    
    updateView(withImage: image)
    picker.dismiss(animated: true, completion: nil)
  }
}
