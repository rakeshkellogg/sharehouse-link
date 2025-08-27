
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import SampleListing from "./pages/SampleListing";
import ListingDetail from "./pages/ListingDetail";
import MyListings from "./pages/MyListings";
import Inbox from "./pages/Inbox";
import Auth from "./pages/Auth";
import SavedListings from "@/pages/SavedListings";
import SearchProperties from "@/pages/SearchProperties";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/create" element={
                <ProtectedRoute>
                  <CreateListing />
                </ProtectedRoute>
              } />
            <Route path="/edit/:id" element={
              <ProtectedRoute>
                <EditListing />
              </ProtectedRoute>
            } />
            <Route path="/my-listings" element={
                <ProtectedRoute>
                  <MyListings />
                </ProtectedRoute>
              } />
            <Route path="/inbox" element={
              <ProtectedRoute>
                <Inbox />
              </ProtectedRoute>
            } />
            <Route path="/saved" element={
              <ProtectedRoute>
                <SavedListings />
              </ProtectedRoute>
            } />
            <Route path="/search" element={<SearchProperties />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
