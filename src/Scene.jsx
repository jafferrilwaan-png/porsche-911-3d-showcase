import React, { useRef, useEffect, Suspense, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF, ContactShadows, Float, MeshReflectorMaterial } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, ToneMapping } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'

// Color Map
const CAR_COLORS = {
  gold:     '#c9a84c',
  silver:   '#8a9bb5',
  red:      '#cc2222',
  white:    '#f0f2f8',
  green:    '#004f2d',
  miami:    '#00a3b5',
}

// ── Porsche 911 Model Component with Sunglasses Glass & Interactive Exploded Configuration ───────
function PorscheModel({ 
  color = 'gold', 
  explodedWheel = null, 
  setExplodedWheel, 
  setCameraMode, 
  explodedBody = false, 
  setExplodedBody,
  engineOpen = false,
  setEngineOpen,
  nitrousActive = false,
  setNitrousActive
}) {
  const gltf = useGLTF('/model.glb')
  const groupRef = useRef()
  const initialPositions = useRef(new Map())
  const nitrousGroupRef = useRef()

  // Store initial positions of ALL meshes once on load
  useEffect(() => {
    if (!gltf.scene) return
    gltf.scene.traverse((child) => {
      if (child.isMesh && !initialPositions.current.has(child.uuid)) {
        initialPositions.current.set(child.uuid, child.position.clone())
      }
    })
  }, [gltf.scene])

  // Material and mesh binding
  useEffect(() => {
    if (!gltf.scene) return
    const bodyHex = CAR_COLORS[color] || CAR_COLORS.gold

    gltf.scene.traverse((child) => {
      if (child.isMesh && child.material) {
        const name = (child.name || '').toLowerCase()
        const matName = (child.material.name || '').toLowerCase()

        // Exterior Body Paint
        if (
          matName.includes('body') ||
          matName.includes('paint') ||
          matName.includes('exterior') ||
          name.includes('body') ||
          name.includes('hood') ||
          name.includes('fender') ||
          name.includes('door')
        ) {
          child.material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(bodyHex),
            metalness: 0.92,
            roughness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.03,
            reflectivity: 1.0,
            envMapIntensity: 2.8,
          })
        }

        // Interior Leather
        else if (
          matName.includes('leather') ||
          name.includes('leather') ||
          name.includes('steering_leather') ||
          matName.includes('interior_light') ||
          name.includes('interior_light')
        ) {
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#1c1c22'),
            roughness: 0.5,
            metalness: 0.1,
            envMapIntensity: 1.2,
          })
        }

        // Dark Interior Trim
        else if (
          matName.includes('interior_dark') ||
          name.includes('interior_dark') ||
          matName.includes('carpet') ||
          name.includes('carpet')
        ) {
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#0d0d12'),
            roughness: 0.9,
            metalness: 0.05,
          })
        }

        // Carbon Fiber
        else if (
          matName.includes('carbon') ||
          name.includes('carbon') ||
          name.includes('steering_carbon')
        ) {
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#16161c'),
            metalness: 0.85,
            roughness: 0.1,
            envMapIntensity: 2.0,
          })
        }

        // Chrome Accents
        else if (
          matName.includes('chrome') ||
          name.includes('chrome') ||
          name.includes('steering_metal')
        ) {
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#f0f4f8'),
            metalness: 1.0,
            roughness: 0.02,
            envMapIntensity: 3.2,
          })
        }

        // Wheel Rims
        else if (
          name.includes('wheel') ||
          name.includes('rim_') ||
          name.includes('centre')
        ) {
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#c9a84c'),
            metalness: 0.95,
            roughness: 0.18,
            envMapIntensity: 2.8,
          })
        }

        // Brake Calipers
        else if (name.includes('brake') || name.includes('brakes')) {
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#cc0000'),
            metalness: 0.7,
            roughness: 0.2,
            envMapIntensity: 1.6,
          })
        }

        // Tires
        else if (name.includes('tire') || matName.includes('tires')) {
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#141418'),
            roughness: 0.8,
            metalness: 0.05,
          })
        }

        // 🕶️ High-Fidelity Sunglasses Dark Window Glass (Polarized Window Tint)
        else if (matName.includes('glass_gray') || name.includes('glass')) {
          child.material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#101115'),
            transparent: true,
            opacity: 0.88,
            roughness: 0.04,
            transmission: 0.18,
            ior: 1.52,
            reflectivity: 0.98,
            clearcoat: 1.0,
            clearcoatRoughness: 0.02,
            envMapIntensity: 3.5,
          })
        }

        // Emissive Lights
        else if (matName.includes('taillight') || name.includes('lights_red')) {
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#ff0022'),
            emissive: new THREE.Color('#ff021e'),
            emissiveIntensity: 5.0,
            roughness: 0.1,
          })
        } else if (matName.includes('projector') || name.includes('leds')) {
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#ffffff'),
            emissive: new THREE.Color('#e0f0ff'),
            emissiveIntensity: 5.5,
            roughness: 0.05,
          })
        }

        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [gltf.scene, color])

  // 60fps Exploded parts and exhaust flicker interpolations
  useFrame(({ clock }) => {
    if (!gltf.scene) return
    const t = clock.getElapsedTime()

    // 1. Nitrous flicker vibration
    if (nitrousGroupRef.current) {
      const s = 1.0 + Math.sin(t * 50) * 0.18
      nitrousGroupRef.current.scale.set(
        1.0 + Math.cos(t * 35) * 0.05,
        1.0 + Math.cos(t * 35) * 0.05,
        s
      )
    }

    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        const name = child.name.toLowerCase()
        const initialPos = initialPositions.current.get(child.uuid)
        if (initialPos) {
          // ── 1. Wheel assembly horizontal explosion ──
          const isWheelPart = /tire|rim|wheel|brake|caliper|disc/.test(name)
          if (isWheelPart) {
            let corner = 'fl'
            if (name.includes('_fl')) corner = 'fl'
            else if (name.includes('_fr')) corner = 'fr'
            else if (name.includes('_rl')) corner = 'rl'
            else if (name.includes('_rr')) corner = 'rr'
            else {
              // fallback to initial coordinate signs
              if (initialPos.z > 0.1) {
                corner = initialPos.x > 0 ? 'fl' : 'fr'
              } else {
                corner = initialPos.x > 0 ? 'rl' : 'rr'
              }
            }

            let targetOffset = 0
            if (explodedWheel === corner) {
              if (name.includes('tire')) {
                targetOffset = 0.62 // Tire slides furthest
              } else if (name.includes('rim') || name.includes('wheel')) {
                targetOffset = 0.32 // Alloy wheel sits in center-outward
              } else if (name.includes('brake') || name.includes('caliper')) {
                targetOffset = 0.12 // Rotor moves slightly to show suspension
              }
            }

            // Direction multiplier based on side of car (outward along local X)
            const dir = (corner === 'fl' || corner === 'rl') ? 1 : -1
            const targetX = initialPos.x + targetOffset * dir
            child.position.x = THREE.MathUtils.lerp(child.position.x, targetX, 0.15)
          }

          // ── 2. Body shell vertical/horizontal multidirectional exploded view ──
          // Include outer shell panels, glass, chrome rails. Exclude grills/wheels/steering/brakes.
          const isBodyShell = 
            /body|glass|trim|chrome|carbon|wipers|leds|lights/.test(name) && 
            !/wheel|rim|steering|brake|caliper|disc|grill/.test(name)
            
          if (isBodyShell) {
            let targetX = initialPos.x
            let targetY = initialPos.y
            let targetZ = initialPos.z

            if (explodedBody) {
              if (name.includes('body')) {
                targetZ = initialPos.z + 0.65
              } else if (name.includes('glass')) {
                targetY = initialPos.y + 0.75
              } else if (name.includes('trim') || name.includes('carbon')) {
                targetZ = initialPos.z - 0.55
              } else if (name.includes('chrome')) {
                const side = Math.sign(initialPos.x) || 1
                targetX = initialPos.x + 0.3 * side
              } else if (name.includes('wipers')) {
                targetY = initialPos.y + 0.3
              } else if (name.includes('lights_red')) {
                targetZ = initialPos.z - 0.6
              } else if (name.includes('lights') || name.includes('leds')) {
                targetZ = initialPos.z + 0.6
              }
            }

            child.position.x = THREE.MathUtils.lerp(child.position.x, targetX, 0.15)
            child.position.y = THREE.MathUtils.lerp(child.position.y, targetY, 0.15)
            child.position.z = THREE.MathUtils.lerp(child.position.z, targetZ, 0.15)
          }

          // ── 3. Engine cover / rear lid hatch opening ──
          if (name.includes('grill')) {
            let targetX = initialPos.x
            let targetY = initialPos.y
            let targetZ = initialPos.z
            let targetRXRot = 0

            if (explodedBody) {
              // Slides back as part of full body explosion
              targetZ = initialPos.z - 0.55
            } else if (engineOpen) {
              // Rotates upward like a hatch lid
              targetY = initialPos.y + 0.14
              targetZ = initialPos.z - 0.08
              targetRXRot = -0.38
            }

            child.position.x = THREE.MathUtils.lerp(child.position.x, targetX, 0.15)
            child.position.y = THREE.MathUtils.lerp(child.position.y, targetY, 0.15)
            child.position.z = THREE.MathUtils.lerp(child.position.z, targetZ, 0.15)
            child.rotation.x = THREE.MathUtils.lerp(child.rotation.x, targetRXRot, 0.15)
          }
        }
      }
    })
  })

  return (
    <group 
      ref={groupRef} 
      position={[0, -0.62, 0]} 
      scale={1.42}
      onClick={(e) => {
        e.stopPropagation()
        const name = e.object.name.toLowerCase()
        const isWheelPart = /tire|rim|wheel|brake|caliper|disc/.test(name)
        
        // Find click coordinate in world space to detect hot zones
        const wp = new THREE.Vector3()
        e.object.getWorldPosition(wp)

        // ── A. Tapping exhaust tailpipe zone (Nitrous NOS Activation) ──
        if (wp.z < -1.35 && wp.y < -0.3) {
          setNitrousActive(prev => !prev)
          return
        }

        // ── B. Tapping engine cover deck (rear lid hatch opening) ──
        if (wp.z < -1.1 && wp.y >= -0.3 && !isWheelPart) {
          setEngineOpen(prev => !prev)
          return
        }
        
        // ── C. Wheel assembly click ──
        if (isWheelPart) {
          let corner = 'fl'
          if (wp.z > 0.15) {
            corner = wp.x > 0 ? 'fl' : 'fr'
          } else if (wp.z < -0.15) {
            corner = wp.x > 0 ? 'rl' : 'rr'
          }
          setExplodedBody(false)
          setExplodedWheel(prev => prev === corner ? null : corner)
          setCameraMode('wheel')
        } 
        // ── D. Body panels click ──
        else {
          const isBodyShell = /body|glass|trim|chrome|carbon|wipers|leds|lights|grill/.test(name)
          if (isBodyShell) {
            setExplodedWheel(null)
            setExplodedBody(prev => !prev)
            setCameraMode('overview')
          }
        }
      }}
    >
      <primitive object={gltf.scene} />

      {/* 💥 Nitrous NOS Blue Thrust Flames (Flickers at exhaust pipes) */}
      {nitrousActive && (
        <group ref={nitrousGroupRef}>
          {/* Left exhaust cone flame */}
          <mesh position={[-0.14, -0.34, -1.82]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.07, 0.7, 16]} />
            <meshBasicMaterial 
              color="#00eeff" 
              transparent 
              opacity={0.8} 
              blending={THREE.AdditiveBlending} 
            />
          </mesh>
          <mesh position={[-0.14, -0.34, -1.82]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.04, 0.8, 16]} />
            <meshBasicMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.9} 
              blending={THREE.AdditiveBlending} 
            />
          </mesh>

          {/* Right exhaust cone flame */}
          <mesh position={[0.14, -0.34, -1.82]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.07, 0.7, 16]} />
            <meshBasicMaterial 
              color="#00eeff" 
              transparent 
              opacity={0.8} 
              blending={THREE.AdditiveBlending} 
            />
          </mesh>
          <mesh position={[0.14, -0.34, -1.82]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.04, 0.8, 16]} />
            <meshBasicMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.9} 
              blending={THREE.AdditiveBlending} 
            />
          </mesh>
        </group>
      )}
    </group>
  )
}


// ── 3D Glass Showroom Pavilion with Flickering Aura Flame ────────────────────
function GlassShowroom({ color }) {
  const ringColor = CAR_COLORS[color] || CAR_COLORS.gold

  // Breathtaking, hyper-realistic glass material parameters
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#f0f9ff'),
    transparent: true,
    opacity: 0.12,
    roughness: 0.02,
    metalness: 0.05,
    transmission: 0.96,
    ior: 1.52,
    reflectivity: 0.98,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    thickness: 0.8,
    depthWrite: false,
    side: THREE.DoubleSide,
  })

  // Sleek, highly polished chrome structural frames and pillars
  const chromeMat = new THREE.MeshStandardMaterial({
    color: '#e8ecfb',
    metalness: 1.0,
    roughness: 0.04,
  })

  // Flame layer refs for procedural flickering aura math in 60fps render loops
  const flame1Ref = useRef()
  const flame2Ref = useRef()
  const flame3Ref = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (flame1Ref.current) {
      const s = 1 + Math.sin(t * 7.5) * 0.035 + Math.cos(t * 3.2) * 0.015
      flame1Ref.current.scale.set(s, s, 1)
      flame1Ref.current.material.opacity = 0.38 + Math.sin(t * 11) * 0.06
      flame1Ref.current.rotation.z = t * 0.14
    }
    if (flame2Ref.current) {
      const s = 1.06 + Math.cos(t * 5.8) * 0.045 + Math.sin(t * 2.1) * 0.02
      flame2Ref.current.scale.set(s, s, 1)
      flame2Ref.current.material.opacity = 0.26 + Math.cos(t * 9) * 0.05
      flame2Ref.current.rotation.z = -t * 0.18
    }
    if (flame3Ref.current) {
      const s = 1.12 + Math.sin(t * 3.8) * 0.06
      flame3Ref.current.scale.set(s, s, 1)
      flame3Ref.current.material.opacity = 0.14 + Math.sin(t * 6) * 0.04
      flame3Ref.current.rotation.z = t * 0.09
    }
  })

  // Elegant Curved Glass Wall Panels & Polished Chrome Structural Frames
  const walls = []
  const count = 8
  const radius = 6.4
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    walls.push(
      <group key={i} position={[x, 1.8, z]} rotation={[0, -angle + Math.PI / 2, 0]}>
        {/* Main Glass Pane */}
        <mesh material={glassMat}>
          <planeGeometry args={[4.2, 5.0]} />
        </mesh>
        {/* Sleek Chrome Columns (Double rod modern architecture) */}
        <mesh position={[-2.1, 0, 0]} material={chromeMat}>
          <cylinderGeometry args={[0.035, 0.035, 5.0, 16]} />
        </mesh>
        <mesh position={[2.1, 0, 0]} material={chromeMat}>
          <cylinderGeometry args={[0.035, 0.035, 5.0, 16]} />
        </mesh>
        {/* Top/Bottom Horizontal Beveled Chrome Rails */}
        <mesh position={[0, 2.5, 0]} material={chromeMat}>
          <boxGeometry args={[4.2, 0.05, 0.08]} />
        </mesh>
        <mesh position={[0, -2.5, 0]} material={chromeMat}>
          <boxGeometry args={[4.2, 0.05, 0.08]} />
        </mesh>
      </group>
    )
  }

  // Radial structural roof trusses
  const trusses = []
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    trusses.push(
      <mesh key={i} position={[Math.cos(angle) * 3.2, 4.3, Math.sin(angle) * 3.2]} rotation={[0, -angle, 0]} material={chromeMat}>
        <boxGeometry args={[6.4, 0.04, 0.04]} />
      </mesh>
    )
  }

  return (
    <group position={[0, -0.63, 0]}>
      {/* Structural Glass Walls */}
      {walls}

      {/* Modern Radial Chrome Trusses */}
      {trusses}

      {/* Hyper-realistic Glass & Chrome Roof (Allows ambient sky light to shine through) */}
      <mesh position={[0, 4.3, 0]} rotation={[Math.PI / 2, 0, 0]} material={glassMat}>
        <ringGeometry args={[0.2, 6.3, 64]} />
      </mesh>
      {/* Polished Chrome Roof Outer Rim */}
      <mesh position={[0, 4.31, 0]} rotation={[Math.PI / 2, 0, 0]} material={chromeMat}>
        <ringGeometry args={[6.3, 6.4, 64]} />
      </mesh>

      {/* Ceiling LED Ring Light */}
      <mesh position={[0, 4.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.2, 4.4, 64]} />
        <meshStandardMaterial color="#ffffff" emissive="#e0f2ff" emissiveIntensity={3.0} side={THREE.DoubleSide} />
      </mesh>

      {/* Elegant Golden Circular Stage Rim */}
      <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 2.9, 64]} />
        <meshStandardMaterial color={ringColor} emissive={ringColor} emissiveIntensity={4.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Flame Layer 1 */}
      <mesh ref={flame1Ref} position={[0, 0.012, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 3.2, 64]} />
        <meshBasicMaterial 
          color={ringColor} 
          transparent={true} 
          opacity={0.35} 
          blending={THREE.AdditiveBlending} 
          side={THREE.DoubleSide} 
          depthWrite={false}
        />
      </mesh>

      {/* Flame Layer 2 */}
      <mesh ref={flame2Ref} position={[0, 0.014, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 3.4, 64]} />
        <meshBasicMaterial 
          color={ringColor} 
          transparent={true} 
          opacity={0.22} 
          blending={THREE.AdditiveBlending} 
          side={THREE.DoubleSide} 
          depthWrite={false}
        />
      </mesh>

      {/* Flame Layer 3 */}
      <mesh ref={flame3Ref} position={[0, 0.016, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 3.6, 64]} />
        <meshBasicMaterial 
          color={ringColor} 
          transparent={true} 
          opacity={0.12} 
          blending={THREE.AdditiveBlending} 
          side={THREE.DoubleSide} 
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// ── Photorealistic Mirror Reflector Ground Floor ─────────────────────────────
function GroundReflection({ color }) {
  return (
    <>
      <ContactShadows
        position={[0, -0.625, 0]}
        opacity={0.9}
        scale={22}
        blur={2.4}
        far={8}
        color={color}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.63, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <MeshReflectorMaterial
          blur={[400, 100]}
          resolution={1024}
          mirror={0.8}
          mixBlur={0.65}
          mixStrength={2.5}
          roughness={0.03}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#06070d"
          metalness={0.85}
        />
      </mesh>
    </>
  )
}

// ── Ambient Floating Particles ──────────────────────────────────────────────
function Particles({ count = 120 }) {
  const mesh = useRef()
  const positions = new Float32Array(count * 3)
  const speeds = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 24
    positions[i * 3 + 1] = Math.random() * 10 - 1
    positions[i * 3 + 2] = (Math.random() - 0.5) * 24
    speeds[i] = 0.2 + Math.random() * 0.6
  }

  useFrame(() => {
    if (!mesh.current) return
    const pos = mesh.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += speeds[i] * 0.005
      if (pos[i * 3 + 1] > 10) pos[i * 3 + 1] = -1
    }
    mesh.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#e2c168"
        transparent
        opacity={0.65}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

// ── Guided Tour Coordinates Timeline ─────────────────────────────────────────
// Car model: world Y = -0.62, scale 1.42. Roof ~Y 0.85.
// Interior shots approach from ABOVE and OUTSIDE to avoid clipping the chassis.
const TOURS = {
  overview: [
    { pos: [5.5, 1.8, 7.5], look: [0, 0.2, 0], orbit: true }
  ],
  interior: [
    // 1. Bird-eye top-down: above roof looking straight into cabin
    { pos: [0.0,  3.2,  0.6],  look: [0, 0.2, 0],    orbit: false },
    // 2. Windshield hero: outside front glass angled down at steering wheel
    { pos: [0.0,  1.4,  2.8],  look: [0, 0.3, 0.2],  orbit: false },
    // 3. Driver window: outside left, looking across at gauge cluster
    { pos: [2.6,  1.0,  0.5],  look: [0, 0.25, 0.1], orbit: false },
    // 4. Rear quarter: outside rear-right elevated, looking forward into cabin
    { pos: [1.8,  1.6, -2.2],  look: [0, 0.5, 0.4],  orbit: false },
  ],
  wheel: [
    // Camera circles each wheel from outside the car body
    { pos: [ 2.6, 0.5,  2.4],  look: [ 0.9, -0.15,  0.9],  orbit: false }, // Front-Left
    { pos: [ 2.6, 0.5, -2.4],  look: [ 0.9, -0.15, -0.9],  orbit: false }, // Front-Right
    { pos: [-2.6, 0.5, -2.4],  look: [-0.9, -0.15, -0.9],  orbit: false }, // Rear-Right
    { pos: [-2.6, 0.5,  2.4],  look: [-0.9, -0.15,  0.9],  orbit: false }, // Rear-Left
  ],
  rear: [
    { pos: [0.0,  0.7,  -4.5], look: [0, 0.2,  0],    orbit: false }, // Emblem & light bar
    { pos: [0.0,  1.6,  -3.8], look: [0, 0.75, 0],    orbit: false }, // Spoiler & grille
    { pos: [1.0,  0.6,  -4.0], look: [0, 0.3, -0.3],  orbit: false }, // Exhaust detail
  ]
}

// ── Camera Controller (Cinematic Intro & Auto-Rotate Idle Timers) ────────────
const WHEEL_VIEWS = {
  fl: { pos: [ 1.8, -0.22,  1.8],  look: [ 0.85, -0.62,  0.82] },
  fr: { pos: [ 1.8, -0.22, -1.8],  look: [ 0.85, -0.62, -0.82] },
  rr: { pos: [-1.8, -0.22, -1.8],  look: [-0.85, -0.62, -0.82] },
  rl: { pos: [-1.8, -0.22,  1.8],  look: [-0.85, -0.62,  0.82] },
}

function CameraRig({ 
  cameraMode, 
  isAutoRotating, 
  setIsAutoRotating, 
  lastInteraction, 
  explodedWheel = null, 
  explodedBody = false 
}) {
  const { camera, controls } = useThree()
  
  // Guided tour and transition states
  const [stepIndex, setStepIndex] = useState(0)
  const timeInStep = useRef(0)
  const [transitioning, setTransitioning] = useState(false)
  
  // Target values to lerp towards
  const targetPos = useRef(new THREE.Vector3(5.5, 1.8, 7.5))
  const targetLook = useRef(new THREE.Vector3(0, 0, 0))

  // Seamless rotation angle tracking
  const wasAutoRotating = useRef(isAutoRotating)
  const angleOffset = useRef(0)
  const startTimer = useRef(0)

  // Cinematic Intro State (Starting camera angle high above)
  const [introActive, setIntroActive] = useState(true)

  // Set initial position immediately on rig mount
  useEffect(() => {
    camera.position.set(0, 15, 0.1)
    if (controls) {
      controls.target.set(0, 0, 0)
      controls.update()
    }
  }, [])

  // Calculate coordinates when cameraMode changes
  useEffect(() => {
    const tourList = TOURS[cameraMode] || TOURS.overview
    const firstStep = tourList[0]
    targetPos.current.set(...firstStep.pos)
    targetLook.current.set(...firstStep.look)

    setStepIndex(0)
    timeInStep.current = 0
    setTransitioning(true)
    setIsAutoRotating(false) // Disable autoRotate during transition slide
    if (cameraMode !== 'overview') {
      setIntroActive(false)
    }
  }, [cameraMode])

  useFrame(({ clock }, delta) => {
    const carShiftX = (explodedWheel || explodedBody) ? 1.35 : 0

    // 0. Cinematic Intro glide down
    if (introActive) {
      const overviewPos = new THREE.Vector3(5.5, 1.8, 7.5)
      camera.position.lerp(overviewPos, delta * 1.5)
      
      if (controls) {
        controls.target.lerp(new THREE.Vector3(0, 0, 0), delta * 1.5)
        controls.update()
      } else {
        camera.lookAt(new THREE.Vector3(0, 0, 0))
      }

      if (camera.position.distanceTo(overviewPos) < 0.1) {
        setIntroActive(false)
        setIsAutoRotating(true)
      }
      return
    }

    // 1. Automated camera glide transition (initial slide to target/step)
    if (transitioning) {
      const targetP = new THREE.Vector3().copy(targetPos.current)
      const targetL = new THREE.Vector3().copy(targetLook.current)
      
      // Shift target coordinates based on active card X-offset
      targetP.x += carShiftX
      targetL.x += carShiftX

      camera.position.lerp(targetP, delta * 3.5)
      if (controls) {
        controls.target.lerp(targetL, delta * 3.5)
        controls.update()
      } else {
        camera.lookAt(targetL)
      }

      if (camera.position.distanceTo(targetP) < 0.08) {
        setTransitioning(false)
        setIsAutoRotating(true) // Re-enable auto-rotate upon arrival
      }
      return
    }

    // 2. Resume auto-rotate if idle for 2.5 seconds
    if (!isAutoRotating && Date.now() - lastInteraction.current > 2500) {
      setIsAutoRotating(true)
    }

    // 3. Active configurations camera locking (Wheel or Body shell)
    let configTargetL = null
    let configTargetP = null

    if (explodedBody) {
      configTargetL = new THREE.Vector3(carShiftX, 0.2, 0.2)
      configTargetP = new THREE.Vector3(3.2 + carShiftX, 2.5, 3.2)
    } else if (explodedWheel && WHEEL_VIEWS[explodedWheel]) {
      const view = WHEEL_VIEWS[explodedWheel]
      configTargetL = new THREE.Vector3(view.look[0] + carShiftX, view.look[1], view.look[2])
      configTargetP = new THREE.Vector3(view.pos[0] + carShiftX, view.pos[1], view.pos[2])
    }

    // 4. Guided Tour / Auto-orbit rotation behavior
    if (isAutoRotating) {
      // Determine the active look and position coordinates
      let currentL = new THREE.Vector3()
      let currentP = new THREE.Vector3()

      if (configTargetL && configTargetP) {
        currentL.copy(configTargetL)
        currentP.copy(configTargetP)
      } else {
        const tourList = TOURS[cameraMode] || TOURS.overview
        const step = tourList[stepIndex] || tourList[0]
        currentL.set(step.look[0] + carShiftX, step.look[1], step.look[2])
        currentP.set(step.pos[0] + carShiftX, step.pos[1], step.pos[2])
      }

      // Initialize seamless rotation angle offset upon entering autoRotate
      if (!wasAutoRotating.current) {
        const dx = camera.position.x - currentL.x
        const dz = camera.position.z - currentL.z
        angleOffset.current = Math.atan2(dz, dx)
        startTimer.current = clock.getElapsedTime()
        wasAutoRotating.current = true
      }

      // Calculate smooth circular orbit rotation around center target
      const elapsed = clock.getElapsedTime() - startTimer.current
      const angle = angleOffset.current + elapsed * 0.12 // 0.12 radians/second slow orbit
      const r = currentP.distanceTo(currentL)
      
      const orbitPos = new THREE.Vector3(
        currentL.x + Math.cos(angle) * r,
        currentP.y, // maintain height
        currentL.z + Math.sin(angle) * r
      )

      camera.position.lerp(orbitPos, delta * 2.0)
      if (controls) {
        controls.target.lerp(currentL, delta * 2.0)
        controls.update()
      } else {
        camera.lookAt(currentL)
      }

      // Tour steps cycle timer (only active if no configuration is exploded)
      if (!explodedWheel && !explodedBody) {
        const tourList = TOURS[cameraMode] || TOURS.overview
        if (tourList.length > 1) {
          timeInStep.current += delta
          const holdTime = cameraMode === 'overview' ? 8.0 : 3.5
          if (timeInStep.current >= holdTime) {
            timeInStep.current = 0
            setStepIndex((prev) => (prev + 1) % tourList.length)
            setTransitioning(true) // trigger smooth glide to next step
          }
        }
      }
    } else {
      // User is manually interacting; record wasAutoRotating as false
      wasAutoRotating.current = false

      // If configuration is active, smoothly slide/hold target focal point
      if (configTargetL && configTargetP) {
        if (controls) {
          controls.target.lerp(configTargetL, delta * 2.0)
          controls.update()
        }
      }
    }
  })

  return null
}

// ── Post-Processing FX ───────────────────────────────────────────────────────
function PostFX() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom
        luminanceThreshold={0.5}
        luminanceSmoothing={0.9}
        intensity={1.5}
        blendFunction={BlendFunction.ADD}
        mipmapBlur
      />
      <ChromaticAberration
        offset={[0.0006, 0.0006]}
        blendFunction={BlendFunction.NORMAL}
      />
      <ToneMapping
        mode={ToneMappingMode.ACES_FILMIC}
        resolution={512}
        whitePoint={16.0}
        middleGrey={0.08}
        minLuminance={0.01}
        averageLuminance={0.2}
      />
    </EffectComposer>
  )
}
// ── MAIN SCENE COMPONENT ─────────────────────────────────────────────────────
export default function Scene({ 
  color = 'gold', 
  cameraMode = 'overview',
  setCameraMode,
  explodedWheel = null,
  setExplodedWheel,
  explodedBody = false,
  setExplodedBody,
  engineOpen = false,
  setEngineOpen,
  nitrousActive = false,
  setNitrousActive
}) {
  const [isAutoRotating, setIsAutoRotating] = useState(true)
  const lastInteraction = useRef(Date.now())

  const handleInteraction = () => {
    lastInteraction.current = Date.now()
    setIsAutoRotating(false)
  }

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.NoToneMapping,
      }}
      camera={{ position: [0, 15, 0.1], fov: 40 }}
      style={{ background: '#05060b' }}
      onPointerDown={handleInteraction}
      onWheel={handleInteraction}
    >
      {/* Studio Lighting Rig */}
      <ambientLight intensity={0.28} />
      <directionalLight
        position={[10, 15, 8]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={40}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-8, 6, -6]} intensity={1.8} color="#3388ff" />
      <pointLight position={[8, 3, 6]}   intensity={1.5} color="#e2c168" />
      <spotLight
        position={[0, 9, 0]}
        angle={0.45}
        penumbra={1}
        intensity={3.5}
        color="#ffffff"
        castShadow
      />

      {/* Realistic Glass Pavilion Ground Projection (CORS-safe, 100% grounded 8K view) */}
      <Environment 
        preset="lobby" 
        background 
        blur={0} 
        ground={{
          height: 1.8,
          radius: 28,
        }}
      />

      {/* 3D Glass Pavilion Showroom */}
      <GlassShowroom color={color} />

      {/* 3D Porsche Model & Mirror Floor (Glide right when card is active to avoid text overlap) */}
      <group position={[explodedWheel || explodedBody ? 1.3 : 0, 0, 0]}>
        <Suspense fallback={null}>
          {/* Float logic only active in overview mode to prevent camera jitter */}
          <Float 
            speed={cameraMode === 'overview' ? 0.5 : 0} 
            rotationIntensity={cameraMode === 'overview' ? 0.05 : 0} 
            floatIntensity={cameraMode === 'overview' ? 0.08 : 0}
          >
            <PorscheModel 
              color={color} 
              explodedWheel={explodedWheel}
              setExplodedWheel={setExplodedWheel}
              setCameraMode={setCameraMode}
              explodedBody={explodedBody}
              setExplodedBody={setExplodedBody}
              engineOpen={engineOpen}
              setEngineOpen={setEngineOpen}
              nitrousActive={nitrousActive}
              setNitrousActive={setNitrousActive}
            />
          </Float>
          <GroundReflection color={CAR_COLORS[color] || CAR_COLORS.gold} />
        </Suspense>
      </group>

      {/* Particle FX */}
      <Particles />

      {/* Camera Rig & Orbit Controls */}
      <CameraRig 
        cameraMode={cameraMode} 
        isAutoRotating={isAutoRotating}
        setIsAutoRotating={setIsAutoRotating}
        lastInteraction={lastInteraction}
        explodedWheel={explodedWheel}
        explodedBody={explodedBody}
      />
      <OrbitControls
        enablePan={cameraMode === 'overview'}
        enableZoom={true}
        minPolarAngle={Math.PI / 10}
        maxPolarAngle={Math.PI / 1.8}
        minDistance={cameraMode === 'overview' ? 3.0 : 0.5}
        maxDistance={cameraMode === 'overview' ? 18 : 8}
        autoRotate={false}
        rotateSpeed={0.8}
        zoomSpeed={1.0}
        dampingFactor={0.06}
        makeDefault
        onStart={handleInteraction}
      />

      {/* Post-Processing */}
      <PostFX />
    </Canvas>
  )
}


