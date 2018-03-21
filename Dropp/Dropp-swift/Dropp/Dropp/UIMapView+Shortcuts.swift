//
//  UIMapView+Shortcuts.swift
//  Dropp
//
//  Created by Steven McCracken on 1/20/18.
//  Copyright © 2018 Group B. All rights reserved.
//

import MapKit

extension MKMapView {
  
  /**
   Deselets all the selected annotations in the given map view.
   - Parameter animated: whether or not to animate the de-selection. Default is true
   */
  func deselectSelectedAnnotations(animated: Bool = true) {
    for selectedAnnotation in selectedAnnotations {
      deselectAnnotation(selectedAnnotation, animated: animated)
    }
  }
}
