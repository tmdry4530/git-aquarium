import * as THREE from 'three'
import type { FishSpecies } from '@/types/fish'

const geometryCache = new Map<FishSpecies, THREE.BufferGeometry>()

/**
 * Build a recognizable fish from merged primitives:
 * body (ellipsoid) + tail (cone) + dorsal fin (flat box) + side fins (flat boxes)
 */
function buildFish(opts: {
  bodyW: number // x radius (width/thickness)
  bodyH: number // y radius (height)
  bodyL: number // z radius (length, nose→back)
  tailLen: number
  tailSpread: number
  dorsalH: number
  dorsalL: number
  finW: number
  finL: number
}): THREE.BufferGeometry {
  const {
    bodyW,
    bodyH,
    bodyL,
    tailLen,
    tailSpread,
    dorsalH,
    dorsalL,
    finW,
    finL,
  } = opts

  // Body — squashed sphere
  const body = new THREE.SphereGeometry(1, 14, 10)
  body.scale(bodyW, bodyH, bodyL)

  // Tail — cone pointing backward
  const tail = new THREE.ConeGeometry(tailSpread, tailLen, 4)
  tail.rotateX(Math.PI / 2)
  tail.translate(0, 0, bodyL + tailLen * 0.4)

  // Dorsal fin — thin box on top
  const dorsal = new THREE.BoxGeometry(0.02, dorsalH, dorsalL)
  dorsal.translate(0, bodyH * 0.6 + dorsalH * 0.4, -bodyL * 0.1)

  // Side fins — thin angled boxes
  const finR = new THREE.BoxGeometry(finW, 0.02, finL)
  finR.rotateZ(-0.3)
  finR.translate(bodyW * 0.7 + finW * 0.3, -bodyH * 0.1, -bodyL * 0.2)

  const finL2 = new THREE.BoxGeometry(finW, 0.02, finL)
  finL2.rotateZ(0.3)
  finL2.translate(-(bodyW * 0.7 + finW * 0.3), -bodyH * 0.1, -bodyL * 0.2)

  // Merge all
  const merged = mergeGeometries([body, tail, dorsal, finR, finL2])
  merged.computeVertexNormals()
  return merged
}

function mergeGeometries(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let totalVerts = 0
  let totalIdx = 0
  for (const g of geos) {
    totalVerts += g.attributes['position']!.count
    totalIdx += g.index ? g.index.count : g.attributes['position']!.count
  }

  const positions = new Float32Array(totalVerts * 3)
  const normals = new Float32Array(totalVerts * 3)
  const indices: number[] = []
  let vertOffset = 0
  let idxOffset = 0

  for (const g of geos) {
    const pos = g.attributes['position'] as THREE.BufferAttribute
    const norm = g.attributes['normal'] as THREE.BufferAttribute | undefined
    const count = pos.count

    for (let i = 0; i < count; i++) {
      positions[(vertOffset + i) * 3] = pos.getX(i)
      positions[(vertOffset + i) * 3 + 1] = pos.getY(i)
      positions[(vertOffset + i) * 3 + 2] = pos.getZ(i)
      if (norm) {
        normals[(vertOffset + i) * 3] = norm.getX(i)
        normals[(vertOffset + i) * 3 + 1] = norm.getY(i)
        normals[(vertOffset + i) * 3 + 2] = norm.getZ(i)
      }
    }

    if (g.index) {
      for (let i = 0; i < g.index.count; i++) {
        indices[idxOffset + i] = g.index.array[i]! + vertOffset
      }
      idxOffset += g.index.count
    } else {
      for (let i = 0; i < count; i++) {
        indices[idxOffset + i] = vertOffset + i
      }
      idxOffset += count
    }

    vertOffset += count
    g.dispose()
  }

  const merged = new THREE.BufferGeometry()
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  merged.setIndex(indices)
  return merged
}

// ── Species Geometry Creators ──

function createAngelfish(): THREE.BufferGeometry {
  // Tall, thin disc body with big dorsal
  return buildFish({
    bodyW: 0.08,
    bodyH: 0.3,
    bodyL: 0.25,
    tailLen: 0.15,
    tailSpread: 0.12,
    dorsalH: 0.2,
    dorsalL: 0.15,
    finW: 0.08,
    finL: 0.1,
  })
}

function createManta(): THREE.BufferGeometry {
  // Very wide, flat
  return buildFish({
    bodyW: 0.5,
    bodyH: 0.08,
    bodyL: 0.35,
    tailLen: 0.25,
    tailSpread: 0.05,
    dorsalH: 0.03,
    dorsalL: 0.1,
    finW: 0.3,
    finL: 0.25,
  })
}

function createTurtle(): THREE.BufferGeometry {
  // Dome shell — sphere top + flat bottom
  const shell = new THREE.SphereGeometry(
    0.3,
    12,
    8,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.55,
  )
  shell.scale(1.2, 0.7, 1)
  // Head — small sphere sticking out front
  const head = new THREE.SphereGeometry(0.1, 8, 6)
  head.translate(0, 0, -0.35)
  // Flippers
  const fl = new THREE.BoxGeometry(0.25, 0.03, 0.12)
  fl.rotateZ(-0.4)
  fl.translate(0.25, -0.05, -0.1)
  const fr = new THREE.BoxGeometry(0.25, 0.03, 0.12)
  fr.rotateZ(0.4)
  fr.translate(-0.25, -0.05, -0.1)
  const merged = mergeGeometries([shell, head, fl, fr])
  merged.computeVertexNormals()
  return merged
}

function createPufferfish(): THREE.BufferGeometry {
  // Spiky sphere
  const geo = new THREE.IcosahedronGeometry(0.3, 1)
  const posAttr = geo.attributes['position'] as THREE.BufferAttribute
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i)
    const y = posAttr.getY(i)
    const z = posAttr.getZ(i)
    const len = Math.sqrt(x * x + y * y + z * z)
    if (len > 0) {
      const spike = 1 + (i % 4 === 0 ? 0.2 : 0)
      posAttr.setXYZ(
        i,
        (x / len) * 0.3 * spike,
        (y / len) * 0.3 * spike,
        (z / len) * 0.3 * spike,
      )
    }
  }
  posAttr.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}

function createDolphin(): THREE.BufferGeometry {
  // Sleek torpedo with nose + curved back fin
  return buildFish({
    bodyW: 0.15,
    bodyH: 0.18,
    bodyL: 0.4,
    tailLen: 0.2,
    tailSpread: 0.15,
    dorsalH: 0.15,
    dorsalL: 0.12,
    finW: 0.15,
    finL: 0.1,
  })
}

function createSquid(): THREE.BufferGeometry {
  // Elongated cone + tentacles (small cones at back)
  const body = new THREE.ConeGeometry(0.15, 0.5, 8)
  body.rotateX(-Math.PI / 2)
  const t1 = new THREE.CylinderGeometry(0.01, 0.03, 0.25, 4)
  t1.rotateX(Math.PI / 2)
  t1.translate(0.05, 0, 0.35)
  const t2 = new THREE.CylinderGeometry(0.01, 0.03, 0.25, 4)
  t2.rotateX(Math.PI / 2)
  t2.translate(-0.05, 0, 0.35)
  const t3 = new THREE.CylinderGeometry(0.01, 0.03, 0.25, 4)
  t3.rotateX(Math.PI / 2)
  t3.translate(0, 0.05, 0.35)
  const t4 = new THREE.CylinderGeometry(0.01, 0.03, 0.25, 4)
  t4.rotateX(Math.PI / 2)
  t4.translate(0, -0.05, 0.35)
  const merged = mergeGeometries([body, t1, t2, t3, t4])
  merged.computeVertexNormals()
  return merged
}

function createShark(): THREE.BufferGeometry {
  // Big, aggressive — large body + tall dorsal
  return buildFish({
    bodyW: 0.18,
    bodyH: 0.2,
    bodyL: 0.45,
    tailLen: 0.25,
    tailSpread: 0.18,
    dorsalH: 0.25,
    dorsalL: 0.15,
    finW: 0.18,
    finL: 0.12,
  })
}

function createSeahorse(): THREE.BufferGeometry {
  // Curved S body using tube
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.35, 0),
    new THREE.Vector3(0.08, -0.2, 0),
    new THREE.Vector3(0.12, 0, 0),
    new THREE.Vector3(0.06, 0.15, 0),
    new THREE.Vector3(0, 0.25, 0),
    new THREE.Vector3(-0.06, 0.35, 0),
  ])
  // Head — sphere on top
  const head = new THREE.SphereGeometry(0.06, 8, 6)
  head.translate(-0.06, 0.35, 0)
  const body = new THREE.TubeGeometry(curve, 16, 0.05, 6, false)
  const merged = mergeGeometries([body, head])
  merged.computeVertexNormals()
  return merged
}

function createGoldfish(): THREE.BufferGeometry {
  // Chubby round body + fan tail
  return buildFish({
    bodyW: 0.18,
    bodyH: 0.2,
    bodyL: 0.22,
    tailLen: 0.18,
    tailSpread: 0.2,
    dorsalH: 0.1,
    dorsalL: 0.1,
    finW: 0.1,
    finL: 0.08,
  })
}

function createFlyingfish(): THREE.BufferGeometry {
  // Sleek body + enormous side fins (wings)
  return buildFish({
    bodyW: 0.1,
    bodyH: 0.1,
    bodyL: 0.3,
    tailLen: 0.15,
    tailSpread: 0.1,
    dorsalH: 0.05,
    dorsalL: 0.08,
    finW: 0.35,
    finL: 0.2,
  })
}

function createJellyfish(): THREE.BufferGeometry {
  // Dome bell + trailing tentacles
  const bell = new THREE.SphereGeometry(
    0.25,
    14,
    8,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.5,
  )
  bell.scale(1, 0.6, 1)
  const t1 = new THREE.CylinderGeometry(0.008, 0.008, 0.35, 3)
  t1.translate(0.08, -0.2, 0)
  const t2 = new THREE.CylinderGeometry(0.008, 0.008, 0.4, 3)
  t2.translate(-0.05, -0.22, 0.06)
  const t3 = new THREE.CylinderGeometry(0.008, 0.008, 0.3, 3)
  t3.translate(0, -0.18, -0.08)
  const t4 = new THREE.CylinderGeometry(0.008, 0.008, 0.35, 3)
  t4.translate(-0.08, -0.2, -0.04)
  const t5 = new THREE.CylinderGeometry(0.008, 0.008, 0.32, 3)
  t5.translate(0.04, -0.19, 0.07)
  const merged = mergeGeometries([bell, t1, t2, t3, t4, t5])
  merged.computeVertexNormals()
  return merged
}

function createCoral(): THREE.BufferGeometry {
  // Branching cluster
  const base = new THREE.CylinderGeometry(0.08, 0.12, 0.25, 6)
  const b1 = new THREE.CylinderGeometry(0.04, 0.06, 0.2, 5)
  b1.rotateZ(0.4)
  b1.translate(0.1, 0.15, 0)
  const b2 = new THREE.CylinderGeometry(0.04, 0.06, 0.22, 5)
  b2.rotateZ(-0.3)
  b2.translate(-0.08, 0.18, 0.05)
  const b3 = new THREE.CylinderGeometry(0.03, 0.05, 0.18, 5)
  b3.rotateZ(0.2)
  b3.translate(0.03, 0.2, -0.06)
  const merged = mergeGeometries([base, b1, b2, b3])
  merged.computeVertexNormals()
  return merged
}

function createShell(): THREE.BufferGeometry {
  // Spiral shell
  const geo = new THREE.TorusKnotGeometry(0.12, 0.06, 40, 6, 2, 3)
  geo.scale(1, 0.8, 1)
  return geo
}

function createSeaweedGeo(): THREE.BufferGeometry {
  // Wavy stalk
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.03, 0.15, 0),
    new THREE.Vector3(-0.02, 0.3, 0),
    new THREE.Vector3(0.02, 0.45, 0),
    new THREE.Vector3(0, 0.6, 0),
  ])
  return new THREE.TubeGeometry(curve, 12, 0.025, 5, false)
}

function createPlanktonGeo(): THREE.BufferGeometry {
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
  plankton: createPlanktonGeo,
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
  angelfish: [1.2, 1.2, 1.2],
  manta: [1.5, 1.0, 1.5],
  turtle: [1.3, 1.3, 1.3],
  pufferfish: [1.2, 1.2, 1.2],
  dolphin: [1.3, 1.2, 1.3],
  squid: [1.2, 1.2, 1.2],
  shark: [1.5, 1.3, 1.5],
  seahorse: [1.0, 1.3, 1.0],
  goldfish: [1.2, 1.2, 1.2],
  flyingfish: [1.2, 1.0, 1.2],
  jellyfish: [1.2, 1.2, 1.2],
  coral: [1.2, 1.2, 1.2],
  shell: [1.0, 1.0, 1.0],
  seaweed: [1.0, 1.3, 1.0],
  plankton: [0.8, 0.8, 0.8],
} as const

export { getSpeciesGeometry, SPECIES_SCALE }
