//
//  LogInViewController.swift
//  Dropp
//
//  Created by Steven McCracken on 12/18/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import UIKit
import SwiftyJSON

protocol LogInViewDelegate: class {
  func didLogIn()
}

class LogInViewController: UIViewController {
  
  weak var delegate: LogInViewDelegate?
  @IBOutlet weak var usernameTextField: UITextField!
  @IBOutlet weak var passwordTextField: UITextField!
  @IBOutlet weak var loginButton: UIButton!
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    // Do any additional setup after loading the view.
  }
  
  @IBAction func loginButtonTapped(_ sender: Any) {
    guard let username = usernameTextField.text, !username.isEmpty else {
      return
    }
    
    guard let password = passwordTextField.text, !password.isEmpty else {
      return
    }
    
    loginButton.isEnabled = false
    LogInManager.shared.login(username: username, password: password, success: { [weak self] in
      guard let strongSelf = self else {
        return
      }
      
      strongSelf.dismiss(animated: true, completion: { () in
        strongSelf.delegate?.didLogIn()
      })
    }, failure: { [weak self] (loginError: Error) in
      guard let strongSelf = self else {
        return
      }
      
      debugPrint("LogInViewController login error", loginError)
      DispatchQueue.main.async {
        strongSelf.loginButton.isEnabled = true
      }
    })
  }
}
