import React, { useMemo } from 'react';
import {
  SiNextdotjs, SiTailwindcss, SiReact, SiTypescript, SiJavascript,
  SiNodedotjs, SiCss3, SiFigma, SiNotion, SiRedis, SiRedux,
  SiCloudflare, SiMongodb, SiPostgresql, SiPrisma, SiGit, SiGithub,
  SiThreedotjs, SiFramer, SiSocketdotio, SiLinux
} from 'react-icons/si';

import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from '@/components/ui/shadcn-io/marquee';

const technologies: Array<{
  Icon?: React.ComponentType<{ className?: string }>;
  name: string;
  isCustom?: boolean;
}> = [
  { Icon: SiNextdotjs, name: 'Next.js' },
  { Icon: SiReact, name: 'React' },
  { Icon: SiJavascript, name: 'JavaScript' },
  { Icon: SiTypescript, name: 'TypeScript' },
  { Icon: SiCss3, name: 'CSS3' },
  { Icon: SiTailwindcss, name: 'Tailwind CSS' },
  { Icon: SiFigma, name: 'Figma' },
  { Icon: SiNotion, name: 'Notion' },
  { Icon: SiNodedotjs, name: 'Node.js' },
  { Icon: SiRedis, name: 'Redis' },
  { Icon: SiRedux, name: 'Redux' },
  { Icon: SiCloudflare, name: 'Cloudflare' },
  { Icon: SiMongodb, name: 'MongoDB' },
  { Icon: SiPostgresql, name: 'PostgreSQL' },
  { Icon: SiPrisma, name: 'Prisma' },
  { Icon: SiGit, name: 'Git' },
  { Icon: SiGithub, name: 'GitHub' },
  { name: 'WebGL', isCustom: true },
  { Icon: SiThreedotjs, name: 'Three.js' },
  { name: 'GSAP', isCustom: true },
  { Icon: SiFramer, name: 'Framer Motion' },
  { Icon: SiSocketdotio, name: 'Socket.io' },
  { Icon: SiLinux, name: 'Linux/Unix' },
];

export default function SkillsMarquee() {
  return (
    <section className="stagger-item py-8 sm:py-12">
      <h2 className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 md:mb-16 bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
        Behind the Scene
      </h2>

      <Marquee className="py-4 sm:py-6 md:py-8 pb-8 sm:pb-12 md:pb-16">
        <MarqueeFade side="left" />
        <MarqueeFade side="right" />

        <MarqueeContent
          speed={50}
          pauseOnHover={true}
          autoFill={true}
          loop={0}
        >
          {technologies.map((tech, idx) => (
            <MarqueeItem key={idx} className="px-4">
              <div 
                className="group relative flex flex-col items-center justify-center pb-8"
                role="img"
                aria-label={tech.name}
              >
                <div 
                  className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-foreground/60 group-hover:text-foreground transition-all duration-300 group-hover:scale-110"
                  aria-hidden="true"
                >
                  {tech.isCustom ? (
                    <span className="text-xs sm:text-sm font-bold">{tech.name}</span>
                  ) : tech.Icon ? (
                    <tech.Icon className="w-full h-full" />
                  ) : null}
                </div>
                <span 
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs sm:text-sm font-medium text-foreground/80 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md"
                  aria-hidden="true"
                >
                  {tech.name}
                </span>
              </div>
            </MarqueeItem>
          ))}
        </MarqueeContent>
      </Marquee>
    </section>
  );
}