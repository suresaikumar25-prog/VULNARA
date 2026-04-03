"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import LandingView from "@/components/LandingView";
import DashboardView from "@/components/DashboardView";

/**
 * ThreatLens Root Page
 * 
 * Implements conditional view logic:
 * 1. Guests see the premium Landing Page with a public URL tester.
 * 2. Authenticated users see the full Dashboard (original functionality).
 */
export default function Home() {
  const { user, loading } = useAuth();

  // Show a themed loader while authentication is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-cyan-500/50 text-xs font-bold uppercase tracking-widest">Initializing Shield...</p>
        </div>
      </div>
    );
  }

  // View Switcher
  return user ? <DashboardView /> : <LandingView />;
}
