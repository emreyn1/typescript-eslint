'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Quote, Star } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const animationInitialized = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !sectionRef.current || animationInitialized.current) return;
    
    animationInitialized.current = true;
    const ctx = gsap.context(() => {
      // Title animation
      gsap.set('.testimonial-title', { opacity: 0, y: 30 });
      gsap.to('.testimonial-title', {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
          once: true,
        },
      });

      // Cards animation with stagger
      gsap.set('.testimonial-card', { opacity: 0, y: 50, scale: 0.9 });
      gsap.to('.testimonial-card', {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
          once: true,
        },
      });

      // Hover animations
      cardsRef.current.forEach((card) => {
        if (!card) return;
        
        const handleMouseEnter = () => {
          gsap.to(card, {
            scale: 1.03,
            y: -8,
            duration: 0.3,
            ease: 'power2.out',
          });
        };

        const handleMouseLeave = () => {
          gsap.to(card, {
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: 'power2.out',
          });
        };

        card.addEventListener('mouseenter', handleMouseEnter, { passive: true });
        card.addEventListener('mouseleave', handleMouseLeave, { passive: true });

        return () => {
          card.removeEventListener('mouseenter', handleMouseEnter);
          card.removeEventListener('mouseleave', handleMouseLeave);
        };
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isMounted]);

  const testimonials = useMemo(() => [
    {
      name: 'Sarah Johnson',
      role: 'CEO, TechStart Inc.',
      content: 'Emre delivered an exceptional web application that exceeded our expectations. His attention to detail and technical expertise made the entire process smooth and enjoyable.',
      avatar: 'SJ',
      rating: 5,
      gradient: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      name: 'Michael Chen',
      role: 'Product Manager, DesignCo',
      content: 'Working with Emre was a pleasure. He transformed our vision into a beautiful, functional product. His communication skills and professionalism are outstanding.',
      avatar: 'MC',
      rating: 5,
      gradient: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Founder, StartupXYZ',
      content: 'Emre is a talented developer who truly understands user experience. The application he built for us has received amazing feedback from our users. Highly recommended!',
      avatar: 'ER',
      rating: 5,
      gradient: 'from-cyan-500/20 to-blue-500/20',
    },
  ], []);

  return (
    <section ref={sectionRef} id="testimonials" className="stagger-item py-20 md:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="text-center mb-12 sm:mb-16 testimonial-title">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
            <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
            What Clients Say
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Don't just take my word for it - hear from those I've worked with
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              ref={(el) => {
                if (el) cardsRef.current[idx] = el;
              }}
              className="testimonial-card relative group"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.gradient} rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10`} />
              
              {/* Card */}
              <div className="relative h-full p-6 sm:p-8 rounded-3xl bg-card/80 backdrop-blur-sm border border-border/50 group-hover:border-blue-500/50 transition-all duration-300 shadow-lg group-hover:shadow-2xl group-hover:shadow-blue-500/20">
                {/* Quote icon */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                  <Quote className="w-16 h-16 sm:w-20 sm:h-20 text-blue-400" />
                </div>

                {/* Stars rating */}
                <div className="flex gap-1 mb-4 sm:mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-sm sm:text-base text-foreground/90 mb-6 sm:mb-8 leading-relaxed relative z-10">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-border/50">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-lg">
                      {testimonial.avatar}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-semibold text-foreground truncate">{testimonial.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{testimonial.role}</p>
                  </div>
                </div>

                {/* Decorative corner */}
                <div className="absolute bottom-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-tl from-blue-500/10 to-transparent rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

