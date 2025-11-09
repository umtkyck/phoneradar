//
//  PhoneRadarApp.swift
//  PhoneRadar
//
//  Created on 2024-01-09.
//

import SwiftUI

@main
struct PhoneRadarApp: App {
    @StateObject private var bleManager = BLEManager()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(bleManager)
        }
    }
}
