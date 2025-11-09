//
//  RadarCardView.swift
//  PhoneRadar
//
//  Created on 2024-01-09.
//

import SwiftUI

struct RadarCardView: View {
    @EnvironmentObject var bleManager: BLEManager
    @State private var useSimulation = true

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Header card
                headerCard

                // Radar/Thermal display
                radarDisplayCard

                // Sensor data grid
                sensorDataGrid

                // Disconnect button
                disconnectButton

                // Info
                infoCard
            }
        }
    }

    // MARK: - Header Card
    private var headerCard: some View {
        HStack {
            Image(systemName: "dot.radiowaves.left.and.right")
                .font(.title2)
                .foregroundColor(.white)

            VStack(alignment: .leading, spacing: 4) {
                Text("FLIR One Radar")
                    .font(.title3)
                    .fontWeight(.bold)
                    .foregroundColor(.white)

                Text(bleManager.deviceInfo.name)
                    .font(.subheadline)
                    .foregroundColor(.blue.opacity(0.8))
            }

            Spacer()

            Circle()
                .fill(Color.green)
                .frame(width: 12, height: 12)
                .overlay(
                    Circle()
                        .stroke(Color.green.opacity(0.3), lineWidth: 4)
                )
        }
        .padding()
        .background(
            LinearGradient(
                colors: [.blue, .purple],
                startPoint: .leading,
                endPoint: .trailing
            )
        )
        .cornerRadius(16)
        .shadow(color: .blue.opacity(0.3), radius: 10, x: 0, y: 5)
    }

    // MARK: - Radar Display Card
    private var radarDisplayCard: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Radar Görüntüsü")
                    .font(.headline)
                    .foregroundColor(.white)

                Spacer()

                Text(useSimulation ? "Simülasyon" : "Canlı")
                    .font(.caption)
                    .foregroundColor(.orange)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.orange.opacity(0.2))
                    .cornerRadius(6)
            }

            // Radar canvas
            if let radarImage = bleManager.radarImage {
                RadarImageView(imageData: radarImage)
                    .frame(height: 300)
                    .cornerRadius(12)
            } else {
                // Placeholder
                ZStack {
                    Color.black

                    VStack(spacing: 12) {
                        Image(systemName: "dot.radiowaves.up.forward")
                            .font(.system(size: 50))
                            .foregroundColor(.gray)

                        Text("Veri bekleniyor...")
                            .foregroundColor(.gray)
                    }
                }
                .frame(height: 300)
                .cornerRadius(12)
            }
        }
        .padding()
        .background(Color.white.opacity(0.05))
        .cornerRadius(16)
    }

    // MARK: - Sensor Data Grid
    private var sensorDataGrid: some View {
        LazyVGrid(columns: [
            GridItem(.flexible()),
            GridItem(.flexible())
        ], spacing: 12) {
            SensorCard(
                icon: "battery.100",
                label: "Batarya",
                value: "\(bleManager.sensorData.batteryLevel)%",
                color: .green
            )

            SensorCard(
                icon: "thermometer",
                label: "Sıcaklık",
                value: String(format: "%.1f°C", bleManager.sensorData.temperature),
                color: .orange
            )

            SensorCard(
                icon: "ruler",
                label: "Mesafe",
                value: String(format: "%.2fm", bleManager.sensorData.distance),
                color: .blue
            )

            SensorCard(
                icon: "antenna.radiowaves.left.and.right",
                label: "Sinyal",
                value: "\(bleManager.sensorData.signalStrength) dBm",
                color: .purple
            )
        }
    }

    // MARK: - Disconnect Button
    private var disconnectButton: some View {
        Button(action: {
            bleManager.disconnect()
        }) {
            HStack {
                Image(systemName: "link.badge.slash")
                Text("Bağlantıyı Kes")
                    .fontWeight(.semibold)
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.red)
            .cornerRadius(12)
        }
    }

    // MARK: - Info Card
    private var infoCard: some View {
        HStack(spacing: 12) {
            Image(systemName: "info.circle.fill")
                .foregroundColor(.blue)

            VStack(alignment: .leading, spacing: 4) {
                Text("Canlı Veri")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)

                Text("Bluetooth üzerinden gerçek zamanlı radar ve termal görüntü alınıyor")
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

// MARK: - Sensor Card Component
struct SensorCard: View {
    let icon: String
    let label: String
    let value: String
    let color: Color

    var body: some View {
        VStack(spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: icon)
                    .foregroundColor(color)

                Text(label)
                    .font(.caption)
                    .foregroundColor(.gray)

                Spacer()
            }

            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding()
        .background(Color.white.opacity(0.05))
        .cornerRadius(12)
    }
}

// MARK: - Radar Image View
struct RadarImageView: View {
    let imageData: RadarImageData

    var body: some View {
        GeometryReader { geometry in
            Canvas { context, size in
                let cellWidth = size.width / CGFloat(imageData.width)
                let cellHeight = size.height / CGFloat(imageData.height)

                for y in 0..<imageData.height {
                    for x in 0..<imageData.width {
                        let index = y * imageData.width + x
                        if index < imageData.pixels.count {
                            let value = CGFloat(imageData.pixels[index]) / 255.0

                            // Thermal color gradient (blue -> green -> yellow -> red)
                            let hue = (1.0 - value) * 0.66 // 0.66 (blue) -> 0 (red)
                            let color = Color(hue: hue, saturation: 1.0, brightness: 1.0)

                            let rect = CGRect(
                                x: CGFloat(x) * cellWidth,
                                y: CGFloat(y) * cellHeight,
                                width: cellWidth,
                                height: cellHeight
                            )

                            context.fill(
                                Path(rect),
                                with: .color(color)
                            )
                        }
                    }
                }
            }
        }
    }
}

struct RadarCardView_Previews: PreviewProvider {
    static var previews: some View {
        RadarCardView()
            .environmentObject(BLEManager())
            .background(Color.black)
    }
}
