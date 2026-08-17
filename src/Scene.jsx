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

// ── Porsche 911 Model Component with Sunglasses Glass (Static Wheels) ───────
function PorscheModel({ color = 'gold' }) {
  const gltf = useGLTF('/model.glb')
  const groupRef = useRef()

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

  return (
    <group ref={groupRef} position={[0, -0.62, 0]} scale={1.42}>
      <primitive object={gltf.scene} />
    </group>
  )
}

// ── 3D Glass Showroom Pavilion with Flickering Aura Flame ────────────────────
function GlassShowroom({ color }) {
  const ringColor = CAR_COLORS[color] || CAR_COLORS.gold
  
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#e0f2ff'),
    transparent: true,
    opacity: 0.28,
    roughness: 0.01,
    transmission: 0.97,
    ior: 1.52,
    reflectivity: 0.98,
    clearcoat: 1.0,
    side: THREE.DoubleSide,
  })

  const pillarMat = new THREE.MeshStandardMaterial({
    color: '#1a1b26',
    metalness: 0.95,
    roughness: 0.1,
  })

  // Flame layer refs for procedural flickering aura math in 60fps render loops
  const flame1Ref = useRef()
  const flame2Ref = useRef()
  const flame3Ref = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    
    if (flame1Ref.current) {
      // Fast scale flickering and rotation
      const s = 1 + Math.sin(t * 7.5) * 0.035 + Math.cos(t * 3.2) * 0.015
      flame1Ref.current.scale.set(s, s, 1)
      flame1Ref.current.material.opacity = 0.38 + Math.sin(t * 11) * 0.06
      flame1Ref.current.rotation.z = t * 0.14
    }
    
    if (flame2Ref.current) {
      // Counter-rotation and layered scale offset
      const s = 1.06 + Math.cos(t * 5.8) * 0.045 + Math.sin(t * 2.1) * 0.02
      flame2Ref.current.scale.set(s, s, 1)
      flame2Ref.current.material.opacity = 0.26 + Math.cos(t * 9) * 0.05
      flame2Ref.current.rotation.z = -t * 0.18
    }

    if (flame3Ref.current) {
      // Outer aura ring pulsation
      const s = 1.12 + Math.sin(t * 3.8) * 0.06
      flame3Ref.current.scale.set(s, s, 1)
      flame3Ref.current.material.opacity = 0.14 + Math.sin(t * 6) * 0.04
      flame3Ref.current.rotation.z = t * 0.09
    }
  })

  // Glass Wall Panels
  const walls = []
  const count = 8
  const radius = 6.4
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    walls.push(
      <group key={i} position={[x, 1.8, z]} rotation={[0, -angle + Math.PI / 2, 0]}>
        <mesh material={glassMat}>
          <planeGeometry args={[4.2, 5.0]} />
        </mesh>
        <mesh position={[-2.1, 0, 0]} material={pillarMat}>
          <boxGeometry args={[0.1, 5.2, 0.1]} />
        </mesh>
        <mesh position={[2.1, 0, 0]} material={pillarMat}>
          <boxGeometry args={[0.1, 5.2, 0.1]} />
        </mesh>
      </group>
    )
  }

  return (
    <group position={[0, -0.63, 0]}>
      {/* Structural Glass Panels */}
      {walls}

      {/* Pavilion Glass Roof */}
      <mesh position={[0, 4.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 6.4, 32]} />
        <meshStandardMaterial color="#1a1b26" metalness={0.9} roughness={0.15} side={THREE.DoubleSide} />
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
      <mesh ref={flame2Ref} position={[0, 0.015, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 3.5, 64]} />
        <meshBasicMaterial 
          color={ringColor} 
          transparent={true} 
          opacity={0.25} 
          blending={THREE.AdditiveBlending} 
          side={THREE.DoubleSide} 
          depthWrite={false}
        />
      </mesh>

      {/* Flame Layer 3 */}
      <mesh ref={flame3Ref} position={[0, 0.018, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 3.8, 64]} />
        <meshBasicMaterial 
          color={ringColor} 
          transparent={true} 
          opacity={0.15} 
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
// NOTE: The 3D model sits at world Y=-0.62, scale=1.42.
// Interior: camera is INSIDE the cabin. Positive Z is toward front of car.
// look target is what the camera gazes AT from its pos.
const TOURS = {
  overview: [
    { pos: [5.5, 1.8, 7.5],   look: [0, 0.2, 0],   orbit: true  }
  ],
  interior: [
    // Driver seat — looking at steering wheel & instrument cluster
    { pos: [-0.35, 0.28, 0.5], look: [-0.3, 0.22, -0.6], orbit: false },
    // Center console — looking down at gear shifter & infotainment
    { pos: [0.0,  0.18, 0.3],  look: [0.0,  0.0,  -0.2], orbit: false },
    // Passenger side — looking across cabin at door & seat
    { pos: [0.45, 0.28, 0.4],  look: [0.5,  0.18,  -0.8], orbit: false },
    // Low dramatic angle — rear seats / footwell pan up
    { pos: [0.0,  -0.05, 1.0], look: [0.0,  0.25, -0.5], orbit: false }
  ],
  wheel: [
    { pos: [1.6,  0.08, 1.4],  look: [0.85, -0.18,  0.82], orbit: false }, // FL
    { pos: [1.6,  0.08, -1.4], look: [0.85, -0.18, -0.82], orbit: false }, // FR
    { pos: [-1.6, 0.08, -1.4], look: [-0.85,-0.18, -0.82], orbit: false }, // RR
    { pos: [-1.6, 0.08,  1.4], look: [-0.85,-0.18,  0.82], orbit: false }  // RL
  ],
  rear: [
    { pos: [0,    0.5,  -3.8], look: [0, 0.15,  0],    orbit: false }, // Rear emblem & lights
    { pos: [0,    1.2,  -3.2], look: [0, 0.55,  0],    orbit: false }, // Spoiler & grille
    { pos: [0.7,  0.6,  -3.5], look: [0, 0.4,  -0.3], orbit: false }  // Exhaust pipes
  ]
}

// ── Camera Controller (Cinematic Intro & Auto-Rotate Idle Timers) ────────────
function CameraRig({ cameraMode, isAutoRotating, setIsAutoRotating, lastInteraction }) {
  const { camera, controls } = useThree()
  
  // Guided tour and transition states
  const [stepIndex, setStepIndex] = useState(0)
  const timeInStep = useRef(0)
  const [transitioning, setTransitioning] = useState(false)
  
  // Target values to lerp towards
  const targetPos = useRef(new THREE.Vector3(5.5, 1.8, 7.5))
  const targetLook = useRef(new THREE.Vector3(0, 0, 0))

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

  useFrame((_, delta) => {
    // 1. Cinematic Intro glide down
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

    // 2. Automated camera glide transition (initial slide to step 0)
    if (transitioning) {
      camera.position.lerp(targetPos.current, delta * 3.5)
      if (controls) {
        controls.target.lerp(targetLook.current, delta * 3.5)
        controls.update()
      } else {
        camera.lookAt(targetLook.current)
      }

      if (camera.position.distanceTo(targetPos.current) < 0.05) {
        setTransitioning(false)
        setIsAutoRotating(true) // Re-enable auto-rotate upon arrival
      }
      return
    }

    // 3. Resume auto-rotate if idle for 2.5 seconds
    if (!isAutoRotating && Date.now() - lastInteraction.current > 2500) {
      setIsAutoRotating(true)
    }

    // 4. Guided Tour Timeline Loop (active when isAutoRotating is true)
    if (isAutoRotating) {
      const tourList = TOURS[cameraMode] || TOURS.overview
      const currentStep = tourList[stepIndex] || tourList[0]

      const basePos = new THREE.Vector3(...currentStep.pos)
      const baseLook = new THREE.Vector3(...currentStep.look)

      if (currentStep.orbit) {
        // ── Overview only: slow 360° orbital sweep around car ──
        const time = Date.now() * 0.00018
        const r = basePos.distanceTo(new THREE.Vector3(0, 0.2, 0))
        const startAngle = Math.atan2(basePos.z, basePos.x)
        const angle = startAngle + time
        const orbitPos = new THREE.Vector3(
          Math.cos(angle) * r,
          basePos.y,
          Math.sin(angle) * r
        )
        camera.position.lerp(orbitPos, delta * 1.2)
        if (controls) {
          controls.target.lerp(baseLook, delta * 1.2)
          controls.update()
        } else {
          camera.lookAt(baseLook)
        }
      } else {
        // ── Interior / Wheel / Rear: cinematic slow drift to each keyframe ──
        // No orbit — just smoothly lerp to the exact keyframe position
        camera.position.lerp(basePos, delta * 1.0)
        if (controls) {
          controls.target.lerp(baseLook, delta * 1.0)
          controls.update()
        } else {
          camera.lookAt(baseLook)
        }
      }

      // Step transition timer
      if (tourList.length > 1) {
        timeInStep.current += delta
        // Overview steps hold longer; close-ups cycle every 3.5 s
        const holdTime = currentStep.orbit ? 8.0 : 3.5
        if (timeInStep.current >= holdTime) {
          timeInStep.current = 0
          setStepIndex((prev) => (prev + 1) % tourList.length)
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
  cameraMode = 'overview'
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
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 15, 8]}
        intensity={3.5}
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

      {/* Realistic Sunset HDRI Panorama (8k environment source backdrop) */}
      <Environment 
        files="https://threejs.org/examples/textures/equirectangular/venice_sunset_1k.hdr" 
        background 
        blur={0.015} 
      />

      {/* 3D Glass Pavilion Showroom */}
      <GlassShowroom color={color} />

      {/* 3D Porsche Model & Mirror Floor */}
      <Suspense fallback={null}>
        {/* Float logic only active in overview mode to prevent camera jitter */}
        <Float 
          speed={cameraMode === 'overview' ? 0.5 : 0} 
          rotationIntensity={cameraMode === 'overview' ? 0.05 : 0} 
          floatIntensity={cameraMode === 'overview' ? 0.08 : 0}
        >
          <PorscheModel color={color} />
        </Float>
        <GroundReflection color={CAR_COLORS[color] || CAR_COLORS.gold} />
      </Suspense>

      {/* Particle FX */}
      <Particles />

      {/* Camera Rig & Orbit Controls */}
      <CameraRig 
        cameraMode={cameraMode} 
        isAutoRotating={isAutoRotating}
        setIsAutoRotating={setIsAutoRotating}
        lastInteraction={lastInteraction}
      />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={2.8}
        maxDistance={16}
        autoRotate={isAutoRotating}
        autoRotateSpeed={1.0}
        rotateSpeed={0.8}
        zoomSpeed={1.0}
        dampingFactor={0.05}
        makeDefault
        onStart={handleInteraction}
      />

      {/* Post-Processing */}
      <PostFX />
    </Canvas>
  )
}
