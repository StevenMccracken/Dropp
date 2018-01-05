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
  @IBOutlet weak var postButton: UIButton!
  @IBOutlet weak var imageView: UIImageView!
  @IBOutlet weak var loadingView: UIView!
  @IBOutlet weak var activityIndicatorView: GIFImageView!
  
  var imagePicker: UIImagePickerController!
  var cameraOptionsSheet: UIAlertController!
  var mediaSourceUnavailableAlert: UIAlertController!
  
  weak var presentingViewControllerDelegate: PresentingViewControllerDelegate?
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    // Do any additional setup after loading the view.
    let cancelButton = UIBarButtonItem(barButtonSystemItem: .cancel, target: self, action: #selector(didTapCancelButton))
    cancelButton.tintColor = .salmon
    navigationItem.rightBarButtonItem = cancelButton
    activityIndicatorView.prepareForAnimation(withGIFNamed: Constants.activityIndicatorFileName)
    
    postButton.layer.borderColor = UIColor.lightGray.cgColor
    postButton.layer.borderWidth = 0.5
    postButton.layer.cornerRadius = 5
    addPhotoButton.layer.cornerRadius = 5
    togglePostButton(enabled: false)
    
    // Customize the text view
    textView.delegate = self
    textView.layer.cornerRadius = 5
    textView.backgroundColor = UIColor(white: 0.95, alpha: 1)
    
    addDismissKeyboardGesture()
    addKeyboardToolbar()
    
    // Image picker configuration
    imagePicker = UIImagePickerController()
    imagePicker.delegate = self
    imagePicker.allowsEditing = false
    imagePicker.navigationBar.tintColor = .salmon
    imagePicker.modalPresentationStyle = .overFullScreen
    
    // Add photo alerts configuration
    configureCameraOptionsSheet(includeDeleteOption: false)
    
    mediaSourceUnavailableAlert = UIAlertController(title: "Error", message: "Sorry, this device does not have that media source", preferredStyle: .alert, color: .salmon)
    mediaSourceUnavailableAlert.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
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
        self.togglePostButton(enabled: !self.textView.text.isEmpty)
        self.configureCameraOptionsSheet(includeDeleteOption: false)
      })
      
      cameraOptionsSheet.addAction(deleteOption)
    }
    
    cameraOptionsSheet.addAction(cameraOption)
    cameraOptionsSheet.addAction(photoLibraryOption)
    cameraOptionsSheet.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
  }
  
  @objc
  func didTapCancelButton() {
    dismissKeyboard()
    dismiss(animated: true, completion: nil)
  }
  
  @IBAction func didTapAddPhotoButton(_ sender: Any) {
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
    }
    
    present(imagePicker, animated: true, completion: nil)
  }
  
  @IBAction func didTapPostButton(_ sender: Any) {
    guard !textView.text.isEmpty || imageView.image != nil else {
      return
    }
    
    togglePostButton(enabled: false)
    toggleLoadingView(visible: true)
    let now = Date()
    let image = imageView.image
    let message = textView.text
    let location = LocationManager.shared.currentCoordinates
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
      }, failure: { [weak self] (addImageError: NSError) in
        guard let strongSelf = self else {
          return
        }
        
        debugPrint("Post dropp image error", addImageError)
        strongSelf.displayAddDroppFailure(failedDuringImageUpload: true, extraInfo: (droppId: droppId, image: image))
      })
    }, failure: { [weak self] (createDroppError: NSError) in
      guard let strongSelf = self else {
        return
      }
      
      debugPrint("Post dropp content error", createDroppError)
      strongSelf.displayAddDroppFailure(failedDuringImageUpload: false)
    })
  }
  
  private func displayAddDroppSuccess() {
    let alert = UIAlertController(title: "Dropped!", message: "We got your dropp", preferredStyle: .alert, color: .salmon)
    alert.addAction(UIAlertAction(title: "OK", style: .default, handler: { [weak self] _ in
      guard let strongSelf = self else {
        return
      }
      
      strongSelf.navigationController?.dismiss(animated: true, completion: nil)
      strongSelf.presentingViewControllerDelegate?.didDismissPresentedView(from: strongSelf)
    }))
    
    toggleLoadingView(visible: false)
    present(alert, animated: true, completion: nil)
  }
  
  private func displayAddDroppFailure(failedDuringImageUpload: Bool, extraInfo: (droppId: String, image: UIImage)? = nil) {
    let alert = UIAlertController(title: "Error", message: "Unable to add your dropp. Would you like to try again?", preferredStyle: .alert, color: .salmon)
    alert.addAction(UIAlertAction(title: "No", style: .default, handler: { _ in
      self.togglePostButton(enabled: true)
    }))
    
    alert.addAction(UIAlertAction(title: "Yes", style: .default, handler: { _ in
      if !failedDuringImageUpload {
        self.didTapPostButton(self)
      } else {
        guard let extraInfo = extraInfo else {
          return
        }
        
        self.toggleLoadingView(visible: true)
        DroppService.upload(image: extraInfo.image, forDropp: extraInfo.droppId, success: { [weak self] () in
          guard let strongSelf = self else {
            return
          }
          
          strongSelf.displayAddDroppSuccess()
        }, failure: { [weak self] (addImageError: NSError) in
          guard let strongSelf = self else {
            return
          }
          
          debugPrint("Post dropp image error", addImageError)
          strongSelf.displayAddDroppFailure(failedDuringImageUpload: true, extraInfo: (droppId: extraInfo.droppId, image: extraInfo.image))
        })
      }
    }))
    
    toggleLoadingView(visible: false)
    present(alert, animated: true, completion: nil)
  }
  
  private func togglePostButton(enabled: Bool) {
    DispatchQueue.main.async {
      self.postButton.isEnabled = enabled
      if enabled {
        self.postButton.backgroundColor = .salmon
        self.postButton.setTitleColor(.white, for: .normal)
        self.postButton.layer.borderWidth = 0
      } else {
        self.postButton.backgroundColor = .white
        self.postButton.setTitleColor(.lightGray, for: .disabled)
        self.postButton.layer.borderWidth = 0.5
      }
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
    togglePostButton(enabled: false)
    DispatchQueue.main.async {
      self.textView.text = ""
      self.imageView.image = nil
    }
  }
  
  @objc
  private func clearTextView() {
    textView.text = ""
    placeholderLabel.isHidden = false
    togglePostButton(enabled: imageView.image != nil)
  }
  
  func addKeyboardToolbar() {
    let toolbar = UIToolbar()
    toolbar.sizeToFit()
    toolbar.barTintColor = .white
    
    let spacing = UIBarButtonItem(barButtonSystemItem: .flexibleSpace, target: self, action: nil)
    let doneButton = UIBarButtonItem(title: "Done", style: .plain, target: self, action: #selector(dismissKeyboard))
    let clearButton = UIBarButtonItem(barButtonSystemItem: .trash, target: self, action: #selector(clearTextView))
    doneButton.tintColor = .salmon
    clearButton.tintColor = .salmon
    
    // Add custom buttons to keyboard toolbar
    toolbar.items = [clearButton, spacing, doneButton]
    textView.inputAccessoryView = toolbar
  }
}

extension CreateDroppViewController: UITextViewDelegate {
  
  func textViewDidChange(_ textView: UITextView) {
    let textViewIsEmpty = textView.text.isEmpty
    togglePostButton(enabled: !textViewIsEmpty || imageView.image != nil)
    placeholderLabel.isHidden = !textViewIsEmpty
  }
}

extension CreateDroppViewController: UIImagePickerControllerDelegate, UINavigationControllerDelegate {
  
  func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [String : Any]) {
    guard let image = info[UIImagePickerControllerOriginalImage] as? UIImage else {
      return
    }
    
    imageView.image = image
    addPhotoButton.setTitle("Edit photo", for: .normal)
    configureCameraOptionsSheet(includeDeleteOption: true)
    picker.dismiss(animated: true, completion: nil)
    togglePostButton(enabled: true)
  }
}
