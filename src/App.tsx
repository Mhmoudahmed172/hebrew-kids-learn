import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";

const LevelDetail = lazy(() => import("./pages/LevelDetail.tsx"));
const GamePlayer = lazy(() => import("./pages/GamePlayer.tsx"));
const VideoPlayer = lazy(() => import("./pages/VideoPlayer.tsx"));
const Quiz = lazy(() => import("./pages/Quiz.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const UserPermissions = lazy(() => import("./pages/UserPermissions.tsx"));
const Auth = lazy(() => import("./pages/Auth.tsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const Profile = lazy(() => import("./pages/Profile.tsx"));
const Leaderboard = lazy(() => import("./pages/Leaderboard.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageFallback = () => (
  <div dir="rtl" className="min-h-screen flex items-center justify-center text-muted-foreground">
    جاري التحميل...
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/level/:slug" element={<LevelDetail />} />
              <Route path="/level/:slug/video/:videoId" element={<VideoPlayer />} />
              <Route path="/level/:slug/game/:gameId" element={<GamePlayer />} />
              <Route path="/quiz/:id" element={<Quiz />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/users/:userId/permissions" element={<UserPermissions />} />
              <Route path="/login" element={<Auth mode="login" />} />
              <Route path="/signup" element={<Auth mode="signup" />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
