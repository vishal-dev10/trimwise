import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import AdminGuard from "@/components/AdminGuard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminDataPage from "./pages/AdminDataPage";
import AdminVersionsPage from "./pages/AdminVersionsPage";
import ShortlistPage from "./pages/ShortlistPage";
import UserManualPage from "./pages/UserManualPage";
import AdminManualPage from "./pages/AdminManualPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/admin" element={<AdminGuard><AdminDashboardPage /></AdminGuard>} />
            <Route path="/admin/data" element={<AdminGuard><AdminDataPage /></AdminGuard>} />
            <Route path="/admin/versions" element={<AdminGuard><AdminVersionsPage /></AdminGuard>} />
            <Route path="/shortlist" element={<ShortlistPage />} />
            <Route path="/manual/user" element={<UserManualPage />} />
            <Route path="/manual/admin" element={<AdminManualPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
