'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Video } from 'lucide-react';

interface CalBookingProps {
  className?: string;
}

export default function CalBooking({ className }: CalBookingProps) {
  const [calUrl, setCalUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // .env'den cal.com URL'ini al, yoksa default URL kullan
    const url = process.env.NEXT_PUBLIC_CAL_COM_URL || 'https://cal.com/emre-7c31ws';
    setCalUrl(url);
    setIsLoading(false);
  }, []);

  const handleBooking = () => {
    if (calUrl) {
      window.open(calUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback: Eğer URL yoksa contact sayfasına yönlendir
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      <div className="text-center w-full max-w-sm mx-auto space-y-3 sm:space-y-4 md:space-y-5 p-3 sm:p-4 md:p-6">
        {/* Icon Section */}
        <div className="flex justify-center mb-3 sm:mb-4 md:mb-5">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-sky-500/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Calendar className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 text-white" />
            </div>
          </div>
        </div>

        {/* Title and Description */}
        <div className="space-y-2 sm:space-y-2.5 md:space-y-3 px-1 sm:px-2">
          <h3 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent leading-tight">
            Book a Meeting
          </h3>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-[280px] sm:max-w-xs mx-auto leading-relaxed">
            Schedule a call to discuss your project and how we can work together
          </p>
        </div>

        {/* Meeting Details */}
        <div className="flex flex-col gap-2 sm:gap-2.5 md:gap-3 items-center pt-1 sm:pt-2 md:pt-3">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">30 min meeting</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
            <Video className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Video call</span>
          </div>
        </div>

        {/* Button */}
        <div className="pt-2 sm:pt-3 md:pt-4">
          <button
            onClick={handleBooking}
            disabled={isLoading || !calUrl}
            className="group relative inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs sm:text-sm md:text-base font-semibold rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 whitespace-nowrap">
              {isLoading ? 'Loading...' : calUrl ? 'Book Now' : 'Contact Me'}
            </span>
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 relative z-10 flex-shrink-0" />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        {!calUrl && !isLoading && (
          <p className="text-xs text-muted-foreground pt-1 sm:pt-2 px-2 sm:px-3 leading-relaxed">
            Cal.com URL not configured. Please add NEXT_PUBLIC_CAL_COM_URL to your .env file.
          </p>
        )}
      </div>
    </div>
  );
}

