'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAquariumStore } from '@/stores/aquarium'

/**
 * Aquarium Camera Controller
 *
 * 3 modes:
 *   1. Auto-orbit: camera slowly circles the aquarium (default, resumes after 10s idle)
 *   2. Manual orbit: mouse drag=rotate, scroll=zoom, right-drag=pan
 *   3. Focus: click a fish → camera smoothly flies to it, orbits nearby
 *
 * No keyboard controls needed.
 */

const CONFIG = {
  // Auto orbit
  autoOrbitSpeed: 0.08,
  autoOrbitRadius: 18,
  autoOrbitHeight: 6,
  autoOrbitCenter: new THREE.Vector3(0, 2, 0),
  idleTimeout: 10000, // ms before auto-orbit resumes

  // Manual orbit
  rotateSpeed: 0.005,
  panSpeed: 0.01,
  zoomSpeed: 1.5,
  minDistance: 4,
  maxDistance: 50,
  minPolarAngle: 0.15,
  maxPolarAngle: Math.PI * 0.85,
  damping: 0.08,

  // Focus
  focusDistance: 3,
  focusFlySpeed: 0.04,
  focusOrbitSpeed: 0.3,

  // Start
  startPosition: new THREE.Vector3(0, 6, 18),
}

type Mode = 'auto' | 'manual' | 'focus'

function AquariumCameraControls() {
  const { camera, gl } = useThree()
  const selectedFishId = useAquariumStore((s) => s.selectedFishId)
  const fishData = useAquariumStore((s) => s.data?.fish ?? [])

  const mode = useRef<Mode>('auto')
  const lastInputTime = useRef(Date.now())

  // Spherical coords for orbit
  const spherical = useRef(new THREE.Spherical(18, Math.PI * 0.35, 0))
  const targetSpherical = useRef(new THREE.Spherical(18, Math.PI * 0.35, 0))
  const orbitCenter = useRef(new THREE.Vector3(0, 2, 0))
  const targetCenter = useRef(new THREE.Vector3(0, 2, 0))

  // Mouse state
  const isDragging = useRef(false)
  const isPanning = useRef(false)
  const prevMouse = useRef({ x: 0, y: 0 })

  // Focus target
  const focusTarget = useRef(new THREE.Vector3())
  const focusAngle = useRef(0)

  // Auto orbit angle
  const autoAngle = useRef(0)

  // Init camera
  useEffect(() => {
    camera.position.copy(CONFIG.startPosition)
    camera.lookAt(CONFIG.autoOrbitCenter)
    spherical.current.setFromVector3(
      CONFIG.startPosition.clone().sub(CONFIG.autoOrbitCenter),
    )
    targetSpherical.current.copy(spherical.current)
  }, [camera])

  const markInput = useCallback(() => {
    lastInputTime.current = Date.now()
    if (mode.current === 'auto') {
      mode.current = 'manual'
      // Sync spherical from current camera position
      const offset = camera.position.clone().sub(orbitCenter.current)
      spherical.current.setFromVector3(offset)
      targetSpherical.current.copy(spherical.current)
    }
  }, [camera])

  // ── Mouse handlers ──

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      markInput()
      if (e.button === 2) {
        isPanning.current = true
      } else if (e.button === 0) {
        isDragging.current = true
      }
      prevMouse.current = { x: e.clientX, y: e.clientY }
    },
    [markInput],
  )

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
    isPanning.current = false
  }, [])

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const dx = e.clientX - prevMouse.current.x
      const dy = e.clientY - prevMouse.current.y
      prevMouse.current = { x: e.clientX, y: e.clientY }

      if (isDragging.current) {
        markInput()
        if (mode.current === 'focus') mode.current = 'manual'

        targetSpherical.current.theta -= dx * CONFIG.rotateSpeed
        targetSpherical.current.phi += dy * CONFIG.rotateSpeed
        targetSpherical.current.phi = Math.max(
          CONFIG.minPolarAngle,
          Math.min(CONFIG.maxPolarAngle, targetSpherical.current.phi),
        )
      }

      if (isPanning.current) {
        markInput()
        if (mode.current === 'focus') mode.current = 'manual'

        const panX = -dx * CONFIG.panSpeed
        const panY = dy * CONFIG.panSpeed

        const right = new THREE.Vector3()
        const up = new THREE.Vector3()
        right.setFromMatrixColumn(camera.matrixWorld, 0)
        up.setFromMatrixColumn(camera.matrixWorld, 1)

        targetCenter.current.addScaledVector(right, panX)
        targetCenter.current.addScaledVector(up, panY)
      }
    },
    [camera, markInput],
  )

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()
      markInput()
      if (mode.current === 'focus') mode.current = 'manual'

      const delta = e.deltaY > 0 ? 1.1 : 0.9
      targetSpherical.current.radius = Math.max(
        CONFIG.minDistance,
        Math.min(CONFIG.maxDistance, targetSpherical.current.radius * delta),
      )
    },
    [markInput],
  )

  const handleContextMenu = useCallback((e: Event) => {
    e.preventDefault()
  }, [])

  // ── Event listeners ──

  useEffect(() => {
    const canvas = gl.domElement
    canvas.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('pointerup', handlePointerUp)
    document.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    canvas.addEventListener('contextmenu', handleContextMenu)

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('pointerup', handlePointerUp)
      document.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [
    gl.domElement,
    handlePointerDown,
    handlePointerUp,
    handlePointerMove,
    handleWheel,
    handleContextMenu,
  ])

  // ── Focus mode trigger ──

  const prevSelectedFish = useRef<string | null>(null)
  useEffect(() => {
    if (selectedFishId && selectedFishId !== prevSelectedFish.current) {
      const fish = fishData.find((f) => f.id === selectedFishId)
      if (fish) {
        // Find the fish mesh position from FishGroup layout
        const idx = fishData.indexOf(fish)
        const total = fishData.length
        const goldenAngle = 2.399963
        const angle = idx * goldenAngle
        const spread = Math.min(total * 0.4, 20)
        const radius = 2 + (idx / Math.max(total, 1)) * spread

        const isFossil = fish.evolutionStage === 'fossil'
        focusTarget.current.set(
          Math.cos(angle) * radius,
          isFossil ? 0.5 : 2 + (idx % 5) * 1.0,
          Math.sin(angle) * radius,
        )

        mode.current = 'focus'
        focusAngle.current = 0
        targetCenter.current.copy(focusTarget.current)
        targetSpherical.current.radius = CONFIG.focusDistance
      }
    }
    prevSelectedFish.current = selectedFishId
  }, [selectedFishId, fishData])

  // ── Frame update ──

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)

    // Check idle → switch back to auto
    if (
      mode.current === 'manual' &&
      Date.now() - lastInputTime.current > CONFIG.idleTimeout
    ) {
      mode.current = 'auto'
      targetSpherical.current.radius = CONFIG.autoOrbitRadius
      targetSpherical.current.phi = Math.PI * 0.35
      targetCenter.current.copy(CONFIG.autoOrbitCenter)
    }

    // ── Auto orbit ──
    if (mode.current === 'auto') {
      autoAngle.current += CONFIG.autoOrbitSpeed * dt
      targetSpherical.current.theta = autoAngle.current
      targetSpherical.current.radius = CONFIG.autoOrbitRadius
      targetSpherical.current.phi = Math.PI * 0.35
      targetCenter.current.lerp(CONFIG.autoOrbitCenter, 0.02)
    }

    // ── Focus orbit ──
    if (mode.current === 'focus') {
      focusAngle.current += CONFIG.focusOrbitSpeed * dt
      targetSpherical.current.theta = focusAngle.current
      targetSpherical.current.phi = Math.PI * 0.4
      targetCenter.current.lerp(focusTarget.current, CONFIG.focusFlySpeed)
    }

    // ── Apply damping ──
    spherical.current.theta +=
      (targetSpherical.current.theta - spherical.current.theta) * CONFIG.damping
    spherical.current.phi +=
      (targetSpherical.current.phi - spherical.current.phi) * CONFIG.damping
    spherical.current.radius +=
      (targetSpherical.current.radius - spherical.current.radius) *
      CONFIG.damping

    orbitCenter.current.lerp(targetCenter.current, CONFIG.damping)

    // ── Set camera position from spherical ──
    const offset = new THREE.Vector3().setFromSpherical(spherical.current)
    camera.position.copy(orbitCenter.current).add(offset)
    camera.lookAt(orbitCenter.current)
  })

  return null
}

export { AquariumCameraControls }
