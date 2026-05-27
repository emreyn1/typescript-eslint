import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
      <p className="text-muted-foreground text-center mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <Button asChild>
        <Link href="/" className="inline-flex items-center gap-2">
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
      </Button>
    </div>
  );
}
