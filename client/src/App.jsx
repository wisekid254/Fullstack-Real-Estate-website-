import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { lazy, Suspense } from "react";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ChatBot from "./components/ai/ChatBot";

const HomePage = lazy(() => import("./pages/HomePage"));
const ListingsPage = lazy(() => import("./pages/ListingsPage"));
const PropertyDetailPage = lazy(() => import("./pages/PropertyDetailPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const VerifyOTPPage = lazy(() => import("./pages/VerifyOTPPage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const CreateListingPage = lazy(() => import("./pages/CreateListingPage"));
const AgentsPage = lazy(() => import("./pages/AgentsPage"));
const AgentProfilePage = lazy(() => import("./pages/AgentProfilePage"));
const MortgageCalculatorPage = lazy(
  () => import("./pages/MortgageCalculatorPage"),
);
const PremiumPage = lazy(() => import("./pages/PremiumPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-surface-400">Loading…</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/listings" element={<ListingsPage />} />
              <Route path="/listings/:id" element={<PropertyDetailPage />} />
              <Route path="/agents" element={<AgentsPage />} />
              <Route path="/agents/:id" element={<AgentProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-otp" element={<VerifyOTPPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route
                path="/mortgage-calculator"
                element={<MortgageCalculatorPage />}
              />

              {/* Protected — any logged in user */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/saved" element={<ProfilePage />} />
              </Route>

              {/* Protected — agents and admins only */}
              <Route element={<ProtectedRoute requireAgent={true} />}>
                <Route
                  path="/listings/create"
                  element={<CreateListingPage />}
                />
                <Route path="/premium" element={<PremiumPage />} />
              </Route>

              {/* Protected — admin only */}
              <Route element={<ProtectedRoute requireAdmin={true} />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>

      <ChatBot />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: "12px",
            fontSize: "14px",
            fontFamily: "Inter, sans-serif",
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
