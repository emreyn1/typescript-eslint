"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Geometry, Base, Subtraction } from "@react-three/csg";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { Bloom, N8AO, SMAA, EffectComposer } from "@react-three/postprocessing";
import { useRef, useEffect } from "react";
import { Mesh } from "three";
import { KernelSize } from "postprocessing";
import { gsap } from "gsap";

// --- 3D Scene same as before ---
function Shape() {
  const meshRef = useRef<Mesh>(null);
  const innerSphereRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.rotation.z += delta * 0.2;
    }
    if (innerSphereRef.current) {
      innerSphereRef.current.rotation.x += delta * 0.3;
      innerSphereRef.current.rotation.y += delta * 0.5;
      innerSphereRef.current.rotation.z += delta * 0.1;
    }
  });

  return (
    <>
      <mesh ref={meshRef}>
        <meshPhysicalMaterial
          roughness={0}
          metalness={0.95}
          clearcoat={1}
          clearcoatRoughness={0.1}
          color="#000000"
        />
        <Geometry>
          <Base>
            <primitive object={new RoundedBoxGeometry(2, 2, 2, 7, 0.2)} />
          </Base>
          <Subtraction>
            <sphereGeometry args={[1.25, 64, 64]} />
          </Subtraction>
        </Geometry>
      </mesh>

      <mesh ref={innerSphereRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          emissive={"white"}
          emissiveIntensity={1}
        />
      </mesh>
    </>
  );
}

function Environment() {
  return (
    <>
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.2}
        color="#e6f3ff"
      />
      <directionalLight position={[0, -5, 10]} intensity={0.4} color="#fff5e6" />
      <ambientLight intensity={0.8} color="#404040" />
      <pointLight position={[8, 3, 8]} intensity={0.2} color="#ffeecc" distance={20} />
      <pointLight position={[-8, 3, -8]} intensity={0.2} color="#ccf0ff" distance={20} />
      <directionalLight position={[0, -10, 0]} intensity={0.2} color="#f0f0f0" />
    </>
  );
}

function Scene() {
  return (
    <Canvas className="w-full h-full" camera={{ position: [5, 5, 5], fov: 50 }}>
      <Environment />
      <Shape />
      <EffectComposer multisampling={0}>
        <N8AO
          halfRes
          color="black"
          aoRadius={2}
          intensity={1}
          aoSamples={6}
          denoiseSamples={4}
        />
        <Bloom
          kernelSize={3}
          luminanceThreshold={0}
          luminanceSmoothing={0.4}
          intensity={0.6}
        />
        <Bloom
          kernelSize={KernelSize.HUGE}
          luminanceThreshold={0}
          luminanceSmoothing={0}
          intensity={0.5}
        />
        <SMAA />
      </EffectComposer>
    </Canvas>
  );
}

// --- Navbar ---
function Navbar({ links }: { links: Array<{ name: string; href: string }> }) {
  return (
    <nav className="absolute top-4 left-4 right-4 md:top-10 md:left-10 md:right-10 z-30">
      <ul className="hidden md:flex gap-8 lg:gap-12">
        {links.map((link) => (
          <li key={link.name}>
            <a
              href={link.href}
              className="relative text-sm font-light tracking-widest text-white/80 transition-all duration-300 hover:text-white hover:scale-105"
            >
              {link.name}
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-sky-500 transition-all duration-300 hover:w-full"></span>
            </a>
          </li>
        ))}
      </ul>

      <ul className="md:hidden flex flex-col gap-3 items-end">
        {links.map((link) => (
          <li key={link.name}>
            <a
              href={link.href}
              className="text-xs font-light tracking-widest text-white/80 hover:text-white transition-colors duration-300"
            >
              {link.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// --- Hero ---
interface HeroProps {
  title: string;
  description: string;
  links: Array<{ name: string; href: string }>;
}

export const Hero: React.FC<HeroProps> = ({ title, description, links }) => {
  useEffect(() => {
    const btn = document.querySelector(".hero-btn");
    const glow = document.querySelector(".hero-btn-bg");

    if (btn && glow) {
      btn.addEventListener("mouseenter", () => {
        gsap.to(btn, { scale: 1.05, duration: 0.4, ease: "power2.out" });
        gsap.to(glow, { opacity: 1, x: 40, duration: 0.6, ease: "power2.out" });
      });

      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, { scale: 1, duration: 0.4, ease: "power2.inOut" });
        gsap.to(glow, { opacity: 0, x: 0, duration: 0.6, ease: "power2.inOut" });
      });

      btn.addEventListener("mousedown", () => {
        gsap.to(btn, { scale: 0.97, duration: 0.1 });
      });

      btn.addEventListener("mouseup", () => {
        gsap.to(btn, { scale: 1.05, duration: 0.2, ease: "power2.out" });
      });
    }
  }, []);

  return (
    <div className="absolute top-0 left-0 w-screen min-h-[500vh] bg-[#0A0A0A] -z-10"> {/*bg-[#0A0A0A] vardi */}
    {/*yukaridaki kodda bu vardi: min-h-[500vh] w-screen relative bg-[#0A0A0A]
    degisti artik yuaridaki gibi */}
      <Navbar links={links} />
      <div className=" inset-0 h-screen w-screen relative z-10"> {/*absolute cikarildi ve 
      h-screen w-screen relative z-10 eklendi */}
        <Scene />
      </div>

      <div className="absolute bottom-4 left-4 md:bottom-10 md:left-10 z-20 max-w-md space-y-5">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 via-cyan-500 to-sky-500 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-sm md:text-base font-light leading-relaxed text-white/70 mb-4">
          {description}
        </p>

        {/* Premium CTA Button */}
        <button className="hero-btn relative overflow-hidden rounded-xl bg-linear-to-r from-blue-500 via-cyan-500 to-sky-500 px-6 py-3 text-white font-medium shadow-lg transition-all duration-300">
          <span className="relative z-10">Explore Now</span>
          <span className="hero-btn-bg absolute inset-0 bg-linear-to-r from-cyan-500 via-blue-500 to-sky-500 opacity-0"></span>
        </button>
      </div>
    </div>
  );
};
