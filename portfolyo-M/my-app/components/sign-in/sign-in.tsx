'use client';
import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// Utility to combine class names safely
const cn = (...classes: (string | false | undefined)[]): string =>
  classes.filter(Boolean).join(" ");

// ---------------------- Button ----------------------
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          size === "default" && "h-10 px-4 py-2",
          size === "sm" && "h-9 px-3",
          size === "lg" && "h-11 px-8",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// ---------------------- Input ----------------------
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:tttext-muted-foregrounddt focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

// ---------------------- DotMap ----------------------
interface RoutePoint {
  x: number;
  y: number;
  delay: number;
}

const DotMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const routes: { start: RoutePoint; end: RoutePoint; color: string }[] = [
    {
      start: { x: 100, y: 150, delay: 0 },
      end: { x: 200, y: 80, delay: 2 },
      color: "#3b82f6",
    },
    {
      start: { x: 200, y: 80, delay: 2 },
      end: { x: 260, y: 120, delay: 4 },
      color: "#3b82f6",
    },
    {
      start: { x: 50, y: 50, delay: 1 },
      end: { x: 150, y: 180, delay: 3 },
      color: "#3b82f6",
    },
    {
      start: { x: 280, y: 60, delay: 0.5 },
      end: { x: 180, y: 180, delay: 2.5 },
      color: "#3b82f6",
    },
  ];

  const generateDots = (width: number, height: number) => {
    const dots: { x: number; y: number; radius: number; opacity: number }[] = [];
    const gap = 12;
    const dotRadius = 1;

    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
        const isInMapShape =
          ((x < width * 0.25 && x > width * 0.05) && y < height * 0.4 && y > height * 0.1) ||
          ((x < width * 0.25 && x > width * 0.15) && y < height * 0.8 && y > height * 0.4) ||
          ((x < width * 0.45 && x > width * 0.3) && y < height * 0.35 && y > height * 0.15) ||
          ((x < width * 0.5 && x > width * 0.35) && y < height * 0.65 && y > height * 0.35) ||
          ((x < width * 0.7 && x > width * 0.45) && y < height * 0.5 && y > height * 0.1) ||
          ((x < width * 0.8 && x > width * 0.65) && y < height * 0.8 && y > height * 0.6);

        if (isInMapShape && Math.random() > 0.3) {
          dots.push({
            x,
            y,
            radius: dotRadius,
            opacity: Math.random() * 0.5 + 0.1,
          });
        }
      }
    }
    return dots;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
      canvas.width = width;
      canvas.height = height;
    });

    observer.observe(canvas.parentElement);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dots = generateDots(dimensions.width, dimensions.height);
    let startTime = Date.now();
    let frameId: number;

    const drawDots = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      dots.forEach((dot) => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${dot.opacity})`;
        ctx.fill();
      });
    };

    const drawRoutes = () => {
      const currentTime = (Date.now() - startTime) / 1000;
      routes.forEach((route) => {
        const elapsed = currentTime - route.start.delay;
        if (elapsed <= 0) return;

        const duration = 3;
        const progress = Math.min(elapsed / duration, 1);
        const x = route.start.x + (route.end.x - route.start.x) * progress;
        const y = route.start.y + (route.end.y - route.start.y) * progress;

        ctx.beginPath();
        ctx.moveTo(route.start.x, route.start.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = route.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#60a5fa";
        ctx.fill();

        if (progress === 1) {
          ctx.beginPath();
          ctx.arc(route.end.x, route.end.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = route.color;
          ctx.fill();
        }
      });
    };

    const animate = () => {
      drawDots();
      drawRoutes();

      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed > 15) startTime = Date.now();
      frameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frameId);
  }, [dimensions]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

// ---------------------- SignInCard ----------------------
const SignInCard: React.FC = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex w-full h-full items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl overflow-hidden rounded-2xl flex bg-[#090b13] text-white shadow-2xl"
      >
        {/* Left side */}
        <div className="hidden md:block w-1/2 h-[600px] relative overflow-hidden border-r border-[#1f2130]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f1120] to-[#151929]">
            <DotMap />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
              <div className="mb-6">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <ArrowRight className="text-white h-6 w-6" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                Travel Connect
              </h2>
              <p className="text-sm text-center tttext-muted-foregrounddt max-w-xs">
                Sign in to access your global travel dashboard and connect with nomads worldwide
              </p>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Welcome back</h1>
          <p className="tttext-muted-foregrounddt mb-8">Sign in to your account</p>

          <div className="mb-6">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-[#13151f] border border-[#2a2d3a] rounded-lg p-3 hover:bg-[#1a1d2b] transition-all duration-300"
              onClick={() => console.log("Google sign-in")}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92..."
                />
              </svg>
              <span>Login with Google</span>
            </button>
          </div>

          <form className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email <span className="text-blue-500">*</span>
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="bg-[#13151f] border-[#2a2d3a] placeholder:text-gray-500 text-gray-200 w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password <span className="text-blue-500">*</span>
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="bg-[#13151f] border-[#2a2d3a] placeholder:text-gray-500 text-gray-200 w-full pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 tttext-muted-foregrounddt hover:text-gray-300"
                  onClick={() => setIsPasswordVisible((v) => !v)}
                >
                  {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              className="pt-2"
            >
              <Button
                type="submit"
                className={cn(
                  "w-full bg-gradient-to-r relative overflow-hidden from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-2 rounded-lg transition-all duration-300",
                  isHovered ? "shadow-lg shadow-blue-500/25" : ""
                )}
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Sign in attempt with:", { email, password });
                }}
              >
                <span className="flex items-center justify-center">
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Button>
            </motion.div>

            <div className="text-center mt-6">
              <a href="#" className="text-blue-500 hover:text-blue-400 text-sm transition-colors">
                Forgot password?
              </a>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// ---------------------- Index ----------------------
const Index: React.FC = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#060818] to-[#0d1023] p-4">
    <SignInCard />
  </div>
);

export default Index;
