import React from 'react';
import Timeline3D, { TimelineEvent } from '@/components/interactive-timeline/3d-interactive-timeline';
import { FiMessageSquare, FiTrendingUp, FiRefreshCw, FiShoppingCart, FiPlay } from 'react-icons/fi';

const TimelineDemo: React.FC = () => {
  const timelineEvents: TimelineEvent[] = [
    {
      id: '1',
      title: 'AI Chat Application',
      description: 'Modern AI-powered chat application built with Next.js and advanced AI integration. Features real-time conversations, multiple AI models support, and responsive design optimized for all devices.',
      icon: <FiMessageSquare className="text-white" />,
      image: '/ai-chat.png',
      category: 'AI & Chat',
      link: [
        {
          url: 'https://github.com/emreyn1/ai-chat',
          text: 'View Code',
        },
        {
          url: 'https://ai-chattt.vercel.app/',
          text: 'Live Demo',
        },
      ],
    },
    {
      id: '2',
      title: 'Startup Pitch Platform',
      description: 'Comprehensive platform for startups to showcase their ideas and connect with investors. Features pitch deck creation, investor matching, and funding opportunity discovery.',
      icon: <FiTrendingUp className="text-white" />,
      image: '/startup.png',
      category: 'Startup & Business',
      color: 'emerald',
      link: [
        {
          url: 'https://github.com/emreyn1/pitchupyourstartup',
          text: 'View Code',
        },
        {
          url: 'https://pitchyourstartup.vercel.app/',
          text: 'Live Demo',
        },
      ],
    },
    {
      id: '3',
      title: 'Convertioo - File Converter',
      description: 'Powerful online file conversion tool supporting multiple formats including documents, images, audio, and video. Built with modern web technologies for fast and secure conversions.',
      icon: <FiRefreshCw className="text-white" />,
      image: '/convertioo.png',
      category: 'Tools & Utilities',
      color: 'amber',
      link: [
        {
          url: 'https://github.com/emreyn1/convertio',
          text: 'View Code',
        },
        {
          url: 'https://convertioo.vercel.app/',
          text: 'Live Demo',
        },
      ],
    },
    {
      id: '4',
      title: 'E-Commerce Platform',
      description: 'Full-featured e-commerce solution with product management, shopping cart, payment integration, and admin dashboard. Built with modern web technologies for scalable online stores.',
      icon: <FiShoppingCart className="text-white" />,
      image: '/e-commercet.png',
      category: 'E-Commerce',
      color: 'rose',
      link: [
        {
          url: 'https://github.com/emreyn1/e-com',
          text: 'View Code',
        },
        {
          url: 'https://e-commercet.vercel.app/',
          text: 'Live Demo',
        },
      ],
    },
    {
      id: '5',
      title: 'MovieOn - Streaming Platform',
      description: 'Modern streaming platform with movie recommendations, watchlist management, and user reviews. Features responsive design and smooth video playback across all devices.',
      icon: <FiPlay className="text-white" />,
      image: '/movieon.png',
      category: 'Entertainment',
      color: 'blue',
      link: [
        {
          url: 'https://github.com/emreyn1/Movieon',
          text: 'View Code',
        },
        {
          url: 'https://movieonn.vercel.app/',
          text: 'Live Demo',
        },
      ],
    },
  ];

  return (
    <Timeline3D
      events={timelineEvents}
      primaryColor="bg-blue-600"
      secondaryColor="bg-cyan-500"
      accentColor="bg-sky-500"
    />
  );
};

export default TimelineDemo;