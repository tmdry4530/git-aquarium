import * as THREE from 'three'
import type { FishSpecies } from '@/types/fish'

const geometryCache = new Map<FishSpecies, THREE.BufferGeometry>()

function createFishProfile(
  points: Array<[number, number]>,
  depth: number,
  segments: number = 8,
): THREE.BufferGeometry {
  const shape = new THREE.Shape()
  const [first, ...rest] = points
  if (!first) return new THREE.SphereGeometry(0.3, 12, 12)
  shape.moveTo(first[0], first[1])
  for (const [x, y] of rest) {
    shape.lineTo(x, y)
  }
  shape.closePath()

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: depth * 0.3,
    bevelSize: depth * 0.2,
    bevelSegments: segments > 4 ? 3 : 2,
    curveSegments: segments,
  })
  geo.center()
  geo.rotateY(Math.PI / 2)
  return geo
}

function createAngelfish(): THREE.BufferGeometry {
  // Tall disc-shaped body with prominent fins
  return createFishProfile(
    [
      [0, 0],
      [0.15, 0.1],
      [0.25, 0.05],
      [0.3, 0],
      [0.25, -0.05],
      [0.15, -0.1],
      [0.05, -0.25],
      [0, -0.35],
      [-0.05, -0.25],
      [-0.1, -0.15],
      [-0.2, -0.05],
      [-0.25, 0],
      [-0.2, 0.05],
      [-0.1, 0.15],
      [-0.05, 0.25],
      [0, 0.4],
      [0.05, 0.25],
      [0.1, 0.15],
    ],
    0.06,
    10,
  )
}

function createManta(): THREE.BufferGeometry {
  // Wide, flat body with wing-like pectoral fins
  return createFishProfile(
    [
      [0, 0],
      [0.1, 0.03],
      [0.2, 0.04],
      [0.4, 0.02],
      [0.45, 0],
      [0.4, -0.02],
      [0.2, -0.04],
      [0.1, -0.03],
      [0, -0.02],
      [-0.1, -0.03],
      [-0.15, -0.02],
      [-0.25, -0.01],
      [-0.3, 0],
      [-0.25, 0.01],
      [-0.15, 0.02],
      [-0.1, 0.03],
    ],
    0.15,
    10,
  )
}

function createTurtle(): THREE.BufferGeometry {
  // Dome shell shape
  const geo = new THREE.SphereGeometry(
    0.3,
    12,
    8,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.6,
  )
  geo.scale(1.2, 0.8, 1)
  geo.translate(0, 0.05, 0)
  return geo
}

function createPufferfish(): THREE.BufferGeometry {
  // Spiky sphere - icosahedron with slight vertex displacement
  const geo = new THREE.IcosahedronGeometry(0.28, 1)
  const posAttr = geo.attributes['position'] as THREE.BufferAttribute
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i)
    const y = posAttr.getY(i)
    const z = posAttr.getZ(i)
    const len = Math.sqrt(x * x + y * y + z * z)
    if (len > 0) {
      const spike = 1 + (i % 3 === 0 ? 0.15 : 0)
      posAttr.setXYZ(
        i,
        (x / len) * 0.28 * spike,
        (y / len) * 0.28 * spike,
        (z / len) * 0.28 * spike,
      )
    }
  }
  posAttr.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}

function createDolphin(): THREE.BufferGeometry {
  // Streamlined torpedo shape via LatheGeometry
  const pts: THREE.Vector2[] = [
    new THREE.Vector2(0, -0.4),
    new THREE.Vector2(0.08, -0.35),
    new THREE.Vector2(0.15, -0.2),
    new THREE.Vector2(0.18, -0.05),
    new THREE.Vector2(0.16, 0.1),
    new THREE.Vector2(0.12, 0.25),
    new THREE.Vector2(0.06, 0.35),
    new THREE.Vector2(0, 0.4),
  ]
  const geo = new THREE.LatheGeometry(pts, 10)
  geo.rotateX(Math.PI / 2)
  return geo
}

function createSquid(): THREE.BufferGeometry {
  // Elongated cone body
  const geo = new THREE.ConeGeometry(0.15, 0.6, 8)
  geo.rotateX(Math.PI / 2)
  geo.scale(1, 0.8, 1)
  return geo
}

function createShark(): THREE.BufferGeometry {
  // Aggressive streamlined shape
  const pts: THREE.Vector2[] = [
    new THREE.Vector2(0, -0.45),
    new THREE.Vector2(0.06, -0.4),
    new THREE.Vector2(0.14, -0.25),
    new THREE.Vector2(0.18, -0.1),
    new THREE.Vector2(0.2, 0),
    new THREE.Vector2(0.18, 0.1),
    new THREE.Vector2(0.14, 0.2),
    new THREE.Vector2(0.08, 0.3),
    new THREE.Vector2(0.03, 0.38),
    new THREE.Vector2(0, 0.4),
  ]
  const geo = new THREE.LatheGeometry(pts, 10)
  geo.rotateX(Math.PI / 2)
  return geo
}

function createSeahorse(): THREE.BufferGeometry {
  // Curved S-shape using tube geometry
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.3, 0),
    new THREE.Vector3(0.05, -0.2, 0),
    new THREE.Vector3(0.08, -0.05, 0),
    new THREE.Vector3(0.05, 0.1, 0),
    new THREE.Vector3(0, 0.2, 0),
    new THREE.Vector3(-0.05, 0.3, 0),
  ])
  const geo = new THREE.TubeGeometry(curve, 12, 0.04, 6, false)
  return geo
}

function createGoldfish(): THREE.BufferGeometry {
  // Chubby round body
  const geo = new THREE.SphereGeometry(0.25, 12, 10)
  geo.scale(1.3, 0.9, 0.8)
  return geo
}

function createFlyingfish(): THREE.BufferGeometry {
  // Sleek body - stretched sphere
  const geo = new THREE.SphereGeometry(0.2, 10, 8)
  geo.scale(0.7, 0.6, 1.8)
  return geo
}

function createJellyfish(): THREE.BufferGeometry {
  // Dome hemisphere
  const geo = new THREE.SphereGeometry(
    0.25,
    12,
    8,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.5,
  )
  geo.scale(1, 0.7, 1)
  return geo
}

function createCoral(): THREE.BufferGeometry {
  // Branching cylinder cluster
  const geo = new THREE.DodecahedronGeometry(0.25, 0)
  geo.scale(1, 1.3, 1)
  return geo
}

function createShell(): THREE.BufferGeometry {
  // Spiral shell - torus knot
  const geo = new THREE.TorusKnotGeometry(0.12, 0.05, 32, 6, 2, 3)
  geo.scale(1, 0.8, 1)
  return geo
}

function createSeaweedGeo(): THREE.BufferGeometry {
  // Tall thin cylinder
  const geo = new THREE.CylinderGeometry(0.03, 0.05, 0.6, 5)
  geo.translate(0, 0.3, 0)
  return geo
}

function createPlankton(): THREE.BufferGeometry {
  // Tiny sphere
  return new THREE.SphereGeometry(0.08, 6, 6)
}

const GEOMETRY_CREATORS: Record<FishSpecies, () => THREE.BufferGeometry> = {
  angelfish: createAngelfish,
  manta: createManta,
  turtle: createTurtle,
  pufferfish: createPufferfish,
  dolphin: createDolphin,
  squid: createSquid,
  shark: createShark,
  seahorse: createSeahorse,
  goldfish: createGoldfish,
  flyingfish: createFlyingfish,
  jellyfish: createJellyfish,
  coral: createCoral,
  shell: createShell,
  seaweed: createSeaweedGeo,
  plankton: createPlankton,
} as const

function getSpeciesGeometry(species: FishSpecies): THREE.BufferGeometry {
  const cached = geometryCache.get(species)
  if (cached) return cached

  const creator = GEOMETRY_CREATORS[species]
  const geo = creator()
  geometryCache.set(species, geo)
  return geo
}

const SPECIES_SCALE: Record<FishSpecies, [number, number, number]> = {
  angelfish: [1, 1, 1],
  manta: [1.5, 0.4, 1],
  turtle: [1, 0.7, 1],
  pufferfish: [1, 1, 1],
  dolphin: [0.8, 0.8, 1],
  squid: [0.8, 0.8, 1.2],
  shark: [1, 1, 1.1],
  seahorse: [0.8, 1.2, 0.8],
  goldfish: [1, 1, 1],
  flyingfish: [1.2, 0.6, 1],
  jellyfish: [1, 1, 1],
  coral: [1, 1, 1],
  shell: [1, 1, 1],
  seaweed: [1, 1, 1],
  plankton: [0.8, 0.8, 0.8],
} as const

export { getSpeciesGeometry, SPECIES_SCALE }
