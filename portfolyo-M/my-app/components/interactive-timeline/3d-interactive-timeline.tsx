import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export interface TimelineEvent {
  id: string;
  date?: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  image?: string;
  category?: string;
  color?: string;
  link?: {
    url: string;
    text: string;
  }[];
  github?: string;
}

interface Timeline3DProps {
  events: TimelineEvent[];
  backgroundColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
  accentColor?: string;
  showImages?: boolean;
  className?: string;
}

const defaultColors = {
 // background: 'bg-slate-900',
  primary: 'bg-blue-600',
  secondary: 'bg-cyan-500',
  text: 'text-white',
  accent: 'bg-sky-500',
};

export const Timeline3D: React.FC<Timeline3DProps> = ({
  events,
  //backgroundColor = defaultColors.background,
  primaryColor = defaultColors.primary,
  secondaryColor = defaultColors.secondary,
  textColor = defaultColors.text,
  accentColor = defaultColors.accent,
  showImages = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const st = window.pageYOffset || document.documentElement.scrollTop;
      setScrollDirection(st > lastScrollTop ? 'down' : 'up');
      setLastScrollTop(st <= 0 ? 0 : st);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollTop]);

//ilk div'de, ${backgroundColor} kaldırıldı. 
  return (
    <div
      className={`w-full  py-16 px-4 sm:px-6 lg:px-8 overflow-hidden ${textColor} ${className}`}
      ref={containerRef}
    >
      <div className="max-w-7xl mx-auto relative">
        {/* Decorative elements - 3D floating spheres - Mobilde azalt */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          {[...Array(isMobile ? 4 : 8)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full opacity-20 ${i % 2 === 0 ? primaryColor : secondaryColor}`}
              animate={{
                x: [
                  `${20 + i * 10}%`,
                  `${30 + i * 8}%`,
                  `${15 + i * 12}%`,
                  `${20 + i * 10}%`,
                ],
                y: [
                  `${10 + i * 12}%`,
                  `${20 + i * 10}%`,
                  `${30 + i * 8}%`,
                  `${10 + i * 12}%`,
                ],
                scale: [1, 1.2, 1.1, 1],
              }}
              transition={{
                duration: 20 + i * 2,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'loop',
              }}
              style={{
                width: `${50 + i * 20}px`,
                height: `${50 + i * 20}px`,
                filter: 'blur(8px)',
                zIndex: 0,
              }}
            />
          ))}
        </div>

        {/* Main timeline content */}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-8 sm:mb-12 md:mb-16 text-center tracking-tight px-4">
            <span className="inline-block">
              <span className="relative inline-block">
                <span className={`absolute -inset-1 rounded-lg ${accentColor} blur opacity-30`}></span>
                <span className="relative">Projects</span>
              </span>
            </span>
          </h2>

          <div className="relative">
            {/* Central line */}
            <div
              className={`absolute left-1/2 transform -translate-x-1/2 h-full w-1 ${primaryColor} rounded-full`}
              style={{
                boxShadow: `0 0 15px ${primaryColor.replace('bg-', 'rgb-')}`,
              }}
            ></div>

            {/* Timeline events */}
            {events.map((event, index) => {
              const [ref, inView] = useInView({
                threshold: isMobile ? 0.1 : 0.3,
                triggerOnce: true,
              });
              const [hasBeenVisible, setHasBeenVisible] = useState(false);

              useEffect(() => {
                if (inView && !hasBeenVisible) {
                  setHasBeenVisible(true);
                }
              }, [inView, hasBeenVisible]);

              const isEven = index % 2 === 0;
              const eventColor = event.color ? `bg-${event.color}-500` : primaryColor;

              return (
                <TimelineEventItem
                  key={event.id}
                  ref={ref}
                  event={event}
                  index={index}
                  isEven={isEven}
                  eventColor={eventColor}
                  inView={inView}
                  hasBeenVisible={hasBeenVisible}
                  setHasBeenVisible={setHasBeenVisible}
                  isMobile={isMobile}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  accentColor={accentColor}
                  showImages={showImages}
                />
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Memoized Timeline Event Item Component
const TimelineEventItem = React.memo(React.forwardRef<HTMLDivElement, {
  event: TimelineEvent;
  index: number;
  isEven: boolean;
  eventColor: string;
  inView: boolean;
  hasBeenVisible: boolean;
  setHasBeenVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  showImages: boolean;
}>(({
  event,
  index,
  isEven,
  eventColor,
  inView,
  hasBeenVisible,
  setHasBeenVisible,
  isMobile,
  primaryColor,
  secondaryColor,
  accentColor,
  showImages,
}, ref) => {
  const [localMousePosition, setLocalMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inView && !hasBeenVisible) {
      setHasBeenVisible(true);
    }
  }, [inView, hasBeenVisible, setHasBeenVisible]);

  // Prevent unnecessary re-renders by memoizing hover handlers
  // Use requestAnimationFrame to prevent flicker during state change
  const handleMouseEnter = useCallback(() => {
    requestAnimationFrame(() => {
      setIsHovered(true);
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    requestAnimationFrame(() => {
      setIsHovered(false);
      setLocalMousePosition({ x: 0, y: 0 });
    });
  }, []);

  const handleClick = useCallback(() => {
    setIsHovered(prev => !prev);
  }, []);

  // Memoize transform style to prevent unnecessary recalculations
  const transformStyle = useMemo(() => {
    if (isMobile || !isHovered) return 'none';
    return `perspective(1000px) rotateY(${
      localMousePosition.x * (isEven ? -3 : 3)
    }deg) rotateX(${localMousePosition.y * -3}deg)`;
  }, [isMobile, isHovered, localMousePosition.x, localMousePosition.y, isEven]);

  // Memoize animation props to prevent unnecessary re-renders
  const boxShadowAnimation = useMemo(() => {
    return isHovered
      ? [
          `0 0 0 rgba(255,255,255,0.5)`,
          `0 0 20px rgba(255,255,255,0.8)`,
          `0 0 0 rgba(255,255,255,0.5)`,
        ]
      : `0 0 0 rgba(255,255,255,0)`;
  }, [isHovered]);

  const imageAnimation = useMemo(() => ({
    scale: isHovered ? 1.05 : 1,
    y: isHovered ? -10 : 0,
  }), [isHovered]);

  const descriptionAnimation = useMemo(() => ({
    height: isHovered ? 'auto' : 0,
    opacity: isHovered ? 1 : 0,
  }), [isHovered]);

  const progressAnimation = useMemo(() => ({
    width: isHovered ? "100%" : "0%",
  }), [isHovered]);

  useEffect(() => {
    if (isMobile || !isHovered) return;

    let rafId: number | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      
      if (rafId) cancelAnimationFrame(rafId);
      
      rafId = requestAnimationFrame(() => {
        const rect = cardRef.current!.getBoundingClientRect();
        setLocalMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
          y: ((e.clientY - rect.top) / rect.height) * 2 - 1,
        });
      });
    };

    const card = cardRef.current;
    if (card) {
      card.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (card) {
        card.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [isMobile, isHovered]);

  return (
                <motion.div
                  ref={ref}
                  className={`timeline-event-item relative mb-6 sm:mb-8 md:mb-12 lg:mb-16 ${isEven ? 'md:ml-auto' : 'md:mr-auto'} md:w-1/2 flex ${
                    isEven ? 'md:justify-start' : 'md:justify-end'
                  }`}
                  initial={{ 
                    opacity: 1, // Always start visible
                    x: isEven ? 50 : -50,
                    y: 20,
                  }}
                  animate={hasBeenVisible ? {
                    opacity: 1, // Always visible - never changes
                    x: 0,
                    y: 0,
                    transition: {
                      duration: 0.8,
                      ease: 'easeOut',
                    },
                  } : {
                    opacity: 1, // Always visible - never changes
                    x: isEven ? 50 : -50,
                    y: 20,
                  }}
                  style={{ 
                    opacity: 1, // Force always visible - CSS override
                    willChange: 'transform',
                    visibility: 'visible',
                  }}
                >
                  {/* Timeline node */}
                  <div
                    className={`absolute left-1/2 md:left-auto ${
                      isEven ? 'md:left-0' : 'md:right-0'
                    } top-0 transform -translate-x-1/2 ${
                      isEven ? 'md:translate-x-0' : 'md:translate-x-0'
                    } z-20`}
                  >
                    <motion.div
                      className={`w-10 h-10 rounded-full ${eventColor} flex items-center justify-center border-4 border-slate-900 cursor-pointer`}
                      whileHover={{ scale: 1.2 }}
                      onClick={handleClick}
                      animate={{
                        boxShadow: boxShadowAnimation,
                      }}
                      transition={{
                        repeat: isHovered ? Infinity : 0,
                        duration: 1.5,
                      }}
                    >
                      {event.icon || (
                        <span className="text-white font-bold">
                          {index + 1}
                        </span>
                      )}
                    </motion.div>
                  </div>

                  {/* Content card */}
                  <motion.div
                    ref={cardRef}
                    className={`timeline-event-card relative z-10 bg-slate-800 bg-opacity-80 backdrop-blur-lg rounded-2xl overflow-hidden shadow-xl w-full md:w-[calc(100%-2rem)] ${
                      isEven ? 'md:ml-12' : 'md:mr-12'
                    } border border-slate-700`}
                    whileHover={{
                      y: -5,
                      x: isEven ? 5 : -5,
                      transition: { duration: 0.2, ease: 'easeOut' }, // Faster transition
                    }}
                    style={{
                      transformStyle: isMobile ? 'flat' : 'preserve-3d',
                      transform: transformStyle,
                      willChange: isHovered ? 'transform' : 'auto',
                    }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    {showImages && event.image && (
                      <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden">
                        <motion.img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover"
                          initial={{ scale: 1.2 }}
                          animate={imageAnimation}
                          transition={{ duration: 0.8 }}
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                        
                        {event.category && (
                          <div className="absolute top-4 right-4">
                            <span className={`${accentColor} px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase`}>
                              {event.category}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-4 sm:p-6">
                      {event.date && (
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <span className={`text-xs sm:text-sm font-mono ${accentColor.replace('bg-', 'text-')} tracking-wider`}>
                            {event.date}
                          </span>
                        
                        <motion.div 
                          className={`w-3 h-3 rounded-full ${eventColor}`}
                          animate={{ 
                            scale: [1, 1.5, 1],
                            opacity: [0.7, 1, 0.7] 
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 2,
                            repeatType: "reverse"
                          }}
                        />
                        </div>
                      )}

                      <h3 className="text-xl sm:text-2xl font-bold mb-2">{event.title}</h3>
                      
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={descriptionAnimation}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="text-slate-300 mt-3 text-sm sm:text-base leading-relaxed">
                          {event.description}
                        </p>
                        
                        {event.link && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {event.link.map((link, index) => (
                              <a
                                key={index}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-block px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm ${index === 0 ? primaryColor : secondaryColor} hover:bg-opacity-80 rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-1`}
                              >
                                {link.text}
                              </a>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </div>
                    
                    <motion.div 
                      className={`absolute bottom-0 left-0 h-1 ${eventColor}`}
                      initial={{ width: "0%" }}
                      animate={progressAnimation}
                      transition={{ duration: 0.5 }}
                    />
                  </motion.div>
                </motion.div>
  );
}), (prevProps, nextProps) => {
  // Only re-render if these specific props change
  // Return true if props are equal (skip re-render), false if different (re-render)
  return (
    prevProps.event.id === nextProps.event.id &&
    prevProps.hasBeenVisible === nextProps.hasBeenVisible &&
    prevProps.inView === nextProps.inView &&
    prevProps.isMobile === nextProps.isMobile &&
    prevProps.event.title === nextProps.event.title &&
    prevProps.event.description === nextProps.event.description &&
    prevProps.index === nextProps.index &&
    prevProps.isEven === nextProps.isEven &&
    prevProps.eventColor === nextProps.eventColor
  );
});

TimelineEventItem.displayName = 'TimelineEventItem';

export default Timeline3D;