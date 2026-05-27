"use client"

import { useMemo } from "react"
import { Code2, Briefcase, TrendingUp, User, Github, Linkedin, Mail, ExternalLink, Globe, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatedList } from "@/components/ui/animated-list"
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import { Marquee } from "@/components/ui/marquee"
import Globe3D from "@/components/globe/globe"
import CalBooking from "@/components/cal-booking/cal-booking"

const projects = [
  {
    name: "AI Chat Application",
    tech: "Next.js • TypeScript • AI",
    status: "Live",
    link: "https://ai-chattt.vercel.app/",
  },
  {
    name: "Team Collaboration Platform",
    tech: "Next.js • Prisma • PostgreSQL",
    status: "Live",
    link: "https://e-qdk6xbcm7-my-team-58e3ebda.vercel.app/",
  },
  {
    name: "Image Editor & Modifier",
    tech: "React • Canvas API • WebGL",
    status: "Live",
    link: "https://modifio-g8hd5pz11-my-team-58e3ebda.vercel.app/",
  },
  {
    name: "Startup Pitch Platform",
    tech: "Next.js • TypeScript • Tailwind",
    status: "Live",
    link: "https://startuppitch-pk7g38l7p-my-team-58e3ebda.vercel.app/",
  },
]

const achievements = [
  {
    title: "Projects Completed",
    value: "50+",
    description: "Successfully delivered projects",
  },
  {
    title: "Years Experience",
    value: "5+",
    description: "Building web applications",
  },
  {
    title: "Technologies",
    value: "20+",
    description: "Mastered tech stack",
  },
  {
    title: "Happy Clients",
    value: "30+",
    description: "Satisfied customers",
  },
]

const features = [
  {
    Icon: Globe,
    name: "I'm Very Flexible with Time Zone Communications",
    description: "Available across multiple time zones for seamless collaboration.",
    className: "col-span-3 lg:col-span-2",
    href: "#contact",
    cta: "Contact Me",
    background: (
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        <Globe3D className="w-full h-full" />
      </div>
    ),
  },
  {
    Icon: TrendingUp,
    name: "Achievements",
    description: "Key milestones and accomplishments in my career.",
    href: "#achievements",
    cta: "Learn More",
    className: "col-span-3 lg:col-span-1",
    background: (
      <AnimatedList className="absolute top-4 right-2 h-[300px] w-full scale-75 border-none mask-[linear-gradient(to_top,transparent_10%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-90">
        {achievements.map((achievement, idx) => (
          <div key={idx} className="p-4 bg-card rounded-lg shadow-md">
            <p className="text-2xl font-bold text-primary">{achievement.value}</p>
            <p className="font-medium mt-1">{achievement.title}</p>
            <p className="text-sm tttext-muted-foregrounddt mt-1">{achievement.description}</p>
          </div>
        ))}
      </AnimatedList>
    ),
  },
  {
    Icon: Briefcase,
    name: "Featured Projects",
    description: "Explore my latest work and innovative solutions.",
    href: "#projects",
    cta: "View Projects",
    className: "col-span-3",
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 mask-[linear-gradient(to_top,transparent_40%,#000_100%)] [--duration:20s]"
      >
        {projects.map((project, idx) => (
          <a
            key={idx}
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "relative w-40 cursor-pointer overflow-hidden rounded-xl border p-4 block",
              "border-gray-950/10 bg-gray-950/1 hover:bg-gray-950/5",
              "dark:border-gray-50/10 dark:bg-gray-50/10 dark:hover:bg-gray-50/15",
              "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none hover:scale-105"
            )}
          >
            <div className="flex flex-col gap-2">
              <figcaption className="text-sm font-semibold dark:text-white flex items-center gap-2">
                {project.name}
                <ExternalLink className="w-3 h-3 opacity-50" />
              </figcaption>
              <p className="text-xs tttext-muted-foregrounddt">{project.tech}</p>
              <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500 w-fit">
                {project.status}
              </span>
            </div>
          </a>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: Calendar,
    name: "Book a Meeting",
    description: "Schedule a call to discuss your project and how we can work together.",
    href: "https://cal.com/emre-7c31ws",
    cta: "Book Now",
    className: "col-span-3 lg:col-span-2 hide-bento-content",
    background: (
      <div className="absolute inset-0 rounded-lg overflow-hidden flex items-center justify-center">
        <CalBooking className="w-full h-full" />
      </div>
    ),
  },
  {
    Icon: User,
    name: "About Me",
    description: "Full stack developer passionate about creating digital experiences.",
    className: "col-span-3 lg:col-span-1",
    href: "#about",
    cta: "Read More",
    background: (
      <div className="absolute top-10 right-0 origin-top scale-75 rounded-md border mask-[linear-gradient(to_top,transparent_40%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-90 p-6 bg-card">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Github className="h-5 w-5" />
            <a href="https://github.com/emreyn1" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">GitHub</a>
          </div>
          <div className="flex items-center gap-3">
            <Linkedin className="h-5 w-5" />
            <a href="https://www.linkedin.com/in/emrehallacc/" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">LinkedIn</a>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5" />
            <a href="mailto:arifhallacc@gmail.com" className="text-sm hover:underline">Email</a>
          </div>
        </div>
      </div>
    ),
  },
]

export default function BentoDemo() {
  const memoizedFeatures = useMemo(() => features, []);
  
  return (
    <BentoGrid>
      {memoizedFeatures.map((feature, idx) => (
        <BentoCard key={idx} {...feature} />
      ))}
    </BentoGrid>
  )
}