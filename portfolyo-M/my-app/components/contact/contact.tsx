'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, Github, Linkedin, Send } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isMounted, setIsMounted] = useState(false);
  const animationInitialized = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !sectionRef.current || animationInitialized.current) return;
    
    animationInitialized.current = true;
    const ctx = gsap.context(() => {
      gsap.set('.contact-item', { opacity: 0, y: 30 });
      gsap.to('.contact-item', {
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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('https://formspree.io/f/xjgvoaak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Thank you for your message! I will get back to you soon.');
        setFormData({ name: '', email: '', message: '' });
      } else {
        alert('Something went wrong. Please try again later.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Something went wrong. Please try again later.');
    }
  }, [formData]);

  const handleChange = useCallback((field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  }, []);

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'arifhallacc@gmail.com',
      href: 'mailto:arifhallacc@gmail.com',
    },
    {
      icon: Github,
      label: 'GitHub',
      value: 'github.com/emreyn1',
      href: 'https://github.com/emreyn1',
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      value: 'linkedin.com/in/emrehallacc',
      href: 'https://www.linkedin.com/in/emrehallacc/',
    },
  ];

  return (
    <section ref={sectionRef} id="contact" className="stagger-item py-20 md:py-32 bg-gradient-to-b from-background to-background/50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-12 sm:mb-16 contact-item">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
            Get In Touch
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Have a project in mind? Let's work together to bring your ideas to life.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
          {/* Contact Form */}
          <div className="contact-item">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-xs sm:text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  required
                  className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  required
                  className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-xs sm:text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={handleChange('message')}
                  required
                  rows={6}
                  className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="contact-item">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">Let's Connect</h3>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
                  I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {contactInfo.map((info, idx) => (
                  <a
                    key={idx}
                    href={info.href}
                    target={info.href.startsWith('http') ? '_blank' : undefined}
                    rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-card border border-border hover:border-blue-500/50 transition-all group"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all flex-shrink-0">
                      <info.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">{info.label}</p>
                      <p className="text-sm sm:text-base font-medium group-hover:text-blue-400 transition-colors truncate">{info.value}</p>
                    </div>
                  </a>
                ))}
              </div>

              <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Response Time:</strong> I typically respond within 24-48 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

