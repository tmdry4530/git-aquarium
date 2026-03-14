import type { FishSpecies } from '@/types/fish'

export interface BoidConfig {
  separationRadius: number
  separationWeight: number
  alignmentRadius: number
  alignmentWeight: number
  cohesionRadius: number
  cohesionWeight: number
  maxSpeed: number
  maxForce: number
  boundaryRadius: number
  boundaryForce: number
}

export interface BoidState {
  id: string
  position: [number, number, number]
  velocity: [number, number, number]
  species: FishSpecies
  size: number
  stars: number
  isFossil: boolean
}

export const DEFAULT_BOID_CONFIG: BoidConfig = {
  separationRadius: 2.5,
  separationWeight: 1.5,
  alignmentRadius: 5.0,
  alignmentWeight: 1.0,
  cohesionRadius: 6.0,
  cohesionWeight: 1.0,
  maxSpeed: 3.0,
  maxForce: 0.5,
  boundaryRadius: 22,
  boundaryForce: 2.0,
} as const

// --- Vector3 utilities (tuple-based for serialization) ---

function vec3Add(
  a: [number, number, number],
  b: [number, number, number],
): [number, number, number] {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

function vec3Sub(
  a: [number, number, number],
  b: [number, number, number],
): [number, number, number] {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

function vec3Scale(
  v: [number, number, number],
  s: number,
): [number, number, number] {
  return [v[0] * s, v[1] * s, v[2] * s]
}

function vec3Length(v: [number, number, number]): number {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
}

function vec3Normalize(v: [number, number, number]): [number, number, number] {
  const len = vec3Length(v)
  if (len === 0) return [0, 0, 0]
  return [v[0] / len, v[1] / len, v[2] / len]
}

function vec3Clamp(
  v: [number, number, number],
  maxLen: number,
): [number, number, number] {
  const len = vec3Length(v)
  if (len <= maxLen) return v
  const scale = maxLen / len
  return [v[0] * scale, v[1] * scale, v[2] * scale]
}

function vec3Distance(
  a: [number, number, number],
  b: [number, number, number],
): number {
  return vec3Length(vec3Sub(a, b))
}

// --- Core Boids Rules ---

function calculateSeparation(
  boid: BoidState,
  neighbors: BoidState[],
  config: BoidConfig,
): [number, number, number] {
  let force: [number, number, number] = [0, 0, 0]
  let count = 0

  for (const n of neighbors) {
    const dist = vec3Distance(boid.position, n.position)
    if (dist > 0 && dist < config.separationRadius) {
      const diff = vec3Normalize(vec3Sub(boid.position, n.position))
      force = vec3Add(force, vec3Scale(diff, 1 / Math.max(dist, 0.1)))
      count++
    }
  }

  if (count > 0) {
    force = vec3Scale(force, 1 / count)
  }
  return force
}

function calculateAlignment(
  boid: BoidState,
  neighbors: BoidState[],
  config: BoidConfig,
): [number, number, number] {
  let avgVelocity: [number, number, number] = [0, 0, 0]
  let count = 0

  for (const n of neighbors) {
    const dist = vec3Distance(boid.position, n.position)
    if (dist > 0 && dist < config.alignmentRadius) {
      avgVelocity = vec3Add(avgVelocity, n.velocity)
      count++
    }
  }

  if (count > 0) {
    avgVelocity = vec3Scale(avgVelocity, 1 / count)
    return vec3Sub(avgVelocity, boid.velocity)
  }
  return [0, 0, 0]
}

function calculateCohesion(
  boid: BoidState,
  neighbors: BoidState[],
  config: BoidConfig,
): [number, number, number] {
  let center: [number, number, number] = [0, 0, 0]
  let count = 0

  for (const n of neighbors) {
    const dist = vec3Distance(boid.position, n.position)
    if (dist > 0 && dist < config.cohesionRadius) {
      center = vec3Add(center, n.position)
      count++
    }
  }

  if (count > 0) {
    center = vec3Scale(center, 1 / count)
    return vec3Normalize(vec3Sub(center, boid.position))
  }
  return [0, 0, 0]
}

function calculateBoundaryForce(
  boid: BoidState,
  config: BoidConfig,
): [number, number, number] {
  const br = config.boundaryRadius
  const bf = config.boundaryForce

  let fx = 0
  let fy = 0
  let fz = 0

  if (Math.abs(boid.position[0]) > br) {
    fx = -Math.sign(boid.position[0]) * bf
  }
  if (boid.position[1] < 1) {
    fy = bf
  } else if (boid.position[1] > 9) {
    fy = -bf
  }
  if (Math.abs(boid.position[2]) > br) {
    fz = -Math.sign(boid.position[2]) * bf
  }

  return [fx, fy, fz] as [number, number, number]
}

function calculateDeadZoneAvoidance(
  boid: BoidState,
  fossils: BoidState[],
  deadZoneRadius: number = 3.0,
  deadZoneForce: number = 2.0,
): [number, number, number] {
  let force: [number, number, number] = [0, 0, 0]
  for (const fossil of fossils) {
    const dist = vec3Distance(boid.position, fossil.position)
    if (dist < deadZoneRadius && dist > 0) {
      const repulsion = vec3Scale(
        vec3Normalize(vec3Sub(boid.position, fossil.position)),
        deadZoneForce * (1 - dist / deadZoneRadius),
      )
      force = vec3Add(force, repulsion)
    }
  }
  return force
}

function calculateFoodChainFlee(
  boid: BoidState,
  neighbors: BoidState[],
  fleeThreshold: number = 2.0,
  fleeRadius: number = 4.0,
  fleeForce: number = 3.0,
): [number, number, number] {
  let force: [number, number, number] = [0, 0, 0]
  for (const n of neighbors) {
    if (n.size >= boid.size * fleeThreshold) {
      const dist = vec3Distance(boid.position, n.position)
      if (dist < fleeRadius && dist > 0) {
        const flee = vec3Scale(
          vec3Normalize(vec3Sub(boid.position, n.position)),
          fleeForce,
        )
        force = vec3Add(force, flee)
      }
    }
  }
  return force
}

export function updateBoids(
  boids: BoidState[],
  config: BoidConfig,
  delta: number,
): BoidState[] {
  const fossils = boids.filter((b) => b.isFossil)
  const alive = boids.filter((b) => !b.isFossil)

  const updatedAlive = alive.map((boid) => {
    // Same-species neighbors for flocking
    const sameSpecies = alive.filter(
      (n) => n.id !== boid.id && n.species === boid.species,
    )
    const allNeighbors = alive.filter((n) => n.id !== boid.id)

    // 3 core rules (same species only)
    const separation = calculateSeparation(boid, sameSpecies, config)
    const alignment = calculateAlignment(boid, sameSpecies, config)
    const cohesion = calculateCohesion(boid, sameSpecies, config)

    // Additional forces
    const boundary = calculateBoundaryForce(boid, config)
    const deadZone = calculateDeadZoneAvoidance(boid, fossils)
    const flee = calculateFoodChainFlee(boid, allNeighbors)

    // Sum all forces
    let acceleration: [number, number, number] = [0, 0, 0]
    acceleration = vec3Add(
      acceleration,
      vec3Scale(separation, config.separationWeight),
    )
    acceleration = vec3Add(
      acceleration,
      vec3Scale(alignment, config.alignmentWeight),
    )
    acceleration = vec3Add(
      acceleration,
      vec3Scale(cohesion, config.cohesionWeight),
    )
    acceleration = vec3Add(acceleration, boundary)
    acceleration = vec3Add(acceleration, deadZone)
    acceleration = vec3Add(acceleration, flee)

    // Clamp acceleration
    acceleration = vec3Clamp(acceleration, config.maxForce)

    // Update velocity and position
    let newVelocity = vec3Add(boid.velocity, vec3Scale(acceleration, delta))
    newVelocity = vec3Clamp(newVelocity, config.maxSpeed)

    const newPosition = vec3Add(boid.position, vec3Scale(newVelocity, delta))

    return {
      ...boid,
      velocity: newVelocity,
      position: newPosition,
    }
  })

  // Fossils stay fixed
  return [...updatedAlive, ...fossils]
}

// Startle: scatter boids away from a click point
export function applyStartle(
  boids: BoidState[],
  point: [number, number, number],
  radius: number = 5.0,
  force: number = 5.0,
): BoidState[] {
  return boids.map((boid) => {
    if (boid.isFossil) return boid
    const dist = vec3Distance(boid.position, point)
    if (dist > radius || dist === 0) return boid

    const direction = vec3Normalize(vec3Sub(boid.position, point))
    const startleVelocity = vec3Scale(direction, force * (1 - dist / radius))
    return {
      ...boid,
      velocity: vec3Add(boid.velocity, startleVelocity),
    }
  })
}

export {
  vec3Add,
  vec3Sub,
  vec3Scale,
  vec3Length,
  vec3Normalize,
  vec3Clamp,
  vec3Distance,
  calculateSeparation,
  calculateAlignment,
  calculateCohesion,
  calculateBoundaryForce,
  calculateDeadZoneAvoidance,
  calculateFoodChainFlee,
}
