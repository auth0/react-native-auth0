//
//  CredentialsManagerBridge.swift
//  A0Auth0
//
//  Created by Poovamraj Thanganadar Thiagarajan on 09.08.22.
//  Copyright © 2022 Facebook. All rights reserved.
//

import Auth0

@objc(CredentialsManagerBridge)
class CredentialsManagerBridge: NSObject {
    let clientId: NSString
    
    let domain: NSString
    
    @objc public init(clientId: NSString, domain: NSString) {
        self.clientId = clientId
        self.domain = domain
        super.init()
   }
}
