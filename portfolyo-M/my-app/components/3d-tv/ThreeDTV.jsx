"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { CSS3DRenderer, CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer";

export default function ThreeDTV() {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const cssObjectRef = useRef(null);
  const controlsRef = useRef(null); 
  const channels = [
    "https://ai-chattt.vercel.app/",
    "https://e-commercet.vercel.app/",
    "https://convertioo.vercel.app/",
    "https://pitchyourstartup.vercel.app/",
    "https://emre-watch.vercel.app/",
  ];
  const [currentChannel, setCurrentChannel] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 1024;
    
    // iOS Safari tespiti
    const isIOS = typeof window !== 'undefined' && (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
    
    // Debug: iOS tespitini logla
    console.log("🔍 Cihaz Tespiti:", {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      maxTouchPoints: navigator.maxTouchPoints,
      isIOS: isIOS,
      isMobile: isMobileDevice
    });
    
    // Console'dan scale ve offset kontrolü için
    if (typeof window !== 'undefined') {
      window.__model = window.__model || {
        scale: isMobileDevice ? 0.5 : 0.9
      };
      // iOS offset - her cihazda çalışsın, test için
      window.__iOSOffset = window.__iOSOffset ?? 0.05;
      window.__isIOS = isIOS;
    }
    // KAMERA
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      5000
    );

    // WEBGL RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.style.zIndex = "0"; 
    container.appendChild(renderer.domElement);

    // Işıklar
    const ambient = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 2);
    directional.position.set(5, 10, 10);
    scene.add(directional);

    // CSS3D RENDERER
    const rendererCSS = new CSS3DRenderer();
    rendererCSS.setSize(container.clientWidth, container.clientHeight);
    rendererCSS.domElement.style.position = "absolute";
    rendererCSS.domElement.style.top = "0";
    rendererCSS.domElement.style.left = "0";
    rendererCSS.domElement.style.zIndex = "10"; 
    rendererCSS.domElement.style.pointerEvents = "auto"; 
    container.appendChild(rendererCSS.domElement);

    // ORBITCONTROLS
    const controls = new OrbitControls(camera, rendererCSS.domElement); 
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.enableZoom = false;
    controls.enableRotate = true;
    controlsRef.current = controls;
    
    // Wheel event
    const onWheel = (e) => {
      const target = e.target;
      if (container.contains(target) && !iframeRef.current?.contains(target)) {
        // Scroll koruması
      }
    };
    container.addEventListener('wheel', onWheel, { passive: true });

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let screenMeshObject = null; 

    // Pointer events
    const onPointerDown = (event) => {
      mouse.x = (event.clientX / container.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / container.clientHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = screenMeshObject ? raycaster.intersectObject(screenMeshObject) : [];
      controls.enabled = intersects.length === 0;
    };
    
    const onPointerUp = () => {
      controls.enabled = true; 
    };

    rendererCSS.domElement.addEventListener('pointerdown', onPointerDown, false);
    document.addEventListener('pointerup', onPointerUp, false); 


    // GLTF Loader
    const loader = new GLTFLoader();
    let tvModel = null; // Model referansı (console'dan scale değiştirmek için)
    
    loader.load(
      "/models/3dtv.glb",
      (gltf) => {
        const tv = gltf.scene;
        tvModel = tv; // Referansı sakla
        window.__tvModel = tv; // Console'dan erişim için
        
        // Model scale (console'dan değiştirilebilir)
        const modelScale = window.__model?.scale || (isMobileDevice ? (0.5, 10, 0.5) : (0.9, 0.9, 0.9));
        tv.scale.setScalar(modelScale);
        scene.add(tv);

        const box = new THREE.Box3().setFromObject(tv);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        camera.position.copy(center.clone().add(new THREE.Vector3(0, size.y * 0.5, size.z * 2 + 1)));
        camera.lookAt(center);
        controls.target.copy(center);
        controls.update();

        // Ekran mesh'ini bulma
        let screenMesh = null;
        tv.traverse((child) => {
          if (child.isMesh && child.name === "TV_49Zoll_Screen1_0") {
            screenMesh = child;
            screenMeshObject = child;
          }
        });

        // Iframe oluşturma - Hem desktop hem mobil için CSS3DObject kullan (3D efekt için)
        const iframe = document.createElement("iframe");
        iframe.src = channels[currentChannel];
        iframe.style.border = "0";
        iframe.style.pointerEvents = "auto";
        iframe.style.background = "white";
        iframe.style.overflow = "hidden";
        iframe.style.position = "absolute";
        iframe.style.zIndex = "100";
        iframeRef.current = iframe;

        // CSS3DObject - hem desktop hem mobil
        const iframeObj = new CSS3DObject(iframe);
        cssObjectRef.current = iframeObj;

        if (screenMesh) {
          screenMesh.updateMatrixWorld(true);
          const screenBox = new THREE.Box3().setFromObject(screenMesh);
          const screenCenter = screenBox.getCenter(new THREE.Vector3());
          const screenSize = screenBox.getSize(new THREE.Vector3());
          
          // Debug için sakla
          window.__screenMesh = screenMesh;
          window.__screenBox = screenBox;
          window.__screenCenter = screenCenter;
          
          const worldToPixelScale = 1000;

          // CSS3DObject ayarları - hem desktop hem mobil
          iframe.style.width = `${screenSize.x * worldToPixelScale}px`;
          iframe.style.height = `${screenSize.y * worldToPixelScale}px`;
          
          // Orijinal pozisyonu sakla (animate'te offset için)
          window.__screenCenterY = screenCenter.y;
          
          cssObjectRef.current.position.copy(screenCenter);
          cssObjectRef.current.position.z += 0.01;
          cssObjectRef.current.rotation.copy(screenMesh.rotation);
          cssObjectRef.current.scale.set(1 / worldToPixelScale, 1 / worldToPixelScale, 1 / worldToPixelScale);
          scene.add(cssObjectRef.current);
          
          console.log("✅ CSS3DObject oluşturuldu, screenCenter.y:", screenCenter.y);

          screenMesh.material.opacity = 0;
          screenMesh.material.transparent = true;
        }

        // Ekran ışığı
        if (screenMesh) {
          const screenBox = new THREE.Box3().setFromObject(screenMesh);
          const screenCenter = screenBox.getCenter(new THREE.Vector3());
          const screenLight = new THREE.PointLight(0xffffff, 2, 10);
          screenLight.position.copy(screenCenter);
          screenLight.position.z += 0.1;
          scene.add(screenLight);
        }
      },
      undefined,
      (err) => console.error("Model loading error:", err)
    );

    // Kanal değiştirme
    const changeChannel = (index) => {
      if (iframeRef.current && channels[index]) {
        iframeRef.current.src = channels[index];
        setCurrentChannel(index);
      }
    };
    window.changeTVChannel = changeChannel;

    // iOS için her frame'de boyut kontrolü
    let lastWidth = container.clientWidth;
    let lastHeight = container.clientHeight;
    
    // Animate
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      
      // Her frame'de container boyutunu kontrol et (iOS adres çubuğu için)
      const currentWidth = container.clientWidth;
      const currentHeight = container.clientHeight;
      if (lastWidth !== currentWidth || lastHeight !== currentHeight) {
        lastWidth = currentWidth;
        lastHeight = currentHeight;
        camera.aspect = currentWidth / currentHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(currentWidth, currentHeight);
        rendererCSS.setSize(currentWidth, currentHeight);
      }
      
      // Model scale'i console'dan güncelle
      if (window.__tvModel && window.__model) {
        const currentScale = window.__tvModel.scale.x;
        const targetScale = window.__model.scale;
        if (currentScale !== targetScale) {
          window.__tvModel.scale.setScalar(targetScale);
          // Scale değişince screenBox'ı güncelle
          if (window.__screenMesh) {
            window.__screenMesh.updateMatrixWorld(true);
            window.__screenBox = new THREE.Box3().setFromObject(window.__screenMesh);
          }
        }
      }

      // iOS offset'i dinamik olarak uygula (console'dan değiştirilebilir)
      if (cssObjectRef.current && window.__screenCenterY !== undefined) {
        const offset = window.__iOSOffset || 0;
        cssObjectRef.current.position.y = window.__screenCenterY + offset;
      }
      
      // Visibility (hem desktop hem mobil) - TV döndüğünde arka yüz gizlenir
      if (cssObjectRef.current) {
        const iframeObj = cssObjectRef.current;
        const iframePosition = new THREE.Vector3();
        iframeObj.getWorldPosition(iframePosition); 
        const cameraToIframe = iframePosition.clone().sub(camera.position); 
        const iframeDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(iframeObj.quaternion);
        const dotProduct = iframeDirection.dot(cameraToIframe);
        iframeObj.element.style.visibility = dotProduct > 0 ? 'visible' : 'hidden';
      }
      
      renderer.render(scene, camera);
      rendererCSS.render(scene, camera);
    };
    animate();

    // Resize - visualViewport API kullan (iOS adres çubuğu için)
    const handleResize = () => {
      if (!containerRef.current) return;
      
      // iOS için visualViewport kullan (adres çubuğu değişikliklerini yakalar)
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      rendererCSS.setSize(width, height);
    };
    
    // Hem window resize hem de visualViewport resize dinle
    window.addEventListener("resize", handleResize);
    
    // iOS Safari için visualViewport API
    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      window.visualViewport.addEventListener("scroll", handleResize);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeEventListener('wheel', onWheel);
      rendererCSS.domElement.removeEventListener('pointerdown', onPointerDown, false);
      document.removeEventListener('pointerup', onPointerUp, false);
      
      // visualViewport listener'larını temizle
      if (typeof window !== 'undefined' && window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
        window.visualViewport.removeEventListener("scroll", handleResize);
      }
      
      delete window.changeTVChannel;
      delete window.__screenCenter;
      delete window.__screenMesh;
      delete window.__screenBox;
      delete window.__model;
      delete window.__tvModel;
      
      container.removeChild(renderer.domElement);
      container.removeChild(rendererCSS.domElement);
    };
  }, [currentChannel, channels]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100dvh", minHeight: "600px", position: "relative", overflow: "hidden" }}>
      {/* Kumanda paneli */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(15, 15, 15, 0.95)",
          backdropFilter: "blur(12px)",
          padding: "16px 28px",
          borderRadius: "20px",
          display: "flex",
          gap: "10px",
          zIndex: 100, 
          boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {channels.map((_, index) => (
          <button
            key={index}
            onClick={() => window.changeTVChannel && window.changeTVChannel(index)}
            aria-label={`Switch to channel ${index + 1}`}
            title={`Channel ${index + 1}`}
            style={{
              padding: "12px 20px",
              background: currentChannel === index 
                ? "linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)" 
                : "rgba(255, 255, 255, 0.1)",
              color: currentChannel === index ? "#000" : "#fff",
              border: currentChannel === index 
                ? "none" 
                : "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "15px",
              minWidth: "50px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: currentChannel === index ? "scale(1.05)" : "scale(1)",
              boxShadow: currentChannel === index 
                ? "0 4px 16px rgba(0, 255, 136, 0.4)" 
                : "none",
            }}
            onMouseOver={(e) => {
              if (currentChannel !== index) {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.transform = "scale(1.05)";
              }
            }}
            onMouseOut={(e) => {
              if (currentChannel !== index) {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
// console.log felan eklendi baya iyi oldu sadelestirildi de,
