'use client'

const ROCK_COUNT = 15

interface RockData {
  id: number
  position: [number, number, number]
  scale: number
  rotation: [number, number, number]
  detail: 0 | 1
}

// Pre-computed at module load time to avoid calling Math.random() during render
const ROCK_DATA: RockData[] = Array.from({ length: ROCK_COUNT }, (_, i) => ({
  id: i,
  position: [
    (Math.random() - 0.5) * 50,
    -1.5 + Math.random() * 0.5,
    (Math.random() - 0.5) * 50,
  ] as [number, number, number],
  scale: 0.3 + Math.random() * 0.8,
  rotation: [
    Math.random() * Math.PI,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI,
  ] as [number, number, number],
  detail: Math.floor(Math.random() * 2) as 0 | 1,
}))

function Rocks() {
  return (
    <group>
      {ROCK_DATA.map((rock) => (
        <mesh
          key={rock.id}
          position={rock.position}
          rotation={rock.rotation}
          scale={rock.scale}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[0.5, rock.detail]} />
          <meshStandardMaterial
            color="#2a4a6c"
            roughness={0.95}
            metalness={0.05}
          />
        </mesh>
      ))}
    </group>
  )
}

export { Rocks }
