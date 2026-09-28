import { Canvas, useFrame, useLoader, useThree, type ThreeEvent } from '@react-three/fiber'
import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ORIGIN, TARGET_MARKETS } from '../types/market'

// Textures: NASA Blue Marble / Black Marble derived imagery (public domain), served from /public.
const dayUrl = '/earth-day.jpg'
const nightUrl = '/earth-night.jpg'
const waterUrl = '/earth-water.jpg'
const cloudsUrl = '/earth-clouds.jpg'

// Textures: NASA Blue Marble / Black Marble derived imagery (public domain),
// via the MIT-licensed three-globe package, resized and bundled locally.

/** lat/lon (degrees) → point on a sphere, matching THREE.SphereGeometry's UV layout. */
function latLonToVector(lat: number, lon: number, radius: number) {
  const phi = ((lon + 180) / 360) * Math.PI * 2
  const theta = ((90 - lat) * Math.PI) / 180
  return new THREE.Vector3(-Math.cos(phi) * Math.sin(theta), Math.cos(theta), Math.sin(phi) * Math.sin(theta)).multiplyScalar(radius)
}

/** Point on the unit sphere (earth-local) → lat/lon in degrees. */
function vectorToLatLon(p: THREE.Vector3) {
  const n = p.clone().normalize()
  const lat = (Math.asin(n.y) * 180) / Math.PI
  let u = Math.atan2(n.z, -n.x) / (Math.PI * 2)
  if (u < 0) u += 1
  return { lat, lon: u * 360 - 180 }
}

// Sun direction fixed relative to the camera, so the lit side always faces the viewer
// from the upper left, whichever way the globe is dragged.
const SUN_IN_VIEW = new THREE.Vector3(-0.85, 0.32, 0.45).normalize()

const earthVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vUv = uv;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vPosW = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`
const earthFragment = /* glsl */ `
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform sampler2D waterMap;
  uniform vec3 sunDir;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vec3 n = normalize(vNormalW);
    vec3 viewDir = normalize(cameraPosition - vPosW);
    float ndl = dot(n, sunDir);
    float dayMix = smoothstep(-0.18, 0.28, ndl);

    vec3 day = texture2D(dayMap, vUv).rgb * (0.18 + 1.05 * max(ndl, 0.0));
    vec3 night = texture2D(nightMap, vUv).rgb * vec3(1.35, 1.1, 0.8) * 1.6;
    vec3 color = mix(night, day, dayMix);

    float water = texture2D(waterMap, vUv).r;
    vec3 h = normalize(sunDir + viewDir);
    color += vec3(0.9, 0.95, 1.0) * pow(max(dot(n, h), 0.0), 60.0) * water * 0.55 * dayMix;

    float fresnel = pow(1.0 - max(dot(n, viewDir), 0.0), 3.0);
    color += vec3(0.32, 0.58, 1.0) * fresnel * (0.2 + 0.8 * dayMix) * 0.55;

    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`
const cloudsFragment = /* glsl */ `
  uniform sampler2D cloudMap;
  uniform vec3 sunDir;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    float a = texture2D(cloudMap, vUv).r;
    float ndl = dot(normalize(vNormalW), sunDir);
    float light = smoothstep(-0.2, 0.5, ndl);
    gl_FragColor = vec4(vec3(1.0) * (0.08 + 0.92 * light), a * 0.8 * (0.15 + 0.85 * light));
    #include <colorspace_fragment>
  }
`
const atmosphereVertex = /* glsl */ `
  varying vec3 vNormalV;
  void main() {
    vNormalV = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const atmosphereFragment = /* glsl */ `
  varying vec3 vNormalV;
  void main() {
    float i = pow(max(0.66 - dot(vNormalV, vec3(0.0, 0.0, 1.0)), 0.0), 3.2);
    gl_FragColor = vec4(0.34, 0.6, 1.0, 1.0) * i * 1.05;
  }
`

function Graticule() {
  const geometry = useMemo(() => {
    const pts: number[] = []
    const r = 1.004
    const push = (a: THREE.Vector3, b: THREE.Vector3) => pts.push(a.x, a.y, a.z, b.x, b.y, b.z)
    for (let lat = -75; lat <= 75; lat += 15) {
      for (let lon = -180; lon < 180; lon += 3) push(latLonToVector(lat, lon, r), latLonToVector(lat, lon + 3, r))
    }
    for (let lon = -180; lon < 180; lon += 15) {
      for (let lat = -87; lat < 87; lat += 3) push(latLonToVector(lat, lon, r), latLonToVector(lat + 3, lon, r))
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#9cc7ff" transparent opacity={0.07} depthWrite={false} />
    </lineSegments>
  )
}

function Stars() {
  const geometry = useMemo(() => {
    // Decorative backdrop only; carries no information. Seeded so every render is identical.
    let seed = 20260927
    const rand = () => {
      seed = (seed + 0x6d2b79f5) | 0
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
    const count = 1800
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const z = rand() * 2 - 1
      const a = rand() * Math.PI * 2
      const r = Math.sqrt(1 - z * z)
      const d = 40 + rand() * 30
      arr.set([r * Math.cos(a) * d, z * d, r * Math.sin(a) * d], i * 3)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    return g
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <points geometry={geometry}>
      <pointsMaterial color="#cfd8e6" size={0.09} sizeAttenuation transparent opacity={0.55} depthWrite={false} />
    </points>
  )
}

export interface GlobeHover {
  /** Market name when hovering a marker. */
  label?: string
  lat: number
  lon: number
}

interface MarkerProps {
  lat: number
  lon: number
  kind: 'market' | 'origin'
  country: string
  selected?: boolean
  onHover: (h: GlobeHover | null) => void
  onSelect?: (country: string) => void
}

function Marker({ lat, lon, kind, country, selected = false, onHover, onSelect }: MarkerProps) {
  const pos = useMemo(() => latLonToVector(lat, lon, 1.012), [lat, lon])
  const ring = useRef<THREE.Mesh>(null)
  const quaternion = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize()), [pos])
  const color = kind === 'origin' ? '#7fd1b9' : selected ? '#ffffff' : '#e3a73a'
  useFrame(({ clock }) => {
    if (!ring.current) return
    const t = (clock.elapsedTime * 0.6 + lat * 0.01) % 1
    ring.current.scale.setScalar(1 + t * 2.2)
    ;(ring.current.material as THREE.MeshBasicMaterial).opacity = 0.55 * (1 - t)
  })
  return (
    <group position={pos} quaternion={quaternion}>
      <mesh>
        <circleGeometry args={[0.011, 20]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[0.013, 0.017, 32]} />
        <meshBasicMaterial color={color} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      {/* Larger invisible target so markers are easy to hover. */}
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover({ label: kind === 'origin' ? `${country} (origin)` : country, lat, lon })
          if (onSelect) document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => { onHover(null); document.body.style.cursor = '' }}
        onClick={(e) => { if (onSelect) { e.stopPropagation(); onSelect(country) } }}
      >
        <circleGeometry args={[0.045, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

function Controls({ onInteract }: { onInteract: (active: boolean) => void }) {
  const { camera, gl } = useThree()
  const ref = useRef<OrbitControls | null>(null)
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement)
    controls.enablePan = false
    controls.enableDamping = true
    controls.dampingFactor = 0.07
    controls.rotateSpeed = 0.45
    controls.zoomSpeed = 0.6
    controls.minDistance = 2.4
    controls.maxDistance = 6
    // Touch screens: rotation only, so the page still scrolls with a swipe outside the globe.
    controls.enableZoom = !window.matchMedia('(pointer: coarse)').matches
    const start = () => onInteract(true)
    const end = () => onInteract(false)
    controls.addEventListener('start', start)
    controls.addEventListener('end', end)
    ref.current = controls
    return () => {
      controls.removeEventListener('start', start)
      controls.removeEventListener('end', end)
      controls.dispose()
      ref.current = null
    }
  }, [camera, gl, onInteract])
  // Runs inside the render loop, so it stops when rendering pauses.
  useFrame(() => ref.current?.update())
  return null
}

interface GlobeProps {
  onHover: (h: GlobeHover | null) => void
  /** Called with a market's country when its marker is clicked. */
  onSelect?: (country: string) => void
  selected?: string | null
}

function Earth({ onHover, onSelect, selected }: GlobeProps) {
  const { gl, camera } = useThree()
  const [day, night, water, clouds] = useLoader(THREE.TextureLoader, [dayUrl, nightUrl, waterUrl, cloudsUrl])
  const spin = useRef<THREE.Group>(null)
  const cloudLayer = useRef<THREE.Mesh>(null)
  const paused = useRef(false)

  useLayoutEffect(() => {
    const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy())
    for (const t of [day, night]) t.colorSpace = THREE.SRGBColorSpace
    for (const t of [day, night, water, clouds]) {
      t.anisotropy = aniso
      t.needsUpdate = true
    }
  }, [day, night, water, clouds, gl])

  const sunDir = useMemo(() => new THREE.Vector3(), [])
  const earthMat = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader: earthVertex, fragmentShader: earthFragment, uniforms: { dayMap: { value: day }, nightMap: { value: night }, waterMap: { value: water }, sunDir: { value: sunDir } } }),
    [day, night, water, sunDir],
  )
  const cloudMat = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader: earthVertex, fragmentShader: cloudsFragment, transparent: true, depthWrite: false, uniforms: { cloudMap: { value: clouds }, sunDir: { value: sunDir } } }),
    [clouds, sunDir],
  )
  const atmoMat = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader: atmosphereVertex, fragmentShader: atmosphereFragment, side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }),
    [],
  )
  useEffect(() => () => { earthMat.dispose(); cloudMat.dispose(); atmoMat.dispose() }, [earthMat, cloudMat, atmoMat])

  useFrame((_, delta) => {
    sunDir.copy(SUN_IN_VIEW).applyQuaternion(camera.quaternion)
    const dt = Math.min(delta, 0.05)
    if (spin.current && !paused.current) spin.current.rotation.y += dt * 0.045
    if (cloudLayer.current) cloudLayer.current.rotation.y += dt * 0.012
  })

  // Start with India, Africa, and Russia facing the viewer.
  const initialYaw = useMemo(() => {
    const p = latLonToVector(20, 45, 1)
    return Math.atan2(-p.x, p.z)
  }, [])

  const hoverTimer = useRef<number | undefined>(undefined)
  function onMove(e: ThreeEvent<PointerEvent>) {
    if (!spin.current) return
    const local = spin.current.worldToLocal(e.point.clone())
    window.clearTimeout(hoverTimer.current)
    onHover(vectorToLatLon(local))
  }

  return (
    <group rotation={[0.32, 0, -0.12]}>
      <group ref={spin} rotation={[0, initialYaw, 0]}>
        <mesh
          material={earthMat}
          onPointerMove={onMove}
          onPointerOver={() => { paused.current = true; document.body.style.cursor = 'grab' }}
          onPointerOut={() => { paused.current = false; document.body.style.cursor = ''; hoverTimer.current = window.setTimeout(() => onHover(null), 60) }}
        >
          <sphereGeometry args={[1, 128, 128]} />
        </mesh>
        <Graticule />
        {TARGET_MARKETS.map((m) => (
          <Marker key={m.country} lat={m.lat} lon={m.lon} kind="market" country={m.country} selected={selected === m.country} onHover={onHover} onSelect={onSelect} />
        ))}
        <Marker lat={ORIGIN.lat} lon={ORIGIN.lon} kind="origin" country={ORIGIN.country} onHover={onHover} />
        <mesh ref={cloudLayer} material={cloudMat} raycast={() => null}>
          <sphereGeometry args={[1.01, 96, 96]} />
        </mesh>
      </group>
      <mesh material={atmoMat} scale={1.13} raycast={() => null}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>
    </group>
  )
}

function supportsWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/** Large interactive Earth. Rendering pauses when the globe is off screen or the tab is hidden. */
function Globe({ onHover, onSelect, selected = null }: GlobeProps) {
  const wrap = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  const [webgl] = useState(supportsWebGL)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    let onScreen = true
    const update = () => setVisible(onScreen && !document.hidden)
    const io = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; update() })
    io.observe(el)
    document.addEventListener('visibilitychange', update)
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', update) }
  }, [])

  useEffect(() => () => { document.body.style.cursor = '' }, [])

  if (!webgl) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="max-w-xs text-center text-sm text-white/50">The 3D globe needs WebGL, which this browser has turned off.</p>
      </div>
    )
  }

  return (
    <div ref={wrap} className={`h-full w-full ${dragging ? 'cursor-grabbing' : ''}`} aria-label="Interactive 3D globe. Drag to rotate." role="img">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, 1.75]}
        camera={{ fov: 32, position: [0, 0, 4.35], near: 0.1, far: 200 }}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
        onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05 }}
      >
        <Stars />
        <Earth onHover={onHover} onSelect={onSelect} selected={selected} />
        <Controls onInteract={setDragging} />
      </Canvas>
    </div>
  )
}

// Memoized: hover readouts update the parent often, and the canvas must not re-render with them.
export default memo(Globe)
