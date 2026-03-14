import { describe, it, expect } from 'vitest'
import {
  updateBoids,
  applyStartle,
  calculateSeparation,
  calculateAlignment,
  calculateCohesion,
  calculateBoundaryForce,
  calculateDeadZoneAvoidance,
  calculateFoodChainFlee,
  vec3Distance,
  vec3Length,
  DEFAULT_BOID_CONFIG,
} from '@/lib/aquarium/boids'
import type { BoidState } from '@/lib/aquarium/boids'

function makeBoid(overrides: Partial<BoidState> = {}): BoidState {
  return {
    id: 'test-1',
    position: [0, 5, 0],
    velocity: [0.5, 0, 0.5],
    species: 'angelfish',
    size: 1.0,
    stars: 10,
    isFossil: false,
    ...overrides,
  }
}

describe('Boids Algorithm', () => {
  describe('calculateSeparation', () => {
    it('should return zero vector when no neighbors are nearby', () => {
      const boid = makeBoid({ position: [0, 5, 0] })
      const neighbor = makeBoid({ id: 'far', position: [100, 5, 0] })
      const result = calculateSeparation(boid, [neighbor], DEFAULT_BOID_CONFIG)
      expect(vec3Length(result)).toBe(0)
    })

    it('should push away from close neighbors', () => {
      const boid = makeBoid({ position: [0, 5, 0] })
      const neighbor = makeBoid({ id: 'close', position: [1, 5, 0] })
      const result = calculateSeparation(boid, [neighbor], DEFAULT_BOID_CONFIG)
      // Should push in -x direction (away from neighbor at +x)
      expect(result[0]).toBeLessThan(0)
    })

    it('should produce stronger force for closer neighbors', () => {
      const boid = makeBoid({ position: [0, 5, 0] })
      const closeNeighbor = makeBoid({ id: 'n1', position: [0.5, 5, 0] })
      const farNeighbor = makeBoid({ id: 'n2', position: [2, 5, 0] })

      const closeForce = calculateSeparation(
        boid,
        [closeNeighbor],
        DEFAULT_BOID_CONFIG,
      )
      const farForce = calculateSeparation(
        boid,
        [farNeighbor],
        DEFAULT_BOID_CONFIG,
      )

      expect(vec3Length(closeForce)).toBeGreaterThan(vec3Length(farForce))
    })
  })

  describe('calculateAlignment', () => {
    it('should return zero when no neighbors in range', () => {
      const boid = makeBoid({ position: [0, 5, 0] })
      const neighbor = makeBoid({ id: 'far', position: [100, 5, 0] })
      const result = calculateAlignment(boid, [neighbor], DEFAULT_BOID_CONFIG)
      expect(vec3Length(result)).toBe(0)
    })

    it('should steer toward average velocity of neighbors', () => {
      const boid = makeBoid({
        position: [0, 5, 0],
        velocity: [1, 0, 0],
      })
      const neighbor = makeBoid({
        id: 'n1',
        position: [2, 5, 0],
        velocity: [0, 0, 1],
      })
      const result = calculateAlignment(boid, [neighbor], DEFAULT_BOID_CONFIG)
      // Should have positive z component (toward neighbor's velocity direction)
      expect(result[2]).toBeGreaterThan(0)
      // Should have negative x component (away from own velocity)
      expect(result[0]).toBeLessThan(0)
    })
  })

  describe('calculateCohesion', () => {
    it('should return zero when no neighbors in range', () => {
      const boid = makeBoid({ position: [0, 5, 0] })
      const neighbor = makeBoid({ id: 'far', position: [100, 5, 0] })
      const result = calculateCohesion(boid, [neighbor], DEFAULT_BOID_CONFIG)
      expect(vec3Length(result)).toBe(0)
    })

    it('should steer toward center of nearby neighbors', () => {
      const boid = makeBoid({ position: [0, 5, 0] })
      const neighbor = makeBoid({ id: 'n1', position: [3, 5, 0] })
      const result = calculateCohesion(boid, [neighbor], DEFAULT_BOID_CONFIG)
      // Should pull toward +x (where neighbor is)
      expect(result[0]).toBeGreaterThan(0)
    })
  })

  describe('calculateBoundaryForce', () => {
    it('should push inward when near boundary', () => {
      const boid = makeBoid({ position: [23, 5, 0] })
      const result = calculateBoundaryForce(boid, DEFAULT_BOID_CONFIG)
      // Should push in -x direction
      expect(result[0]).toBeLessThan(0)
    })

    it('should push up when near bottom', () => {
      const boid = makeBoid({ position: [0, 0.5, 0] })
      const result = calculateBoundaryForce(boid, DEFAULT_BOID_CONFIG)
      expect(result[1]).toBeGreaterThan(0)
    })

    it('should push down when near top', () => {
      const boid = makeBoid({ position: [0, 10, 0] })
      const result = calculateBoundaryForce(boid, DEFAULT_BOID_CONFIG)
      expect(result[1]).toBeLessThan(0)
    })

    it('should return zero when in center', () => {
      const boid = makeBoid({ position: [0, 5, 0] })
      const result = calculateBoundaryForce(boid, DEFAULT_BOID_CONFIG)
      expect(result[0]).toBe(0)
      expect(result[1]).toBe(0)
      expect(result[2]).toBe(0)
    })
  })

  describe('calculateDeadZoneAvoidance', () => {
    it('should repel from nearby fossils', () => {
      const boid = makeBoid({ position: [0, 5, 0] })
      const fossil = makeBoid({
        id: 'fossil',
        position: [1, 5, 0],
        isFossil: true,
      })
      const result = calculateDeadZoneAvoidance(boid, [fossil])
      // Should push away from fossil (-x direction)
      expect(result[0]).toBeLessThan(0)
    })

    it('should not affect boids far from fossils', () => {
      const boid = makeBoid({ position: [0, 5, 0] })
      const fossil = makeBoid({
        id: 'fossil',
        position: [10, 5, 0],
        isFossil: true,
      })
      const result = calculateDeadZoneAvoidance(boid, [fossil])
      expect(vec3Length(result)).toBe(0)
    })
  })

  describe('calculateFoodChainFlee', () => {
    it('should flee from much larger neighbors', () => {
      const small = makeBoid({ position: [0, 5, 0], size: 0.5 })
      const big = makeBoid({ id: 'big', position: [2, 5, 0], size: 2.0 })
      const result = calculateFoodChainFlee(small, [big])
      // Should flee in -x direction (away from big fish)
      expect(result[0]).toBeLessThan(0)
    })

    it('should not flee from similar-sized neighbors', () => {
      const boid = makeBoid({ position: [0, 5, 0], size: 1.0 })
      const similar = makeBoid({ id: 'sim', position: [2, 5, 0], size: 1.2 })
      const result = calculateFoodChainFlee(boid, [similar])
      expect(vec3Length(result)).toBe(0)
    })
  })

  describe('updateBoids', () => {
    it('should not move fossil boids', () => {
      const fossil = makeBoid({
        id: 'fossil',
        position: [5, 0.5, 5],
        velocity: [0, 0, 0],
        isFossil: true,
      })
      const result = updateBoids([fossil], DEFAULT_BOID_CONFIG, 0.016)
      const updated = result.find((b) => b.id === 'fossil')
      expect(updated).toBeDefined()
      expect(updated!.position[0]).toBe(5)
      expect(updated!.position[2]).toBe(5)
    })

    it('should update alive boid positions', () => {
      const boid = makeBoid({
        position: [0, 5, 0],
        velocity: [1, 0, 0],
      })
      const result = updateBoids([boid], DEFAULT_BOID_CONFIG, 0.016)
      const updated = result.find((b) => b.id === boid.id)
      expect(updated).toBeDefined()
      // Position should have changed from velocity
      expect(updated!.position[0]).not.toBe(0)
    })

    it('should keep boids within speed limits', () => {
      const boid = makeBoid({
        velocity: [10, 10, 10],
      })
      const result = updateBoids([boid], DEFAULT_BOID_CONFIG, 0.016)
      const updated = result.find((b) => b.id === boid.id)
      expect(updated).toBeDefined()
      const speed = vec3Length(updated!.velocity)
      expect(speed).toBeLessThanOrEqual(DEFAULT_BOID_CONFIG.maxSpeed + 0.01)
    })

    it('should make same-species boids flock together', () => {
      // Two same-species boids within cohesion radius should move toward each other
      const boid1 = makeBoid({
        id: 'a1',
        position: [-2, 5, 0],
        velocity: [0.1, 0, 0],
        species: 'angelfish',
      })
      const boid2 = makeBoid({
        id: 'a2',
        position: [2, 5, 0],
        velocity: [-0.1, 0, 0],
        species: 'angelfish',
      })

      const initialDist = vec3Distance(boid1.position, boid2.position)

      // Run several iterations
      let boids = [boid1, boid2]
      for (let i = 0; i < 200; i++) {
        boids = updateBoids(boids, DEFAULT_BOID_CONFIG, 0.016)
      }

      const b1 = boids.find((b) => b.id === 'a1')
      const b2 = boids.find((b) => b.id === 'a2')
      expect(b1).toBeDefined()
      expect(b2).toBeDefined()
      const finalDist = vec3Distance(b1!.position, b2!.position)
      // They should be closer after iterations (cohesion pulls them together)
      expect(finalDist).toBeLessThan(initialDist)
    })
  })

  describe('applyStartle', () => {
    it('should scatter boids away from click point', () => {
      const boid = makeBoid({
        position: [1, 5, 0],
        velocity: [0, 0, 0],
      })
      const result = applyStartle([boid], [0, 5, 0], 5.0, 5.0)
      const updated = result[0]
      expect(updated).toBeDefined()
      // Should be pushed in +x direction (away from click at origin)
      expect(updated!.velocity[0]).toBeGreaterThan(0)
    })

    it('should not affect boids outside startle radius', () => {
      const boid = makeBoid({
        position: [10, 5, 0],
        velocity: [0.5, 0, 0],
      })
      const result = applyStartle([boid], [0, 5, 0], 5.0, 5.0)
      const updated = result[0]
      expect(updated).toBeDefined()
      // Velocity should remain unchanged
      expect(updated!.velocity[0]).toBe(0.5)
    })

    it('should not move fossil boids', () => {
      const fossil = makeBoid({
        position: [1, 0.5, 0],
        velocity: [0, 0, 0],
        isFossil: true,
      })
      const result = applyStartle([fossil], [0, 0.5, 0], 5.0, 5.0)
      const updated = result[0]
      expect(updated).toBeDefined()
      expect(updated!.velocity[0]).toBe(0)
    })
  })
})
