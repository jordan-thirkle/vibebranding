import { ImageResponse } from 'next/og'

export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }

export default function Image() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #2563eb 100%)',
        color: 'white', fontFamily: 'system-ui, sans-serif', padding: 60,
      }}>
        <div style={{ fontSize: 80, fontWeight: 800, marginBottom: 16, letterSpacing: -2 }}>
          VibeBranding
        </div>
        <div style={{ fontSize: 28, opacity: 0.9, textAlign: 'center', maxWidth: 700, lineHeight: 1.4 }}>
          AI Brand Identity Generator
        </div>
        <div style={{ fontSize: 18, opacity: 0.7, marginTop: 32, textAlign: 'center' }}>
          Transform your product idea into a complete brand system
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 48 }}>
          {['Strategy', 'Naming', 'Visual', 'Voice'].map(label => (
            <div key={label} style={{
              padding: '8px 20px', borderRadius: 100, background: 'rgba(255,255,255,0.15)',
              fontSize: 16, border: '1px solid rgba(255,255,255,0.2)',
            }}>
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
