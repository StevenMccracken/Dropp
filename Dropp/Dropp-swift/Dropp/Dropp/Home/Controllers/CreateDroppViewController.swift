//
//  CreateDroppViewController.swift
//  Dropp
//
//  Created by Steven McCracken on 12/16/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import UIKit

class CreateDroppViewController: UIViewController {
  
  @IBOutlet weak var textView: UITextView!
  @IBOutlet weak var placeholderLabel: UILabel!
  @IBOutlet weak var addPhotoButton: UIButton!
  @IBOutlet weak var postButton: UIButton!
  @IBOutlet weak var imageView: UIImageView!
  @IBOutlet weak var loadingView: UIView!
  @IBOutlet weak var activityIndicatorView: UIActivityIndicatorView!
  
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
    togglePostButton(enabled: false)
    
    // Customize the text view
    textView.delegate = self
    textView.layer.borderWidth = 0.2
    textView.layer.cornerRadius = 2.0
    textView.layer.borderColor = UIColor.gray.cgColor
    
    addDismissKeyboardGesture()
    
    // Image picker configuration
    imagePicker = UIImagePickerController()
    imagePicker.delegate = self
    imagePicker.allowsEditing = false
    imagePicker.navigationBar.tintColor = .salmon
    imagePicker.modalPresentationStyle = .overFullScreen
    
    // Add photo alerts configuration
    cameraOptionsSheet = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet, color: UIColor.salmon)
    let photoLibraryOption = UIAlertAction(title: "Photo Library", style: .default, handler: { _ in
      self.presentImagePicker(for: .photoLibrary)
    })
    
    let cameraOption = UIAlertAction(title: "Camera", style: .default, handler: { _ in
      self.presentImagePicker(for: .camera)
    })
    
    cameraOptionsSheet.addAction(photoLibraryOption)
    cameraOptionsSheet.addAction(cameraOption)
    cameraOptionsSheet.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
    
    mediaSourceUnavailableAlert = UIAlertController(title: "Error", message: "Sorry, this device does not have that media source", preferredStyle: .alert, color: .salmon)
    mediaSourceUnavailableAlert.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
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
    let location = LocationManager.shared.userCoordinates
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
      }, failure: { [weak self] (addImageError: Error) in
        guard let strongSelf = self else {
          return
        }
        
        debugPrint("Post dropp image error", addImageError)
        strongSelf.displayAddDroppFailure(failedDuringImageUpload: true, extraInfo: (droppId: droppId, image: image))
      })
    }, failure: { [weak self] (createDroppError: Error) in
      guard let strongSelf = self else {
        return
      }
      
      debugPrint("Post dropp content error", createDroppError)
      strongSelf.displayAddDroppFailure(failedDuringImageUpload: false)
    })
  }
  
  @IBAction func didLongPressOnImageView(_ sender: UILongPressGestureRecognizer) {
    guard let _ = imageView.image else {
      return
    }
    
    print("\nImage view was long pressed\n")
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
        }, failure: { [weak self] (addImageError: Error) in
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
    let color: UIColor = enabled ? .salmon : .gray
    let controlState: UIControlState = enabled ? .normal : .disabled
    DispatchQueue.main.async {
      self.postButton.isEnabled = enabled
      self.postButton.setTitleColor(color, for: controlState)
    }
  }
  
  private func toggleLoadingView(visible: Bool) {
    DispatchQueue.main.async {
      self.loadingView.isHidden = !visible
      self.activityIndicatorView.isHidden = !visible
    }
  }
  
  func resetInputs() {
    togglePostButton(enabled: false)
    DispatchQueue.main.async {
      self.textView.text = ""
      self.imageView.image = nil
    }
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
    picker.dismiss(animated: true, completion: nil)
    togglePostButton(enabled: true)
  }
}
