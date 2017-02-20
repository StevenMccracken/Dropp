//
//  ViewController.swift
//  Dropp
//
//  Created by Steven McCracken on 2/20/17.
//  Copyright © 2017 Group B. All rights reserved.
//

import UIKit

class ViewController: UIViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    //Mark: Actions
    @IBAction func tapMeButton(sender: UIButton) {
        contactServer()
    }
    
    func contactServer() {
        print("Button Pressed")
        
        var bodyData = "data=something"
        var url: NSURL = NSURL(string: "localhost:3000")!
        var request:NSMutableURLRequest = NSMutableURLRequest(url:url as URL)
        
        request.httpMethod = "POST"
        request.httpBody = bodyData.data(using: String.Encoding.utf8);
        
        NSURLConnection.sendAsynchronousRequest(request as URLRequest, queue: OperationQueue.main)
        {
            (response, data, error) in
            print(response)
            
        }
    }
}
