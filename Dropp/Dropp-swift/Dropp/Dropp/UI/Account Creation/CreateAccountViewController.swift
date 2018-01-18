//
//  CreateAccountViewController.swift
//  Dropp
//
//  Created by Steven McCracken on 1/13/18.
//  Copyright © 2017 Group B. All rights reserved.
//

import UIKit

protocol CreateAccountViewDelegate: class {
  func didCreateAccount(username: String, password: String, token: String)
}

class CreateAccountViewController: UIViewController {
  
  weak var delegate: CreateAccountViewDelegate?
  @IBOutlet weak var emailTextField: UITextField!
  @IBOutlet weak var usernameTextField: UITextField!
  @IBOutlet weak var passwordTextField: UITextField!
  @IBOutlet weak var passwordConfirmTextField: UITextField!
  @IBOutlet weak var signupButton: UIButton!
  @IBOutlet weak var goToLoginButton: UIButton!
  @IBOutlet weak var errorInfoLabel: UILabel!
  
  private var textFieldToolbarItems: [UIBarButtonItem]!
  private var textFieldsAreValid: Bool {
    return !(emailTextField.text ?? "").trim().isEmpty && !(usernameTextField.text ?? "").trim().isEmpty && !(passwordTextField.text ?? "").trim().isEmpty && !(passwordConfirmTextField.text ?? "").trim().isEmpty && (passwordTextField.text ?? "") == (passwordConfirmTextField.text ?? "")
  }
  
  override func viewDidLoad() {
    super.viewDidLoad()
    addDismissKeyboardGesture()
    NotificationCenter.default.addObserver(self, selector: #selector(textFieldDidChange(_:)), name: Notification.Name.UITextFieldTextDidChange, object: nil)
    
    emailTextField.delegate = self
    usernameTextField.delegate = self
    passwordTextField.delegate = self
    passwordConfirmTextField.delegate = self
    
    signupButton.layer.borderWidth = 0.5
    signupButton.layer.cornerRadius = 5
    signupButton.layer.borderColor = UIColor.lightGray.cgColor
    
    emailTextField.layer.cornerRadius = 5
    usernameTextField.layer.cornerRadius = 5
    passwordTextField.layer.cornerRadius = 5
    passwordConfirmTextField.layer.cornerRadius = 5
    
    emailTextField.backgroundColor = .veryLightGray
    usernameTextField.backgroundColor = .veryLightGray
    passwordTextField.backgroundColor = .veryLightGray
    passwordConfirmTextField.backgroundColor = .veryLightGray
    
    let spacing = UIBarButtonItem(barButtonSystemItem: .flexibleSpace, target: nil, action: nil)
    let doneButton = UIBarButtonItem(title: "Done", style: .plain, target: self, action: #selector(dismissKeyboard))
    textFieldToolbarItems = [spacing, doneButton]
  }
  
  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    emailTextField.becomeFirstResponder()
  }
  
  @IBAction func signupButtonTapped(_ sender: Any) {
    guard let email = emailTextField.text, !email.trim().isEmpty else {
      signupButton.toggle(enabled: false)
      return
    }
    
    guard let username = usernameTextField.text, !username.trim().isEmpty else {
      signupButton.toggle(enabled: false)
      return
    }
    
    guard let password = passwordTextField.text, !password.trim().isEmpty else {
      signupButton.toggle(enabled: false)
      return
    }
    
    guard let passwordConfirm = passwordConfirmTextField.text, !passwordConfirm.trim().isEmpty else {
      signupButton.toggle(enabled: false)
      return
    }
    
    guard password == passwordConfirm else {
      signupButton.toggle(enabled: false)
      return
    }
    
    enterSigningUpState()
    UserService.createAccount(email: email, username: username, password: password, success: { [weak self] (token: String) in
      guard let strongSelf = self else {
        return
      }
      
      let alert = UIAlertController(title: "Success", message: "Welcome to Dropp🙌🏼", preferredStyle: .alert, color: .salmon, addDefaultAction: true) { _ in
        strongSelf.dismiss(animated: true) {
          strongSelf.delegate?.didCreateAccount(username: username, password: password, token: token)
        }
      }
      
      DispatchQueue.main.async {
        strongSelf.present(alert, animated: true) {
          strongSelf.exitSigningUpState()
        }
      }
    }, failure: { [weak self] (createAccountError: NSError) in
      guard let strongSelf = self else {
        return
      }
      
      var alertDetails: (String, String)
      if createAccountError.code == 400 {
        alertDetails = ("Error", "The email, username, or password you provided is invalid.")
      } else if createAccountError.code == 403 {
        alertDetails = ("Error", "We're sorry, but an account already exists with that email or username. Please use a different email or username.")
      } else {
        debugPrint("CreateAccountViewController create account error", createAccountError)
        alertDetails = ("Error", "We're sorry, but something went wrong. Please try again later.")
      }
      
      let alert = UIAlertController(title: alertDetails.0, message: alertDetails.1, preferredStyle: .alert, color: .salmon, addDefaultAction: true) { _ in
        if createAccountError.code != 500 {
          strongSelf.emailTextField.becomeFirstResponder()
        }
      }
      
      DispatchQueue.main.async {
        strongSelf.present(alert, animated: true) {
          strongSelf.exitSigningUpState()
        }
      }
    })
  }
  
  @IBAction func goToLoginButtonTapped(_ sender: Any) {
    dismiss(animated: true) {
      LoginManager.shared.ensureLogin()
    }
  }
  
  @objc
  private func textFieldDidChange(_ notification: NSNotification) {
    DispatchQueue.main.async {
      self.signupButton.toggle(enabled: self.textFieldsAreValid)
    }
  }
  
  @IBAction func passwordTextFieldChanged(_ sender: UITextField) {
    if (sender.text ?? "").trim() != (passwordConfirmTextField.text ?? "").trim() {
      updateErrorInfoLabel("Passwords must match")
    } else {
      updateErrorInfoLabel(nil)
    }
  }
  
  @IBAction func passwordConfirmTextFieldChanged(_ sender: UITextField) {
    if (sender.text ?? "").trim() != (passwordTextField.text ?? "").trim() {
      updateErrorInfoLabel("Passwords must match")
    } else {
      updateErrorInfoLabel(nil)
    }
  }
  
  private func enterSigningUpState() {
    let activityIndicator = UIActivityIndicatorView(activityIndicatorStyle: .gray)
    activityIndicator.startAnimating()
    DispatchQueue.main.async {
      self.resignFirstResponder()
      self.emailTextField.isEnabled = false
      self.usernameTextField.isEnabled = false
      self.passwordTextField.isEnabled = false
      self.passwordConfirmTextField.isEnabled = false
      self.signupButton.toggle(enabled: false, withTitle: "Creating your account...")
      self.goToLoginButton.isEnabled = false
      self.goToLoginButton.setTitleColor(.lightGray, for: .disabled)
      self.navigationItem.rightBarButtonItem = UIBarButtonItem(customView: activityIndicator)
    }
  }
  
  private func exitSigningUpState() {
    DispatchQueue.main.async {
      self.emailTextField.isEnabled = true
      self.usernameTextField.isEnabled = true
      self.passwordTextField.isEnabled = true
      self.passwordConfirmTextField.isEnabled = true
      self.signupButton.toggle(enabled: true, withTitle: "Create your account")
      self.goToLoginButton.isEnabled = true
      self.goToLoginButton.setTitleColor(.salmon, for: .normal)
      self.navigationItem.rightBarButtonItem = nil
    }
  }
  
  private func updateErrorInfoLabel(_ text: String?) {
    let hidden = text == nil
    DispatchQueue.main.async {
      self.errorInfoLabel.text = text
      self.errorInfoLabel.isHidden = hidden
    }
  }
}

extension CreateAccountViewController: UITextFieldDelegate {
  
  func textFieldShouldBeginEditing(_ textField: UITextField) -> Bool {
    textField.addToolbar(withItems: textFieldToolbarItems)
    return true
  }
  
  func textFieldShouldReturn(_ textField: UITextField) -> Bool {
    var shouldReturn = true
    textField.text = textField.text?.trim()
    if textField == emailTextField {
      usernameTextField.becomeFirstResponder()
    } else if textField == usernameTextField {
      passwordTextField.becomeFirstResponder()
    } else if textField == passwordTextField {
      passwordConfirmTextField.becomeFirstResponder()
    } else {
      // Last text field was reached. If everything is valid, initiate sign up request
      if textFieldsAreValid {
        signupButtonTapped(self)
      } else {
        shouldReturn = false
      }
    }
    
    return shouldReturn
  }
}
