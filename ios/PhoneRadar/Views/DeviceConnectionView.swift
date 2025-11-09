//
//  DeviceConnectionView.swift
//  PhoneRadar
//
//  Created on 2024-01-09.
//

import SwiftUI
import CoreBluetooth

struct DeviceConnectionView: View {
    @EnvironmentObject var bleManager: BLEManager

    var body: some View {
        VStack(spacing: 24) {
            // Bluetooth icon
            Image(systemName: bleManager.isScanning ? "wave.3.right.circle.fill" : "bluetooth")
                .font(.system(size: 80))
                .foregroundColor(.blue)
                .symbolEffect(.variableColor, isActive: bleManager.isScanning)

            Text("Cihaz Bağlantısı")
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(.white)

            // Scan button
            Button(action: {
                if bleManager.isScanning {
                    bleManager.stopScanning()
                } else {
                    bleManager.startScanning()
                }
            }) {
                HStack {
                    Image(systemName: bleManager.isScanning ? "stop.circle.fill" : "antenna.radiowaves.left.and.right")
                    Text(bleManager.isScanning ? "Taramayı Durdur" : "Cihaz Ara")
                        .fontWeight(.semibold)
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding()
                .background(
                    LinearGradient(
                        colors: bleManager.isScanning ? [.red, .orange] : [.blue, .purple],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .cornerRadius(12)
            }

            // Device list
            if !bleManager.discoveredDevices.isEmpty {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Bulunan Cihazlar")
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding(.horizontal)

                    ScrollView {
                        VStack(spacing: 12) {
                            ForEach(bleManager.discoveredDevices, id: \.identifier) { device in
                                DeviceRow(device: device) {
                                    bleManager.connect(to: device)
                                }
                            }
                        }
                    }
                }
            } else if bleManager.isScanning {
                VStack(spacing: 12) {
                    ProgressView()
                        .tint(.white)

                    Text("Cihazlar aranıyor...")
                        .foregroundColor(.gray)
                }
                .padding(.top, 20)
            } else {
                Text("Başlamak için 'Cihaz Ara' butonuna tıklayın")
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }

            Spacer()

            // Info
            infoBox
        }
        .padding()
    }

    private var infoBox: some View {
        HStack(spacing: 12) {
            Image(systemName: "info.circle.fill")
                .foregroundColor(.blue)

            VStack(alignment: .leading, spacing: 4) {
                Text("Bluetooth Gerekli")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)

                Text("Cihazınızı telefonunuza takın ve açın")
                    .font(.caption)
                    .foregroundColor(.gray)
            }

            Spacer()
        }
        .padding()
        .background(Color.blue.opacity(0.1))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.blue.opacity(0.3), lineWidth: 1)
        )
    }
}

struct DeviceRow: View {
    let device: CBPeripheral
    let onConnect: () -> Void

    var body: some View {
        Button(action: onConnect) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(device.name ?? "Bilinmeyen Cihaz")
                        .font(.headline)
                        .foregroundColor(.white)

                    Text(device.identifier.uuidString)
                        .font(.caption)
                        .foregroundColor(.gray)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .foregroundColor(.gray)
            }
            .padding()
            .background(Color.white.opacity(0.05))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.white.opacity(0.1), lineWidth: 1)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct DeviceConnectionView_Previews: PreviewProvider {
    static var previews: some View {
        DeviceConnectionView()
            .environmentObject(BLEManager())
            .background(Color.black)
    }
}
