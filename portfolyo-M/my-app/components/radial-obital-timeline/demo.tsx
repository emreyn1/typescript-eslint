"use client";

import { Calendar, Code, FileText, User, Clock } from "lucide-react";
import RadialOrbitalTimeline from "@/components/radial-obital-timeline/radial-obital-timeline";

const timelineData = [
  {
    id: 1,
    title: "Started Web Development",
    date: "2019",
    content: "Began my journey as a self-taught developer, learning HTML, CSS, and JavaScript fundamentals.",
    category: "Education",
    icon: Code,
    relatedIds: [2],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "First Freelance Projects",
    date: "2020",
    content: "Started taking on freelance projects, building websites for small businesses and startups.",
    category: "Work",
    icon: FileText,
    relatedIds: [1, 3],
    status: "completed" as const,
    energy: 90,
  },
  {
    id: 3,
    title: "Full Stack Developer",
    date: "2021",
    content: "Expanded skills to full stack development, working with React, Node.js, and databases.",
    category: "Career",
    icon: User,
    relatedIds: [2, 4],
    status: "completed" as const,
    energy: 85,
  },
  {
    id: 4,
    title: "Senior Developer Role",
    date: "2022-2023",
    content: "Led development teams, architected scalable applications, and mentored junior developers.",
    category: "Career",
    icon: Calendar,
    relatedIds: [3, 5],
    status: "completed" as const,
    energy: 95,
  },
  {
    id: 5,
    title: "Current Focus",
    date: "2024",
    content: "Building modern web applications with Next.js, TypeScript, and cutting-edge technologies.",
    category: "Current",
    icon: Clock,
    relatedIds: [4],
    status: "in-progress" as const,
    energy: 100,
  },
];

export default function RadialOrbitalTimelineDemo() {
  return (
    <>
      <RadialOrbitalTimeline timelineData={timelineData} />
    </>
  );
}
