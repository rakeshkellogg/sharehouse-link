
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Users, Share2, MessageCircle, List } from "lucide-react";
import { Link } from "react-router-dom";
import AuthButton from "@/components/AuthButton";
import AdminButton from "@/components/AdminButton";
import InstallAppButton from "@/components/InstallAppButton";
import PhoneMockup from "@/components/PhoneMockup";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import heroDesktopBg from "@/assets/hero-city-skyline.jpg";
import heroMobileBg from "@/assets/hero-mobile.jpg";

const Hero = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background + overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${isMobile ? heroMobileBg : heroDesktopBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/10" />

      {/* Top bar */}
      <nav className="relative z-20 bg-black/10 backdrop-blur-sm border-b border-white/15">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-bold tracking-wide text-white/90">LISTANDSHARE</div>
          <div className="flex items-center gap-3">
            <InstallAppButton />
            {user && (
              <Link to="/my-listings">
                <Button className="bg-white text-slate-900 hover:bg-white/90">
                  <List className="w-4 h-4 mr-2" />
                  My Listings
                </Button>
              </Link>
            )}
            <AdminButton />
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-10 md:py-16">
        {isMobile ? (
          /* ---------- MOBILE ---------- */
          <div className="space-y-8">
            {/* Headline */}
            <div className="text-center max-w-[28rem] mx-auto">
              <h1 className="text-[32px] leading-tight font-extrabold text-white mb-3">
                Your property live in
                <br />
                <span className="text-white/90 font-semibold">
                  2 minutes — free, fast, everywhere.
                </span>
              </h1>
              <p className="text-lg text-white/90">
                Post once. Share on WhatsApp, Facebook & beyond.
              </p>
            </div>

            {/* CTAs – white pill buttons */}
            <div className="max-w-[28rem] mx-auto flex flex-col gap-3">
              <Link to="/create">
                <button className="w-full rounded-full py-3 px-6 bg-white text-slate-900 font-semibold shadow-lg hover:bg-white/90 transition">
                  Create Your First Listing
                </button>
              </Link>
              <Link to="/search">
                <button className="w-full rounded-full py-3 px-6 bg-white text-slate-900 font-semibold shadow-lg hover:bg-white/90 transition">
                  Search Properties
                </button>
              </Link>
            </div>

            {/* Features only */}
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
              <Card className="p-3">
                <div className="flex flex-col items-center text-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-full flex items-center justify-center mb-2">
                    <Home className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1 text-sm">Quick Setup</h3>
                  <p className="text-xs text-slate-600">Create listings in under 2 minutes</p>
                </div>
              </Card>
              <Card className="p-3">
                <div className="flex flex-col items-center text-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-full flex items-center justify-center mb-2">
                    <Share2 className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1 text-sm">Share Anywhere</h3>
                  <p className="text-xs text-slate-600">Perfect for social platforms</p>
                </div>
              </Card>
              <Card className="p-3">
                <div className="flex flex-col items-center text-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-full flex items-center justify-center mb-2">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1 text-sm">Direct Contact</h3>
                  <p className="text-xs text-slate-600">WhatsApp buttons built in</p>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          /* ---------- DESKTOP ---------- */
          <div className="max-w-5xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Your property live in
              <br />
              <span className="text-white/90 font-semibold">
                2 minutes — free, fast, everywhere.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl leading-relaxed">
              Post once. Share on WhatsApp, Facebook & beyond.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-20">
              <Link to="/create">
                <button className="btn btn-white btn-xl">Create Your First Listing</button>
              </Link>
              <Link to="/search">
                <button className="btn btn-white btn-xl">Search Properties</button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl">
              <Card className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-lg">Quick Setup</h3>
                  <p className="text-base text-slate-600">
                    Create listings in under 2 minutes with our mobile-optimized form
                  </p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-lg">Share Anywhere</h3>
                  <p className="text-base text-slate-600">
                    Perfect for Facebook groups, WhatsApp, and social platforms
                  </p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-lg">Direct Contact</h3>
                  <p className="text-base text-slate-600">
                    WhatsApp buttons and direct messaging built in
                  </p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-lg">Peer-to-Peer</h3>
                  <p className="text-base text-slate-600">
                    Connect directly with property owners and renters
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;
