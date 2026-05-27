'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Code2, Palette, Zap, Target } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const animationInitialized = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !sectionRef.current || animationInitialized.current) return;
    
    animationInitialized.current = true;
    const ctx = gsap.context(() => {
      gsap.set('.about-item', { opacity: 0, y: 30 });
      gsap.to('.about-item', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isMounted]);

  const skills = useMemo(() => [
    {
      icon: Code2,
      title: 'Full Stack Development',
      description: 'Building end-to-end web applications with modern frameworks and best practices.',
    },
    {
      icon: Palette,
      title: 'UI/UX Design',
      description: 'Creating beautiful, intuitive interfaces that users love to interact with.',
    },
    {
      icon: Zap,
      title: 'Performance Optimization',
      description: 'Ensuring fast, efficient applications that scale with your business needs.',
    },
    {
      icon: Target,
      title: 'Problem Solving',
      description: 'Turning complex challenges into elegant, maintainable solutions.',
    },
  ], []);

  return (
    <section ref={sectionRef} id="about" className="stagger-item py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-16 about-item">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
            About Me
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Passionate developer crafting digital experiences
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center mb-12 sm:mb-16">
          <div className="about-item">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed mb-4">
                Hello! I'm <span className="font-semibold text-foreground">Emre Hallac</span>, a full stack web developer 
                passionate about creating beautiful, functional, and user-centered digital experiences.
              </p>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed mb-4">
                With over 5 years of experience in web development, I've had the privilege of working with 
                startups and established companies to bring their digital visions to life. I specialize in 
                building responsive web applications that are both visually appealing and highly performant.
              </p>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                When I'm not coding, you can find me exploring new technologies, contributing to open-source 
                projects, or sharing knowledge with the developer community. I believe in continuous learning 
                and staying up-to-date with the latest industry trends.
              </p>
            </div>
          </div>

          <div className="about-item">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-3xl" />
              <div className="relative bg-card border rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">What I Do</h3>
                <div className="space-y-3 sm:space-y-4">
                  {skills.map((skill, idx) => (
                    <div key={idx} className="flex gap-3 sm:gap-4">
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                        <skill.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm sm:text-base md:text-lg font-semibold mb-1">{skill.title}</h4>
                        <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">{skill.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

