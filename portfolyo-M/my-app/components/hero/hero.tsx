'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Mail, Github, Linkedin } from 'lucide-react';
import { StarsBackground } from '@/components/herostars-withlogo/stars';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Example() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const animationInitialized = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !heroRef.current || animationInitialized.current) return;
    
    animationInitialized.current = true;
    const ctx = gsap.context(() => {
      gsap.set(titleRef.current, { opacity: 0, y: 50 });
      gsap.set(subtitleRef.current, { opacity: 0, y: 30 });
      gsap.set(photoRef.current, { opacity: 0, scale: 0.8, y: 30 });
      if (buttonsRef.current) {
        gsap.set(Array.from(buttonsRef.current.children), { opacity: 0, y: 20 });
      }
      
      const scrollTriggerConfig = {
        trigger: heroRef.current,
        start: 'top 80%',
        toggleActions: 'play none none none',
        once: true,
      };
      
      gsap.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.3,
        scrollTrigger: scrollTriggerConfig,
      });

      gsap.to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.6,
        scrollTrigger: scrollTriggerConfig,
      });

      gsap.to(photoRef.current, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.5,
        scrollTrigger: scrollTriggerConfig,
      });

      if (buttonsRef.current) {
        gsap.to(Array.from(buttonsRef.current.children), {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          delay: 0.9,
          stagger: 0.1,
          scrollTrigger: scrollTriggerConfig,
        });
      }

      gsap.to('.gradient-orb', {
        y: '+=30',
        duration: 3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: 0.5,
      });
    }, heroRef);

    return () => ctx.revert();
  }, [isMounted]);

  return (
    <div 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Stars Background */}
      <div className="absolute inset-0 z-0">
        <StarsBackground starColor="#fff" speed={50} pointerEvents={false} />
      </div>

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden z-[1]">
        <div className="gradient-orb absolute top-1/4 left-1/4 w-96 h-96 bg-linear-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="gradient-orb absolute bottom-1/4 right-1/4 w-96 h-96 bg-linear-to-r from-cyan-500/20 to-sky-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="gradient-orb absolute top-1/2 right-1/3 w-72 h-72 bg-linear-to-r from-indigo-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] z-[1]" aria-hidden="true"></div>

      {/* Bottom Gradient Fade - Projects section'a yumuşak geçiş */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-64 z-[1] pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 40%, rgba(0, 0, 0, 0.7) 70%, rgba(0, 0, 0, 0.95) 90%, rgba(0, 0, 0, 1) 100%)"
        }}
      />

      {/* Main Content */}
      <div className="relative z-[2] max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-32">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
          {/* Photo Section */}
          <div className="shrink-0 order-2 lg:order-1">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 via-cyan-500/20 to-sky-500/20 rounded-full blur-2xl animate-pulse"></div>
              <img
                ref={photoRef}
                src="/photo_2025-12-28 14.51 Background Removed.24.png"
                alt="Emre Hallac"
                className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full object-cover border-4 border-blue-500/30 shadow-2xl"
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center lg:text-left space-y-8 flex-1 order-1 lg:order-2">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-blue-500/10 via-cyan-500/10 to-sky-500/10 border border-blue-500/20 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-foreground/80">
                Available for new projects
              </span>
            </div>

          {/* Main Title */}
          <h1 
            ref={titleRef}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight"
          >
            <span className="block bg-linear-to-r from-blue-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
              I help founders
            </span>
            <span className="block mt-2 text-foreground">
              turn ideas into
            </span>
            <span className="block mt-2 bg-linear-to-r from-cyan-400 via-blue-400 to-sky-400 bg-clip-text text-transparent">
              seamless digital experiences
            </span>
          </h1>

          {/* Subtitle */}
          <p 
            ref={subtitleRef}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Hello, I'm <span className="font-semibold text-foreground">Emre Hallac</span>
            <br />
            A <span className="font-semibold text-foreground">full stack web developer</span> passionate about creating beautiful, functional, and user-centered digital experiences.
          </p>

          {/* CTA Buttons */}
          <div 
            ref={buttonsRef}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <a
              href="#contact"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50"
            >
              <span className="relative z-10">Let's Talk</span>
              <ArrowRight className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 bg-linear-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </a>

            <a
              href="#projects"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-background/80 backdrop-blur-sm border border-border text-foreground font-semibold rounded-full transition-all duration-300 hover:bg-background hover:scale-105 hover:shadow-lg"
            >
              <span>View Projects</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </a>

            
          </div>

            {/* Social Links */}
            <div className="flex items-center justify-center lg:justify-start gap-6 pt-8">
            <a
              href="mailto:arifhallacc@gmail.com"
              className="group p-3 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:border-blue-500/50 transition-all duration-300 hover:scale-110"
              aria-label="Email"
            >
              <Mail className="w-5 h-5 text-muted-foreground group-hover:text-purple-500 transition-colors" />
            </a>
            <a
              href="https://github.com/emreyn1"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-3 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:border-blue-500/50 transition-all duration-300 hover:scale-110"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5 text-muted-foreground group-hover:text-purple-500 transition-colors" />
            </a>
            <a
              href="https://www.linkedin.com/in/emrehallacc/"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-3 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:border-blue-500/50 transition-all duration-300 hover:scale-110"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5 text-muted-foreground group-hover:text-purple-500 transition-colors" />
            </a>
          </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce" aria-label="Scroll down">
        <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-foreground/30 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}