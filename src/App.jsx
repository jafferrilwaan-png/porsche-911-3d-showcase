import React, { useState, useEffect } from 'react'
import Scene from './Scene'
import { useAudio } from './useAudio'
import './index.css'

const CAR_COLORS = [
  { key: 'gold',     hex: '#c9a84c', label: 'Aurum Gold Metallic' },
  { key: 'silver',   hex: '#8a9bb5', label: 'Glacier Silver Metallic' },
  { key: 'red',      hex: '#cc2222', label: 'Guards Red' },
  { key: 'white',    hex: '#e8e8f0', label: 'Carrara White Metallic' },
  { key: 'green',    hex: '#004f2d', label: 'Python Green' },
  { key: 'miami',    hex: '#00a3b5', label: 'Miami Blue' },
]

const SPECS = [
  { label: 'Engine',      value: '3.0T',   unit: 'Flat-6' },
  { label: 'Power',       value: '450',    unit: 'hp' },
  { label: '0–100',       value: '3.4',    unit: 's' },
  { label: 'Top Speed',   value: '308',    unit: 'km/h' },
  { label: 'Torque',      value: '530',    unit: 'Nm' },
  { label: 'Weight',      value: '1,515',  unit: 'kg' },
]

// ── PORSCHE CREST EMBLEM SVG ───────────────────────────────────────────────
function PorscheHorseLogo() {
  return (
    <svg width="42" height="48" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}>
      {/* Golden Shield Base Outline with Curved Top */}
      <path d="M50 5 C75 5 95 18 95 32 C95 65 95 85 50 115 C5 85 5 65 5 32 C5 18 25 5 50 5 Z" fill="#e2c168" stroke="#111111" strokeWidth="2.5" />
      <path d="M50 8 C72 8 91 20 91 32 C91 62 91 81 50 110 C9 81 9 62 9 32 C9 20 28 8 50 8 Z" fill="#e5c158" />

      {/* Top Banner Gold Background */}
      <path d="M12 11 C25 8 75 8 88 11 V26 H12 Z" fill="#e5c158" stroke="#111" strokeWidth="1" />
      
      {/* "PORSCHE" Curved Text Area */}
      <text x="50" y="21" fill="#111111" fontSize="9" fontWeight="900" textAnchor="middle" letterSpacing="0.8" fontFamily="Arial Black, Impact, sans-serif">PORSCHE</text>

      {/* Vertical and Horizontal Quarter Dividers */}
      <line x1="50" y1="26" x2="50" y2="110" stroke="#111111" strokeWidth="2" />
      <line x1="9" y1="58" x2="91" y2="58" stroke="#111111" strokeWidth="2" />

      {/* Quadrant 1 (Top-Left) & Quadrant 4 (Bottom-Right): Golden Antlers */}
      {/* Antlers Top-Left */}
      <g stroke="#111" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M18 36 C24 35 34 38 44 38" />
        <path d="M26 36 L24 32" />
        <path d="M34 37 L32 32" />
        
        <path d="M18 44 C24 43 34 46 44 46" />
        <path d="M26 44 L24 40" />
        <path d="M34 45 L32 40" />

        <path d="M18 52 C24 51 34 54 44 54" />
        <path d="M26 52 L24 48" />
        <path d="M34 53 L32 48" />
      </g>

      {/* Antlers Bottom-Right */}
      <g stroke="#111" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M56 68 C62 68 72 71 82 70" />
        <path d="M64 69 L66 64" />
        <path d="M74 70 L76 65" />

        <path d="M56 78 C62 78 72 81 82 80" />
        <path d="M64 79 L66 74" />
        <path d="M74 80 L76 75" />

        <path d="M56 88 C62 88 72 91 82 90" />
        <path d="M64 89 L66 84" />
        <path d="M74 90 L76 85" />
      </g>

      {/* Quadrant 2 (Top-Right) & Quadrant 3 (Bottom-Left): Red & Black Stripes */}
      {/* Top-Right Stripes */}
      <g>
        <rect x="51" y="27" width="39" height="7" fill="#cc0000" />
        <rect x="51" y="34" width="39" height="8" fill="#111111" />
        <rect x="51" y="42" width="39" height="8" fill="#cc0000" />
        <rect x="51" y="50" width="39" height="7" fill="#111111" />
      </g>

      {/* Bottom-Left Stripes */}
      <g>
        <path d="M10 59 H49 V66 H10 Z" fill="#cc0000" />
        <path d="M10 66 H49 V73 H10 Z" fill="#111111" />
        <path d="M10 73 H49 V80 H10 Z" fill="#cc0000" />
        <path d="M10 80 H49 V87 H10 Z" fill="#111111" />
        <path d="M12 87 H49 V94 H12 Z" fill="#cc0000" />
      </g>

      {/* Central Shield: Gold Base */}
      <path d="M36 44 C42 44 58 44 64 44 C64 58 64 68 50 82 C36 68 36 58 36 44 Z" fill="#d4af37" stroke="#111" strokeWidth="1.8" />
      <path d="M38 46 C43 46 57 46 62 46 C62 57 62 66 50 79 C38 66 38 57 38 46 Z" fill="#e5c158" />

      {/* Central Stuttgart Banner Text */}
      <text x="50" y="52" fill="#111111" fontSize="4.8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif" letterSpacing="0.2">STUTTGART</text>

      {/* Rearing Black Horse Silhouette */}
      <path d="M50 55 C46 56 44 59 46 62 C48 64 51 63 50 67 C49 71 45 72 47 75 C49 77 53 76 51 79 C54 77 55 72 53 69 C56 68 55 62 52 60 Z" fill="#111111" />
    </svg>
  )
}

// ── Loading Screen ────────────────────────────────────────────────────────────
function LoadingScreen({ progress, hidden }) {
  return (
    <div className={`loading-screen${hidden ? ' hidden' : ''}`}>
      <PorscheHorseLogo />
      <div className="loading-logo" style={{ marginTop: '12px' }}>PORSCHE 911</div>
      <div className="loading-bar-track">
        <div className="loading-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="loading-text">Loading Experience — {Math.round(progress)}%</p>
    </div>
  )
}

// ── Audio Icon SVG ──────────────────────────────────────────────────────────
function AudioIcon({ playing }) {
  return playing ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  )
}

// ── Main App Component ───────────────────────────────────────────────────────
export default function App() {
  const [carColor, setCarColor] = useState('gold')
  const [cameraMode, setCameraMode] = useState('overview')
  const [explodedWheel, setExplodedWheel] = useState(null)
  const [explodedBody, setExplodedBody] = useState(false)
  const [nitrousActive, setNitrousActive] = useState(false)
  const [engineOpen, setEngineOpen] = useState(false)
  const [hoveredColor, setHoveredColor] = useState(null)
  const [activeModal, setActiveModal] = useState(null) // 'discover' | 'specs'

  const handleCameraModeChange = (mode) => {
    setCameraMode(mode)
    setExplodedWheel(null)
    setExplodedBody(false)
    setNitrousActive(false)
    setEngineOpen(mode === 'rear') // auto-open hatch in rear mode
  }
  
  const [loadProgress, setLoadProgress] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const { playing, toggle } = useAudio()

  // Simulated load progress
  useEffect(() => {
    let p = 0
    const iv = setInterval(() => {
      p += Math.random() * 14 + 5
      if (p >= 100) {
        p = 100
        setLoadProgress(100)
        clearInterval(iv)
        setTimeout(() => setLoaded(true), 500)
      } else {
        setLoadProgress(p)
      }
    }, 120)
    return () => clearInterval(iv)
  }, [])

  // Dynamic CSS variable color-sync for non-hero text details and accents
  useEffect(() => {
    const activeColorObj = CAR_COLORS.find(c => c.key === carColor)
    if (activeColorObj) {
      document.documentElement.style.setProperty('--accent-dynamic', activeColorObj.hex)
      document.documentElement.style.setProperty('--accent-dynamic-glow', `${activeColorObj.hex}55`)
    }
  }, [carColor])

  const activeColorLabel = hoveredColor
    ? CAR_COLORS.find(c => c.key === hoveredColor)?.label
    : CAR_COLORS.find(c => c.key === carColor)?.label

  return (
    <>
      {/* Loading Screen */}
      <LoadingScreen progress={loadProgress} hidden={loaded} />

      {/* 3D Canvas Scene */}
      <div className="canvas-wrapper">
        <Scene 
          color={carColor} 
          cameraMode={cameraMode}
          setCameraMode={setCameraMode}
          explodedWheel={explodedWheel}
          setExplodedWheel={setExplodedWheel}
          explodedBody={explodedBody}
          setExplodedBody={setExplodedBody}
          engineOpen={engineOpen}
          setEngineOpen={setEngineOpen}
          nitrousActive={nitrousActive}
          setNitrousActive={setNitrousActive}
        />
      </div>

      {/* Ambient Lighting & Grid Gradients */}
      <div className="ambient-gradient" />
      <div className="grid-overlay" />
      <div className="glow-line" />

      {/* UI Overlay Layer */}
      <div className="ui-layer">

        {/* ── NAVBAR WITH PORSCHE HORSE EMBLEM & CAMERA PRESETS ── */}
        <nav className="navbar animate-up">
          <div className="navbar-logo" onClick={() => handleCameraModeChange('overview')}>
            <PorscheHorseLogo />
            <span className="navbar-brand" style={{ marginLeft: '10px' }}>Porsche <span>911</span></span>
          </div>

          {/* Clean Glassmorphic Camera Controls in Navbar */}
          <div className="navbar-nav prism-nav">
            <button 
              className={`nav-btn ${cameraMode === 'overview' ? 'active' : ''}`} 
              onClick={() => handleCameraModeChange('overview')}
            >
              Overview
            </button>
            <button 
              className={`nav-btn ${cameraMode === 'interior' ? 'active' : ''}`} 
              onClick={() => handleCameraModeChange('interior')}
            >
              Interior
            </button>
            <button 
              className={`nav-btn ${cameraMode === 'wheel' ? 'active' : ''}`} 
              onClick={() => handleCameraModeChange('wheel')}
            >
              Wheel & Tire
            </button>
            <button 
              className={`nav-btn ${cameraMode === 'rear' ? 'active' : ''}`} 
              onClick={() => handleCameraModeChange('rear')}
            >
              Rear
            </button>
          </div>

          <button
            className="btn-primary"
            style={{ padding: '10px 22px' }}
            onClick={() => setActiveModal('discover')}
          >
            Discover More
          </button>
        </nav>

        {/* ── HERO SECTION ── */}
        <div className={`hero-section animate-left${(explodedWheel || explodedBody) ? ' hide-panel' : ''}`} style={{ pointerEvents: 'all' }}>
          <p className="hero-eyebrow">Carrera S · 2024 Edition</p>
          <h1 className="hero-title">
            The Art of<br />
            <span className="highlight">Performance</span>
          </h1>
          <p className="hero-subtitle">
            <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>Engineered to perfection.</span> A 3.0L flat-six twin-turbo masterpiece delivering 450 hp with iconic rear-engine balance. Pure driving emotion.
          </p>
          <div className="btn-group">
            <button className="btn-primary" onClick={() => setActiveModal('discover')}>
              Explore Heritage
            </button>
            <button className="btn-secondary" onClick={() => setActiveModal('specs')}>
              View Specs
            </button>
          </div>
        </div>

        {/* ── TIRE PERFORMANCE CARD (Apple VisionOS Glassmorphism UI) ── */}
        <div className={`tire-card glass-card ${explodedWheel ? 'active' : ''}`} style={{ pointerEvents: 'all' }}>
          <div className="tire-card-glow" />
          <div className="tire-card-header">
            <span className="tire-card-title">Tire Performance</span>
            <button className="tire-card-close" onClick={() => setExplodedWheel(null)}>✕</button>
          </div>
          <div className="tire-spec-grid">
            <div className="tire-spec-box">
              <span className="tire-spec-lbl">Alloy Rim</span>
              <span className="tire-spec-val">20" / 21" Carrera S</span>
            </div>
            <div className="tire-spec-box">
              <span className="tire-spec-lbl">Compound</span>
              <span className="tire-spec-val">Cup 2 Dual-Compound</span>
            </div>
            <div className="tire-spec-box">
              <span className="tire-spec-lbl">Front Tire</span>
              <span className="tire-spec-val">245/35 ZR 20</span>
            </div>
            <div className="tire-spec-box">
              <span className="tire-spec-lbl">Rear Tire</span>
              <span className="tire-spec-val">305/30 ZR 21</span>
            </div>
            <div className="tire-spec-box">
              <span className="tire-spec-lbl">Pressure</span>
              <span className="tire-spec-val">2.2 Bar / 32 PSI</span>
            </div>
            <div className="tire-spec-box">
              <span className="tire-spec-lbl">Optimal Temp</span>
              <span className="tire-spec-val">24°C / 75°F</span>
            </div>
          </div>
          <p className="tire-desc">
            Featuring <strong style={{ color: 'var(--accent-dynamic)' }}>Michelin Pilot Sport Cup 2</strong> motorsport tires, optimized specifically for track stability and rapid thermal dispersion during extreme cornering.
          </p>
        </div>

        {/* ── CABIN & CHASSIS SPECS CARD (Apple VisionOS Glassmorphism UI) ── */}
        <div className={`tire-card glass-card ${explodedBody ? 'active' : ''}`} style={{ pointerEvents: 'all' }}>
          <div className="tire-card-glow" />
          <div className="tire-card-header">
            <span className="tire-card-title">Chassis & Cockpit</span>
            <button className="tire-card-close" onClick={() => setExplodedBody(false)}>✕</button>
          </div>
          <div className="tire-spec-grid">
            <div className="tire-spec-box">
              <span className="tire-spec-lbl">Cabin Shell</span>
              <span className="tire-spec-val">Laminated Safety Glass</span>
            </div>
            <div className="tire-spec-box">
              <span className="tire-spec-lbl">Trim</span>
              <span className="tire-spec-val">Carbon Fiber Structural</span>
            </div>
            <div className="tire-spec-box">
              <span className="tire-spec-lbl">Seats</span>
              <span className="tire-spec-val">Leather Bucket Seats</span>
            </div>
            <div className="tire-spec-box">
              <span className="tire-spec-lbl">Spoiler</span>
              <span className="tire-spec-val">Adaptive Clamshell Wing</span>
            </div>
            <div className="tire-spec-box">
              <span className="tire-spec-lbl">Chassis Core</span>
              <span className="tire-spec-val">Integrated Steel Cage</span>
            </div>
            <div className="tire-spec-box">
              <span className="tire-spec-lbl">Stage Rim</span>
              <span className="tire-spec-val">Synced LED Color Ring</span>
            </div>
          </div>
          <p className="tire-desc">
            The clamshell view exposes the detailed <strong style={{ color: 'var(--accent-dynamic)' }}>GT3 Sport Package</strong> cabin, including carbon trim layers, leather steering accents, and the rear-mounted boxer engine chassis.
          </p>
        </div>

        {/* ── SPECS PANEL (RIGHT SIDE) ── */}
        <div className={`specs-panel glass-card animate-right${(explodedWheel || explodedBody) ? ' hide-panel-right' : ''}`} style={{ pointerEvents: 'all' }}>
          <p className="specs-title">Technical Specs</p>
          {SPECS.map(spec => (
            <div key={spec.label} className="spec-item">
              <span className="spec-label">{spec.label}</span>
              <span className="spec-value">
                {spec.value}
                <span className="spec-unit">{spec.unit}</span>
              </span>
            </div>
          ))}
        </div>

        {/* ── REAR CAMERA HUD CONTROLS (Engine & Nitrous NOS Toggles) ── */}
        {cameraMode === 'rear' && (
          <div className="rear-controls-hud animate-up" style={{ pointerEvents: 'all' }}>
            <button 
              className={`hud-btn ${engineOpen ? 'active' : ''}`}
              onClick={() => setEngineOpen(prev => !prev)}
            >
              <span style={{ fontSize: '14px' }}>🔧</span> 
              {engineOpen ? 'Close Engine Lid' : 'Showcase Engine'}
            </button>
            <button 
              className={`hud-btn ${nitrousActive ? 'active' : ''}`}
              onClick={() => setNitrousActive(prev => !prev)}
            >
              <span style={{ fontSize: '14px' }}>🔥</span> 
              {nitrousActive ? 'Deactivate NOS' : 'Activate Nitrous'}
            </button>
          </div>
        )}

        {/* ── COLOR PICKER BAR (BOTTOM CENTER) ── */}
        <div className="color-picker-container" style={{ pointerEvents: 'all' }}>
          <p className="color-label-text">{activeColorLabel}</p>
          <div className="color-picker">
            <p className="color-picker-label">Exterior Paint Finish</p>
            <div className="color-swatches">
              {CAR_COLORS.map(c => (
                <div
                  key={c.key}
                  className={`color-swatch${carColor === c.key ? ' active' : ''}`}
                  style={{
                    background: c.hex,
                    boxShadow: carColor === c.key ? `0 0 14px ${c.hex}99` : 'none',
                  }}
                  title={c.label}
                  onClick={() => setCarColor(c.key)}
                  onMouseEnter={() => setHoveredColor(c.key)}
                  onMouseLeave={() => setHoveredColor(null)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── CAMERA CONTROLS HINT ── */}
        <div className="controls-hint">
          <div className="hint-item">
            <span className="hint-key">drag</span> Rotate Scene
          </div>
          <div className="hint-item">
            <span className="hint-key">scroll</span> Zoom
          </div>
        </div>

        {/* ── AUDIO TOGGLE ── */}
        <button
          className={`audio-toggle${playing ? ' playing' : ''}`}
          onClick={toggle}
          title={playing ? 'Mute Flat-6 Sound' : 'Play Engine Sound'}
        >
          <AudioIcon playing={playing} />
        </button>

      </div>

      {/* ========================================================================= */}
      {/* ── MODALS ── */}
      {/* ========================================================================= */}

      {/* 1. TECH SPECS MODAL */}
      {activeModal === 'specs' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-content glass-modal animate-up" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Porsche 911 Carrera S — Technical Specs</h2>
              <button className="close-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            
            <div className="specs-full-grid">
              <div className="spec-box">
                <span className="spec-box-label">Engine Layout</span>
                <span className="spec-box-val">Rear-Engine Flat-6</span>
              </div>
              <div className="spec-box">
                <span className="spec-box-label">Displacement</span>
                <span className="spec-box-val">2,981 cc</span>
              </div>
              <div className="spec-box">
                <span className="spec-box-label">Max Power</span>
                <span className="spec-box-val">450 hp @ 6,500 rpm</span>
              </div>
              <div className="spec-box">
                <span className="spec-box-label">Max Torque</span>
                <span className="spec-box-val">530 Nm @ 2,300–5,000 rpm</span>
              </div>
              <div className="spec-box">
                <span className="spec-box-label">Transmission</span>
                <span className="spec-box-val">8-speed PDK Dual-Clutch</span>
              </div>
              <div className="spec-box">
                <span className="spec-box-label">Acceleration 0–100</span>
                <span className="spec-box-val">3.4 s (Sport Chrono)</span>
              </div>
            </div>

            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <h4 style={{ fontSize: '12px', color: 'var(--accent-gold)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Acoustic Engineering</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Equipped with sports exhaust system featuring twin central tailpipes in black stainless steel and active acoustic sound valves.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. HERITAGE & DISCOVER MODAL */}
      {activeModal === 'discover' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-content glass-modal animate-up" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>The Heritage of Ferdinand Porsche</h2>
              <button className="close-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '16px' }}>
              Since 1963, the Porsche 911 has been the benchmark for sports cars worldwide. With its iconic flyline silhouette, rear-mounted boxer engine, and unyielding commitment to precision engineering, every 911 is built to translate power into pure driving exhilaration.
            </p>
            <div className="heritage-stats">
              <div><h3>60+</h3><span>Years of Evolution</span></div>
              <div><h3>30,000+</h3><span>Race Victories</span></div>
              <div><h3>100%</h3><span>Porsche DNA</span></div>
            </div>
          </div>
        </div>
      )}

    </>
  )
}


