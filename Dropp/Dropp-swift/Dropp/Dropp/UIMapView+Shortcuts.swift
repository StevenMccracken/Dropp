//
//  UIMapView+Shortcuts.swift
//  Dropp
//
//  Created by Steven McCracken on 1/20/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import MapKit

extension MKMapView {
  
  func deselectSelectedAnnotations(animated: Bool = true) {
    for selectedAnnotation in selectedAnnotations {
      deselectAnnotation(selectedAnnotation, animated: animated)
    }
  }
}
