//
//  ContentView.swift
//  PhoneRadar
//
//  Created on 2024-01-09.
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var bleManager: BLEManager

    var body: some View {
        NavigationView {
            ZStack {
                // Background gradient
                LinearGradient(
                    colors: [
                        Color(red: 0.1, green: 0.1, blue: 0.2),
                        Color(red: 0.15, green: 0.15, blue: 0.25),
                        Color(red: 0.1, green: 0.1, blue: 0.2)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()

                VStack(spacing: 20) {
                    // Header
                    headerView

                    if bleManager.isConnected {
                        // Connected - show radar card
                        RadarCardView()
                    } else {
                        // Not connected - show device list
                        DeviceConnectionView()
                    }

                    Spacer()
                }
                .padding()
            }
            .navigationBarHidden(true)
        }
        .alert("Hata", isPresented: .constant(bleManager.errorMessage != nil)) {
            Button("Tamam") {
                bleManager.errorMessage = nil
            }
        } message: {
            if let error = bleManager.errorMessage {
                Text(error)
            }
        }
    }

    private var headerView: some View {
        VStack(spacing: 8) {
            Text("PhoneRadar")
                .font(.system(size: 36, weight: .bold))
                .foregroundColor(.white)

            Text("FLIR One Benzeri BLE Radar Cihazı")
                .font(.subheadline)
                .foregroundColor(.gray)
        }
        .padding(.top, 20)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(BLEManager())
    }
}
