//
//  LogInViewController.swift
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

class LogInViewController: UIViewController {
  
  weak var delegate: LogInViewDelegate?
  @IBOutlet weak var usernameTextField: UITextField!
  @IBOutlet weak var passwordTextField: UITextField!
  @IBOutlet weak var loginButton: UIButton!
  @IBOutlet weak var loadingView: UIView!
  @IBOutlet weak var activityIndicatorView: GIFImageView!
  
  override func viewDidLoad() {
    super.viewDidLoad()
    addDismissKeyboardGesture()
    usernameTextField.delegate = self
    passwordTextField.delegate = self
    NotificationCenter.default.addObserver(self, selector: #selector(textFieldDidChange(_:)), name: Notification.Name.UITextFieldTextDidChange, object: nil)
    activityIndicatorView.prepareForAnimation(withGIFNamed: Constants.activityIndicatorFileName)
    
    loginButton.layer.borderColor = UIColor.lightGray.cgColor
    loginButton.layer.borderWidth = 0.5
    loginButton.layer.cornerRadius = 5
    usernameTextField.layer.cornerRadius = 5
    passwordTextField.layer.cornerRadius = 5
    usernameTextField.backgroundColor = .veryLightGray
    passwordTextField.backgroundColor = .veryLightGray
  }
  
  @IBAction func loginButtonTapped(_ sender: Any) {
    guard let username = usernameTextField.text, !username.isEmpty else {
      toggleLoginButton(enabled: false)
      return
    }
    
    guard let password = passwordTextField.text, !password.isEmpty else {
      toggleLoginButton(enabled: false)
      return
    }
    
    toggleLoginButton(enabled: false)
    resignFirstResponder()
    toggleLoadingView(visible: true)
    LogInManager.shared.login(username: username, password: password, success: { [weak self] in
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
        debugPrint("LogInViewController login error", loginError)
        alertDetails = ("Error", "We're sorry, but something went wrong. Please try again later.")
      }
      
      let alert = UIAlertController(title: alertDetails.0, message: alertDetails.1, preferredStyle: .alert, color: .salmon)
      alert.addDefaultAction()
      DispatchQueue.main.async {
        strongSelf.present(alert, animated: true, completion: { () in
          strongSelf.toggleLoginButton(enabled: true)
          strongSelf.toggleLoadingView(visible: false)
        })
      }
    })
  }
  
  @objc
  private func textFieldDidChange(_ notification: NSNotification) {
    toggleLoginButton(enabled: areTextFieldsValid())
  }
  
  private func toggleLoginButton(enabled: Bool) {
    DispatchQueue.main.async {
      self.loginButton.isEnabled = enabled
      if enabled {
        self.loginButton.backgroundColor = .salmon
        self.loginButton.setTitleColor(.white, for: .normal)
        self.loginButton.layer.borderWidth = 0
      } else {
        self.loginButton.backgroundColor = .white
        self.loginButton.setTitleColor(.lightGray, for: .disabled)
        self.loginButton.layer.borderWidth = 0.5
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
  
  private func areTextFieldsValid() -> Bool {
    return !(usernameTextField.text ?? "").isEmpty && !(passwordTextField.text ?? "").isEmpty
  }
}

extension LogInViewController: UITextFieldDelegate {
  
  func textFieldShouldReturn(_ textField: UITextField) -> Bool {
    if textField == usernameTextField {
      passwordTextField.becomeFirstResponder()
    } else {
      if (usernameTextField.text ?? "").isEmpty {
        usernameTextField.becomeFirstResponder()
      } else {
        passwordTextField.resignFirstResponder()
      }
      
      if areTextFieldsValid() {
        loginButtonTapped(self)
      }
    }
    
    return true
  }
}
