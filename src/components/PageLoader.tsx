import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  text?: string;
}

const PageLoader = ({ text = "جاري التحضير..." }: PageLoaderProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl animate-pulse" />
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
          </div>
        </div>
        <p className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {text}
        </p>
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
