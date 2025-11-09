# Add project specific ProGuard rules here.

# Bluetooth classes
-keep class android.bluetooth.** { *; }
-keep interface android.bluetooth.** { *; }

# Compose
-keep class androidx.compose.** { *; }

# Coroutines
-keepclassmembernames class kotlinx.** {
    volatile <fields>;
}

# Keep generic signatures
-keepattributes Signature

# Keep annotations
-keepattributes *Annotation*
