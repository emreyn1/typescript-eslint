'use client';
import { ProjectShowcase } from "@/components/project-showcase/project-showcase";

function openInNewTab(link: string) {
  window.open(link, "_blank", "noopener,noreferrer");
}

const LTRVersion = () => (
  <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 md:py-8 lg:py-12 rounded-lg min-h-[300px] flex flex-wrap gap-2 sm:gap-4 md:gap-6 items-center justify-center relative">
    <div className="items-center justify-center relative flex w-full max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
      <ProjectShowcase
        testimonials={[
          {
            name: "I Travel",
            quote: "Exploring new places and cultures fuels my creativity and broadens my perspective. Every journey teaches me something new that I bring back to my work.",
            designation: "Passion & Lifestyle",
            src: "/Atravel.JPG",
            link: "#",
          },
          {
            name: "I Code",
            quote: "Building digital solutions is my passion. I love turning complex problems into elegant, user-friendly applications that make a real difference.",
            designation: "Professional Journey",
            src: "/Apr.JPG",
            link: "#",
          },
          {
            name: "I Read",
            quote: "Continuous learning through books keeps me updated with the latest technologies and design patterns. Knowledge is the foundation of great work.",
            designation: "Growth & Learning",
            src: "/Aread.JPG",
            link: "#",
          },
          {
            name: "I Lift",
            quote: "Fitness and discipline go hand in hand with coding. The same dedication I put into my workouts, I bring to every project I work on.",
            designation: "Balance & Discipline",
            src: "/Agym.avif",
            link: "#",
          },
        ]}
        colors={{
          name: "var(--project-showcase-name-color)",
          position: "var(--project-showcase-position-color)",
          testimony: "var(--project-showcase-testimony-color)",
        }}
        fontSizes={{
          name: "var(--project-showcase-name-size)",
          position: "var(--project-showcase-position-size)",
          testimony: "var(--project-showcase-testimony-size)",
        }}
        spacing={{
          nameTop: "var(--project-showcase-name-top)",
          nameBottom: "var(--project-showcase-name-bottom)",
          positionTop: "var(--project-showcase-position-top)",
          positionBottom: "var(--project-showcase-position-bottom)",
          testimonyTop: "var(--project-showcase-testimony-top)",
          testimonyBottom: "var(--project-showcase-testimony-bottom)",
          lineHeight: "var(--project-showcase-line-height)",
        }}
        mobile={{
          fontSizes: {
            name: "1.25rem",
            position: "0.875rem",
            testimony: "0.9375rem",
          },
          spacing: {
            nameTop: "0",
            nameBottom: "0.5rem",
            positionTop: "0",
            positionBottom: "0.5rem",
            testimonyTop: "0.75rem",
            testimonyBottom: "1rem",
            lineHeight: "1.5",
          },
        }}
        halomotButtonGradient="var(--project-showcase-button-gradient)"
        halomotButtonBackground="var(--project-showcase-button-background)"
        halomotButtonTextColor="var(--project-showcase-button-text-color)"
        halomotButtonOuterBorderRadius="var(--project-showcase-button-outer-radius)"
        halomotButtonInnerBorderRadius="var(--project-showcase-button-inner-radius)"
        halomotButtonHoverTextColor="var(--project-showcase-button-hover-text-color)"
        onItemClick={openInNewTab}
      />
    </div>
  </div>
);

const RTLVersion = () => (
  <div className="p-16 rounded-lg min-h-[300px] flex flex-wrap gap-6 items-center justify-center relative">
    <div className="items-center justify-center relative flex" style={{ maxWidth: "1152px" }}>
      <ProjectShowcase
        testimonials={[
          {
            name: "בלוברי לום",
            quote: "בונה טפסים מחוזק קריפטוגרפית המשתמש ב-ML-KEM-1024 ובסכימת ההצפנה המאומתת \"ChaCha20 + Serpent-256 CBC + HMAC-SHA3-512\" כדי לאפשר הצפנה מקצה לקצה להגנה משופרת על נתונים.",
            designation: "פרויקט Next.js ו-Nuxt",
            src: "https://raw.githubusercontent.com/Northstrix/my-portfolio/refs/heads/main/public/blueberry-loom.webp",
            link: "https://blueberry-loom.netlify.app/",
          },
          {
            name: "נמר UI",
            quote: "אוסף מקיף של רכיבי TypeScript מודרניים, אטרקטיביים וייחודיים לשימוש חוזר המיועדים במיוחד ל-Next.js.",
            designation: "פרויקט Next.js",
            src: "https://raw.githubusercontent.com/Northstrix/my-portfolio/refs/heads/main/public/namer-ui.webp",
            link: "https://namer-ui.netlify.app/",
          },
          {
            name: "נמר UI ל-Vue",
            quote: "אוסף של רכיבי TypeScript ו-CSS ונילה, הניתנים להתאמה אישית ולשימוש חוזר עבור Vue 3.",
            designation: "פרויקט Vue",
            src: "https://raw.githubusercontent.com/Northstrix/my-portfolio/refs/heads/main/public/namer-ui-for-vue.webp",
            link: "https://namer-ui-for-vue.netlify.app/",
          },
          {
            name: "מצפין קבצים בדפדפן",
            quote: "כלי מבוסס דפדפן המבצע הצפנת קבצים מקומית ללא אינטראקציה עם השרת. משתמש ב-AES-256 להצפנת נתונים וב-HMAC-SHA512 לאימות שלמות.",
            designation: "פרויקט HTML/CSS/JS וונילה",
            src: "https://raw.githubusercontent.com/Northstrix/my-portfolio/refs/heads/main/public/in-browser-file-encrypter.webp",
            link: "https://codepen.io/Northstrix/full/xxvXvJL",
          },
          {
            name: "פלאם קייב",
            quote: 'פתרון גיבוי בענן המשתמש בסכימת הצפנה מאומתת "HMAC-SHA3-512 + CBC Serpent-256 + ChaCha20" להצפנת נתונים ו-ML-KEM-1024 לחילופי מפתחות עמידים לקוונטים.',
            designation: "פרויקט Next.js",
            src: "https://raw.githubusercontent.com/Northstrix/my-portfolio/refs/heads/main/public/plum-cave-hebrew.webp",
            link: "https://plum-cave.netlify.app/",
          },
        ]}
        colors={{
          name: "var(--project-showcase-name-color)",
          position: "var(--project-showcase-position-color)",
          testimony: "var(--project-showcase-testimony-color)",
        }}
        fontSizes={{
          name: "var(--project-showcase-name-size)",
          position: "var(--project-showcase-position-size)",
          testimony: "var(--project-showcase-testimony-size)",
        }}
        spacing={{
          nameTop: "var(--project-showcase-name-top)",
          nameBottom: "var(--project-showcase-name-bottom)",
          positionTop: "var(--project-showcase-position-top)",
          positionBottom: "var(--project-showcase-position-bottom)",
          testimonyTop: "var(--project-showcase-testimony-top)",
          testimonyBottom: "var(--project-showcase-testimony-bottom)",
          lineHeight: "var(--project-showcase-line-height)",
        }}
        isRTL={true}
        buttonInscriptions={{
          previousButton: "הקודם",
          nextButton: "הבא",
          openWebAppButton: "פתח אפליקציה",
        }}
        halomotButtonGradient="var(--project-showcase-button-gradient)"
        halomotButtonBackground="var(--project-showcase-button-background)"
        halomotButtonTextColor="var(--project-showcase-button-text-color)"
        halomotButtonOuterBorderRadius="var(--project-showcase-button-outer-radius)"
        halomotButtonInnerBorderRadius="var(--project-showcase-button-inner-radius)"
        halomotButtonHoverTextColor="var(--project-showcase-button-hover-text-color)"
        onItemClick={openInNewTab}
      />
    </div>
  </div>
);

export default LTRVersion;
