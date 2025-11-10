import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'PhoneRadar - FLIR One Benzeri BLE Radar Cihazı'
export const size = {
  width: 1200,
  height: 600,
}

export const contentType = 'image/png'

export default async function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          position: 'relative',
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.3), transparent 70%)',
          }}
        />

        {/* Icon */}
        <div
          style={{
            fontSize: 180,
            marginBottom: 30,
            filter: 'drop-shadow(0 20px 40px rgba(139, 92, 246, 0.5))',
          }}
        >
          📡
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            marginBottom: 15,
          }}
        >
          PhoneRadar
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: '#94a3b8',
          }}
        >
          BLE Radar & Thermal Imaging
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
