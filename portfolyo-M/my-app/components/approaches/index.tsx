import React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { CanvasRevealEffect } from "./canvas";

const Approach = () => {
  return (
    <section className="w-full py-12 sm:py-16 md:py-20">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-12 sm:mb-16 md:mb-20">
        My <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">approach</span>
      </h1>
      {/* remove bg-white dark:bg-black */}
      <div className="my-12 sm:my-16 md:my-20 flex flex-col xl:flex-row items-center justify-center w-full gap-4 sm:gap-6">
        {/* add des prop */}
        <Card
          title="Planning & Strategy"
          icon={<AceternityIcon order="Phase 1" />}
          des="We'll collaborate to map out your website's goals, target audience, 
          and key functionalities. We'll discuss things like site structure, 
          navigation, and content requirements."
        >
          <CanvasRevealEffect
            animationSpeed={5.1}
            // add these classed for the border rounded overflowing -> rounded-3xl overflow-hidden
            containerClassName="bg-blue-900 rounded-3xl overflow-hidden"
          />
        </Card>
        <Card
          title="Development & Progress Update"
          icon={<AceternityIcon order="Phase 2" />}
          des="Once we agree on the plan, I cue my lofi playlist and dive into
          coding. From initial sketches to polished code, I keep you updated
          every step of the way."
        >
          <CanvasRevealEffect
            animationSpeed={3}
            // change bg-black to bg-cyan-900
            containerClassName="bg-cyan-900 rounded-3xl overflow-hidden"
            colors={[
              // change the colors of the
              [6, 182, 212],
              [56, 189, 248],
            ]}
            dotSize={2}
          />
          {/* Radial gradient for the cute fade */}
          {/* remove this one */}
          {/* <div className="absolute inset-0 [mask-image:radial-gradient(400px_at_center,white,transparent)] bg-black/50 dark:bg-black/90" /> */}
        </Card>
        <Card
          title="Development & Launch"
          icon={<AceternityIcon order="Phase 3" />}
          des="This is where the magic happens! Based on the approved design, 
          I'll translate everything into functional code, building your website
          from the ground up."
        >
          <CanvasRevealEffect
            animationSpeed={3}
            containerClassName="bg-cyan-600 rounded-3xl overflow-hidden"
            colors={[[6, 182, 212]]}
          />
        </Card>
      </div>
    </section>
  );
};

export default Approach;

const Card = ({
  title,
  icon,
  children,
  // add this one for the desc
  des,
}: {
  title: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
  des: string;
}) => {
  const [hovered, setHovered] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280); // xl breakpoint (1280px) kullan, lg (1024px) çok küçük
    };
    checkMobile();
    const mediaQuery = window.matchMedia('(max-width: 1279px)');
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleToggle = () => {
    if (isMobile) {
      setHovered(!hovered);
    }
  };

  return (
    <div
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={() => !isMobile && setHovered(false)}
      onClick={handleToggle}
      // change h-[30rem] to h-[35rem], add rounded-3xl
      className={`border border-black/[0.2] group/canvas-card flex items-center justify-center
       dark:border-white/[0.2]  max-w-sm w-full mx-auto p-4 relative rounded-3xl cursor-pointer touch-manipulation overflow-hidden
       ${isMobile ? (hovered ? 'min-h-[35rem]' : 'min-h-[20rem]') : 'xl:h-[35rem]'}`}
      style={{
        //   add these two
        //   you can generate the color from here https://cssgradient.io/
        background: "rgb(4,7,29)",
        backgroundColor:  
          "linear-gradient(90deg, rgba(4,7,29,1) 0%, rgba(12,14,35,1) 100%)",
      }}
    >
      {/* change to h-10 w-10 , add opacity-30  */}
      <Icon className="absolute h-10 w-10 -top-3 -left-3 dark:text-white text-black opacity-30" />
      <Icon className="absolute h-10 w-10 -bottom-3 -left-3 dark:text-white text-black opacity-30" />
      <Icon className="absolute h-10 w-10 -top-3 -right-3 dark:text-white text-black opacity-30" />
      <Icon className="absolute h-10 w-10 -bottom-3 -right-3 dark:text-white text-black opacity-30" />

      <AnimatePresence>
        {isMobile && hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full absolute inset-0 z-10 rounded-3xl overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Desktop'ta CSS group-hover ile gösteriliyor, AnimatePresence gerekmez */}
      {!isMobile && (
        <div className="h-full w-full absolute inset-0 z-10 rounded-3xl overflow-hidden opacity-0 group-hover/canvas-card:opacity-100 transition-opacity duration-300">
          {children}
        </div>
      )}

      <div className={`relative px-4 sm:px-6 md:px-10 ${isMobile && hovered ? 'z-30' : 'z-20'}`}>
        <div
          className={`text-center absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] 
        transition duration-200 min-w-40 mx-auto flex items-center justify-center
        ${isMobile ? (hovered ? 'opacity-0 -translate-y-4' : 'opacity-100') : 'opacity-100'} 
        group-hover/canvas-card:-translate-y-4 group-hover/canvas-card:opacity-0`}
        >
          {icon}
        </div>
        <h2
          className={`dark:text-white text-center text-xl sm:text-2xl md:text-3xl relative z-10 mt-4 font-bold transition duration-200
        ${isMobile ? (hovered ? 'opacity-100 text-white -translate-y-2' : 'opacity-0 text-black') : 'opacity-0 text-black'}
        group-hover/canvas-card:opacity-100 group-hover/canvas-card:text-white 
        group-hover/canvas-card:-translate-y-2`}
        >
          {title}
        </h2>
        <p
          className={`text-xs sm:text-sm md:text-base relative z-10 mt-4 text-center transition duration-200 leading-relaxed
        ${isMobile ? (hovered ? 'opacity-100 text-white -translate-y-2' : 'opacity-0') : 'opacity-0'}
        group-hover/canvas-card:opacity-100 group-hover/canvas-card:text-white 
        group-hover/canvas-card:-translate-y-2`}
          style={{ color: (isMobile && hovered) || (!isMobile) ? "#E4ECFF" : "transparent" }}
        >
          {des}
        </p>
      </div>
    </div>
  );
};
// add order prop for the Phase number change
const AceternityIcon = ({ order }: { order: string }) => {
  return (
    <div>
      {/* this btn is from https://ui.aceternity.com/components/tailwindcss-buttons border magic */}
      {/* change rounded-lg, text-purple px-5 py-2 */}
      {/* remove focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 cuz we don't need to focus */}
      {/* remove text-sm font-medium h-12 , add font-bold text-2xl */}
      <button className="relative inline-flex overflow-hidden rounded-full p-[1px] ">
        <span
          className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite]
         bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]"
        />
        <span
          className="inline-flex h-full w-full cursor-pointer items-center 
        justify-center rounded-full bg-slate-950 px-4 py-2 sm:px-5 sm:py-2 text-purple backdrop-blur-3xl font-bold text-lg sm:text-xl md:text-2xl"
        >
          {order}
        </span>
      </button>
    </div>
    // remove the svg and add the button
    // <svg
    //   width="66"
    //   height="65"
    //   viewBox="0 0 66 65"
    //   fill="none"
    //   xmlns="http://www.w3.org/2000/svg"
    //   className="h-10 w-10 text-black dark:text-white group-hover/canvas-card:text-white "
    // >
    //   <path
    //     d="M8 8.05571C8 8.05571 54.9009 18.1782 57.8687 30.062C60.8365 41.9458 9.05432 57.4696 9.05432 57.4696"
    //     stroke="currentColor"
    //     strokeWidth="15"
    //     strokeMiterlimit="3.86874"
    //     strokeLinecap="round"
    //     style={{ mixBlendMode: "darken" }}
    //   />
    // </svg>
  );
};

export const Icon = ({ className, ...rest }: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
      {...rest}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  );
};