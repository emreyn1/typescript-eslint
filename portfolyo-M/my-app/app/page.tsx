'use client';

import { useEffect, useRef, lazy, Suspense, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

import Example from '@/components/hero/hero';

const SkillsMarquee = lazy(() => import('@/components/marquee/skills-marquee'));
const About = lazy(() => import('@/components/about/about'));
const Contact = lazy(() => import('@/components/contact/contact'));
const Footer = lazy(() => import('@/components/footer/footer'));

const ThreeDTV = lazy(() => import('@/components/3d-tv/ThreeDTV'));
const RadialOrbitalTimelineDemo = lazy(() => import('@/components/radial-obital-timeline/demo'));
const LTRVersion = lazy(() => import('@/components/project-showcase/demo'));
const TimelineDemo = lazy(() => import('@/components/interactive-timeline/demo'));
const BentoDemo = lazy(() => import("@/components/ui/BentoDemo"));
const Approach = lazy(() => import('@/components/approaches'));
const Testimonials = lazy(() => import('@/components/testimonials/testimonials'));

const Loading = () => (
  <div className="flex items-center justify-center w-full h-96">
    <div className="text-muted-foreground animate-pulse">Loading component...</div>
  </div>
);

export default function Home() {
  const mainRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const animationInitialized = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !mainRef.current || animationInitialized.current) return;
    
    animationInitialized.current = true;
    const ctx = gsap.context(() => {
      gsap.set('.stagger-item', { opacity: 0, y: 30 });
      
      gsap.to('.stagger-item', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: mainRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
          once: true,
        },
      });
    }, mainRef);

    return () => ctx.revert();
  }, [isMounted]);

  return (
    <div ref={mainRef} className="min-h-screen bg-background py-16 pt-20">
      <Suspense fallback={<Loading />}>
        <section className="stagger-item top-0" suppressHydrationWarning>
        <Example />
        </section>
      </Suspense>


      <Suspense fallback={<Loading />}>
        <div className="max-w-7xl mx-auto mb-32 md:mb-48">
        <BentoDemo />
        </div>
      </Suspense>
  
        <Suspense fallback={<Loading />}>
          <section id="projects" className="stagger-item" suppressHydrationWarning>
          <TimelineDemo />
          </section>
        </Suspense>

      <div className="max-w-7xl mx-auto space-y-32 md:space-y-48">

        

        <Suspense fallback={<Loading />}>
          <SkillsMarquee />
        </Suspense>

        <Suspense fallback={<Loading />}>
          <section id="about">
            <About />
          </section>
        </Suspense>

        {/* <Suspense fallback={<Loading />}>
          <section className="stagger-item">
            <RadialOrbitalTimelineDemo />
          </section>
        </Suspense> */}

        <Suspense fallback={<Loading />}>
          <Approach />
        </Suspense>

        <Suspense fallback={<Loading />}>
          <section id="project-showcase" className="stagger-item" suppressHydrationWarning>
            <LTRVersion />
          </section>
        </Suspense>

        <Suspense fallback={<Loading />}>
          <Testimonials />
        </Suspense>

        <Suspense fallback={<Loading />}>
          <Contact />
        </Suspense>

        <Suspense fallback={<Loading />}>
          <Footer />
        </Suspense>
      </div>
    </div>
    
  );
}