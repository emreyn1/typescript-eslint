'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';

interface GlobeProps {
  className?: string;
}

// Bölge koordinatları (lat, lon)
const locations = {
  London: { lat: 51.5074, lon: -0.1278, name: 'London, UK', flag: '🇬🇧' },
  Dubai: { lat: 25.2048, lon: 55.2708, name: 'Dubai, UAE', flag: '🇦🇪' },
  'New York': { lat: 40.7128, lon: -74.0060, name: 'New York, US', flag: '🇺🇸' },
};

export default function Globe({ className }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    globe: THREE.Mesh | null;
    controls: OrbitControls | null;
    animationId: number | null;
  }>({
    scene: null,
    camera: null,
    renderer: null,
    globe: null,
    controls: null,
    animationId: null,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Globe geometry ve material
    const globeGeometry = new THREE.SphereGeometry(2, 64, 64);
    
    // Earth texture loader
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
      () => {
        // Texture yüklendiğinde
      },
      undefined,
      (error) => {
        console.warn('Earth texture failed to load, using default material');
      }
    );

    const globeMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.8,
      metalness: 0.2,
    });

    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // Zoom'u devre dışı bırak
    controls.enablePan = false;
    controls.minDistance = 4;
    controls.maxDistance = 4; // Sabit mesafe

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animate
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      globe.rotation.y += 0.002; // Yavaş dönüş
      renderer.render(scene, camera);
    };
    animate();

    // Scene ref'e kaydet
    sceneRef.current = {
      scene,
      camera,
      renderer,
      globe,
      controls,
      animationId,
    };

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) cancelAnimationFrame(animationId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      globeMaterial.dispose();
      globeGeometry.dispose();
    };
  }, []);

  // Lat/Lon'u 3D koordinatlara çevir (spherical coordinates)
  // Earth texture mapping: X = longitude, Y = latitude
  // Three.js sphere: phi (0 = kuzey kutbu, PI = güney kutbu), theta (0 = başlangıç, 2PI = tam tur)
  const latLonToVector3 = (lat: number, lon: number, radius: number = 2) => {
    // Lat: -90 (güney) ile +90 (kuzey) arası
    // Lon: -180 (batı) ile +180 (doğu) arası
    
    // Three.js sphere koordinatları:
    // phi: 0 (kuzey kutbu) ile PI (güney kutbu) arası
    // theta: 0 (başlangıç) ile 2*PI (tam tur) arası
    const phi = (90 - lat) * (Math.PI / 180); // Enlem: 0 = kuzey kutbu, PI = güney kutbu
    const theta = (lon + 180) * (Math.PI / 180); // Boylam: 0 = -180°, 2PI = +180°

    // Three.js koordinat sistemi: X sağ, Y yukarı, Z öne
    // Sphere koordinatları:
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi); // Y ekseni kuzey-güney (kuzey = +Y)
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
  };

  const handleLocationClick = (locationKey: keyof typeof locations) => {
    const location = locations[locationKey];
    setSelectedLocation(locationKey);

    if (!sceneRef.current.camera || !sceneRef.current.globe || !sceneRef.current.controls) return;

    const camera = sceneRef.current.camera;
    const globe = sceneRef.current.globe;
    const controls = sceneRef.current.controls;

    // Globe üzerindeki hedef nokta (globe'un yüzeyinde, merkezden)
    const targetPoint = latLonToVector3(location.lat, location.lon, 2);
    
    // Globe'un rotation'ını hesaba kat (eğer globe dönüyorsa)
    // Globe'un rotation'ı sadece görsel, koordinatlar zaten doğru
    
    // Kamerayı hedef noktaya bakacak şekilde konumlandır
    // Kamerayı globe'un dışından, hedef noktaya doğru bakacak şekilde yerleştir
    const distance = 4; // Globe'dan uzaklık (sabit)
    const direction = targetPoint.clone().normalize();
    
    // Kamerayı hedef noktanın dışına yerleştir (globe'un dışından bakacak)
    const newCameraPosition = direction.multiplyScalar(distance);
    
    // Controls target'ı hedef noktaya ayarla (globe'un merkezi değil, yüzeyindeki nokta)
    const currentTarget = controls.target.clone();
    const currentPosition = camera.position.clone();

    // Globe'un otomatik dönüşünü geçici olarak durdur
    const originalRotationSpeed = 0.002;
    globe.rotation.y = globe.rotation.y; // Mevcut rotation'ı koru

    // GSAP ile smooth animation - hem kamera pozisyonu hem de target
    const timeline = gsap.timeline({
      onComplete: () => {
        // Animasyon tamamlandığında kesin değerlere ayarla
        camera.position.copy(newCameraPosition);
        controls.target.copy(targetPoint);
        controls.update();
      }
    });

    // Kamera pozisyonunu animasyonla güncelle
    timeline.to(camera.position, {
      x: newCameraPosition.x,
      y: newCameraPosition.y,
      z: newCameraPosition.z,
      duration: 2,
      ease: 'power2.inOut',
    }, 0);

    // Target'ı animasyonla güncelle
    timeline.to(controls.target, {
      x: targetPoint.x,
      y: targetPoint.y,
      z: targetPoint.z,
      duration: 2,
      ease: 'power2.inOut',
      onUpdate: () => {
        controls.update();
      }
    }, 0);
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={containerRef} className="w-full h-full rounded-lg overflow-hidden" />
      
      {/* Butonlar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex gap-2 flex-wrap justify-center">
        {(Object.keys(locations) as Array<keyof typeof locations>).map((key) => (
          <button
            key={key}
            onClick={() => handleLocationClick(key)}
            className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 flex items-center gap-2 ${
              selectedLocation === key
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                : 'bg-background/90 backdrop-blur-sm border border-border text-foreground hover:bg-background hover:scale-105'
            }`}
            aria-label={`Navigate to ${locations[key].name}`}
          >
            <span className="text-lg">{locations[key].flag}</span>
            <span>{key}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

