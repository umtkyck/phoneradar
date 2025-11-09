package com.phoneradar.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.phoneradar.app.ui.screens.MainScreen
import com.phoneradar.app.ui.theme.PhoneRadarTheme
import com.phoneradar.app.viewmodels.BLEViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            PhoneRadarTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val bleViewModel: BLEViewModel = viewModel()
                    MainScreen(bleViewModel = bleViewModel)
                }
            }
        }
    }
}
