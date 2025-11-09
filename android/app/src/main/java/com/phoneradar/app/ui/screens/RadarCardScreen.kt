package com.phoneradar.app.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.phoneradar.app.services.RadarImageData
import com.phoneradar.app.viewmodels.BLEViewModel
import kotlin.math.min

@Composable
fun RadarCardScreen(bleViewModel: BLEViewModel) {
    val deviceInfo by bleViewModel.deviceInfo.collectAsState()
    val sensorData by bleViewModel.sensorData.collectAsState()
    val radarImage by bleViewModel.radarImage.collectAsState()

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            // Header Card
            HeaderCard(
                deviceName = deviceInfo.name,
                isConnected = true,
                onDisconnect = { bleViewModel.disconnect() }
            )
        }

        item {
            // Radar Display
            RadarDisplayCard(radarImage = radarImage)
        }

        item {
            // Sensor Data Grid
            SensorDataGrid(
                batteryLevel = sensorData.batteryLevel,
                temperature = sensorData.temperature,
                distance = sensorData.distance,
                signalStrength = sensorData.signalStrength
            )
        }

        item {
            // Disconnect Button
            Button(
                onClick = { bleViewModel.disconnect() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFEF4444)
                )
            ) {
                Row(
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.LinkOff,
                        contentDescription = null,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Bağlantıyı Kes")
                }
            }
        }

        item {
            // Info Card
            InfoCard()
        }

        item {
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
fun HeaderCard(deviceName: String, isConnected: Boolean, onDisconnect: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.Transparent
        )
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.horizontalGradient(
                        colors = listOf(
                            Color(0xFF6366F1),
                            Color(0xFF8B5CF6)
                        )
                    )
                )
                .padding(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Radar,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(32.dp)
                )

                Spacer(modifier = Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "FLIR One Radar",
                        style = MaterialTheme.typography.titleLarge,
                        color = Color.White
                    )

                    Text(
                        text = deviceName,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFFBFDBFE)
                    )
                }

                // Connection indicator
                Surface(
                    shape = CircleShape,
                    color = Color(0xFF10B981),
                    modifier = Modifier.size(12.dp)
                ) {}
            }
        }
    }
}

@Composable
fun RadarDisplayCard(radarImage: RadarImageData?) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF1E293B).copy(alpha = 0.5f)
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Radar Görüntüsü",
                    style = MaterialTheme.typography.titleMedium,
                    color = Color.White
                )

                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = Color(0xFFF59E0B).copy(alpha = 0.2f)
                ) {
                    Text(
                        text = if (radarImage != null) "Canlı" else "Simülasyon",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color(0xFFF59E0B),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Radar Canvas
            if (radarImage != null) {
                RadarCanvas(radarImage)
            } else {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(300.dp)
                        .background(Color.Black, RoundedCornerShape(12.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.Radar,
                            contentDescription = null,
                            tint = Color.Gray,
                            modifier = Modifier.size(50.dp)
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Text(
                            text = "Veri bekleniyor...",
                            color = Color.Gray
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun RadarCanvas(imageData: RadarImageData) {
    Canvas(
        modifier = Modifier
            .fillMaxWidth()
            .height(300.dp)
    ) {
        val canvasWidth = size.width
        val canvasHeight = size.height

        val cellWidth = canvasWidth / imageData.width
        val cellHeight = canvasHeight / imageData.height

        for (y in 0 until imageData.height) {
            for (x in 0 until imageData.width) {
                val index = y * imageData.width + x
                if (index < imageData.pixels.size) {
                    val value = (imageData.pixels[index].toInt() and 0xFF) / 255f

                    // Thermal color gradient (blue -> green -> yellow -> red)
                    val hue = (1f - value) * 240f // 240 (blue) -> 0 (red)
                    val color = Color.hsv(hue, 1f, 1f)

                    drawRect(
                        color = color,
                        topLeft = Offset(x * cellWidth, y * cellHeight),
                        size = Size(cellWidth, cellHeight)
                    )
                }
            }
        }
    }
}

@Composable
fun SensorDataGrid(
    batteryLevel: Int,
    temperature: Float,
    distance: Float,
    signalStrength: Int
) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        modifier = Modifier.height(280.dp)
    ) {
        item {
            SensorCard(
                icon = Icons.Default.BatteryFull,
                label = "Batarya",
                value = "$batteryLevel%",
                color = Color(0xFF10B981)
            )
        }

        item {
            SensorCard(
                icon = Icons.Default.Thermostat,
                label = "Sıcaklık",
                value = "%.1f°C".format(temperature),
                color = Color(0xFFF59E0B)
            )
        }

        item {
            SensorCard(
                icon = Icons.Default.Straighten,
                label = "Mesafe",
                value = "%.2fm".format(distance),
                color = Color(0xFF6366F1)
            )
        }

        item {
            SensorCard(
                icon = Icons.Default.SignalCellularAlt,
                label = "Sinyal",
                value = "$signalStrength dBm",
                color = Color(0xFF8B5CF6)
            )
        }
    }
}

@Composable
fun SensorCard(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    value: String,
    color: Color
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(120.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF1E293B).copy(alpha = 0.5f)
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = color,
                    modifier = Modifier.size(20.dp)
                )

                Text(
                    text = label,
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray
                )
            }

            Text(
                text = value,
                style = MaterialTheme.typography.headlineSmall,
                color = Color.White
            )
        }
    }
}

@Composable
fun InfoCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF6366F1).copy(alpha = 0.1f)
        ),
        border = androidx.compose.foundation.BorderStroke(
            1.dp,
            Color(0xFF6366F1).copy(alpha = 0.3f)
        )
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Info,
                contentDescription = "Info",
                tint = Color(0xFF6366F1),
                modifier = Modifier.size(24.dp)
            )

            Column {
                Text(
                    text = "Canlı Veri",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.White
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = "Bluetooth üzerinden gerçek zamanlı radar ve termal görüntü alınıyor",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray
                )
            }
        }
    }
}
