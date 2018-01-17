//
//  LoginViewController.swift
//  Dropp
//
//  Created by Steven McCracken on 12/18/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import Gifu
import UIKit

protocol LogInViewDelegate: class {
  func didLogIn()
}

class LoginViewController: UIViewController {
  
  weak var delegate: LogInViewDelegate?
  @IBOutlet weak var usernameTextField: UITextField!
  @IBOutlet weak var passwordTextField: UITextField!
  @IBOutlet weak var loginButton: UIButton!
  @IBOutlet weak var goToCreateAccountButton: UIButton!
  
  private var textFieldToolbarItems: [UIBarButtonItem]!
  private var textFieldsAreValid: Bool {
    return !(usernameTextField.text ?? "").isEmpty && !(passwordTextField.text ?? "").isEmpty
  }
  
  override func viewDidLoad() {
    super.viewDidLoad()
    addDismissKeyboardGesture()
    usernameTextField.delegate = self
    passwordTextField.delegate = self
    NotificationCenter.default.addObserver(self, selector: #selector(textFieldDidChange(_:)), name: Notification.Name.UITextFieldTextDidChange, object: nil)
    
    loginButton.layer.borderColor = UIColor.lightGray.cgColor
    loginButton.layer.borderWidth = 0.5
    loginButton.layer.cornerRadius = 5
    usernameTextField.layer.cornerRadius = 5
    passwordTextField.layer.cornerRadius = 5
    usernameTextField.backgroundColor = .veryLightGray
    passwordTextField.backgroundColor = .veryLightGray
    
    let spacing = UIBarButtonItem(barButtonSystemItem: .flexibleSpace, target: nil, action: nil)
    let doneButton = UIBarButtonItem(title: "Done", style: .plain, target: self, action: #selector(dismissKeyboard))
    textFieldToolbarItems = [spacing, doneButton]
  }
  
  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    usernameTextField.becomeFirstResponder()
  }
  
  @IBAction func loginButtonTapped(_ sender: Any) {
    guard let username = usernameTextField.text, !username.isEmpty else {
      loginButton.toggle(enabled: false)
      return
    }
    
    guard let password = passwordTextField.text, !password.isEmpty else {
      loginButton.toggle(enabled: false)
      return
    }
    
    enterLoggingInState()
    LoginManager.shared.login(username: username, password: password, success: { [weak self] in
      guard let strongSelf = self else {
        return
      }
      
      strongSelf.dismiss(animated: true, completion: { () in
        strongSelf.delegate?.didLogIn()
      })
    }, failure: { [weak self] (loginError: NSError) in
      guard let strongSelf = self else {
        return
      }
      
      var alertDetails: (String, String)
      if loginError.code == 401 {
        alertDetails = ("Login Failed", "The username or password you provided is incorrect.")
      } else {
        debugPrint("LoginViewController login error", loginError)
        alertDetails = ("Error", "We're sorry, but something went wrong. Please try again later.")
      }
      
      let alert = UIAlertController(title: alertDetails.0, message: alertDetails.1, preferredStyle: .alert, color: .salmon, addDefaultAction: true)
      DispatchQueue.main.async {
        strongSelf.present(alert, animated: true) {
          strongSelf.exitLoggingInState()
        }
      }
    })
  }
  
  @IBAction func goToCreateAccountButtonTapped(_ sender: Any) {
    dismiss(animated: true) {
      LoginManager.shared.presentAccountCreation()
    }
  }
  
  @objc
  private func textFieldDidChange(_ notification: NSNotification) {
    DispatchQueue.main.async {
      self.loginButton.toggle(enabled: self.textFieldsAreValid)
    }
  }
  
  private func enterLoggingInState() {
    let activityIndicator = UIActivityIndicatorView(activityIndicatorStyle: .gray)
    activityIndicator.startAnimating()
    DispatchQueue.main.async {
      self.resignFirstResponder()
      self.usernameTextField.isEnabled = false
      self.passwordTextField.isEnabled = false
      self.loginButton.toggle(enabled: false, withTitle: "Logging in...")
      self.goToCreateAccountButton.isEnabled = false
      self.goToCreateAccountButton.setTitleColor(.lightGray, for: .disabled)
      self.navigationItem.rightBarButtonItem = UIBarButtonItem(customView: activityIndicator)
    }
  }
  
  private func exitLoggingInState() {
    DispatchQueue.main.async {
      self.usernameTextField.isEnabled = true
      self.passwordTextField.isEnabled = true
      self.loginButton.toggle(enabled: true, withTitle: "Log in")
      self.goToCreateAccountButton.isEnabled = true
      self.goToCreateAccountButton.setTitleColor(.salmon, for: .normal)
      self.navigationItem.rightBarButtonItem = nil
    }
  }
}

extension LoginViewController: UITextFieldDelegate {
  
  func textFieldShouldBeginEditing(_ textField: UITextField) -> Bool {
    textField.addToolbar(withItems: textFieldToolbarItems)
    return true
  }
  
  func textFieldShouldReturn(_ textField: UITextField) -> Bool {
    var shouldReturn = true
    if textField == usernameTextField {
      passwordTextField.becomeFirstResponder()
    } else {
      if (usernameTextField.text ?? "").isEmpty {
        usernameTextField.becomeFirstResponder()
      } else {
        passwordTextField.resignFirstResponder()
      }
      
      if textFieldsAreValid {
        loginButtonTapped(self)
      } else {
        shouldReturn = false
      }
    }
    
    return shouldReturn
  }
}
