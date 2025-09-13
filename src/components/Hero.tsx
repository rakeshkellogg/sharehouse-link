
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
import heroImage from "@/assets/hero-city-skyline.jpg";
import heroMobileImage from "@/assets/hero-mobile.jpg";

const Hero = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-right md:bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${isMobile ? heroMobileImage : heroImage})` }}
      >
        <div className="hero-overlay" />
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-20 bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - Removed non-functional ShareHouse button */}
            
            {/* Navigation Links */}
            <div className="flex items-center gap-4">
              {/* Install App Button */}
              <InstallAppButton />
              
              {/* My Listings Button for Authenticated Users */}
              {user && (
                <Link to="/my-listings">
                  <Button className="bg-white text-real-estate-primary hover:bg-white/90 shadow-hero">
                    <List className="w-4 h-4 mr-2" />
                    My Listings
                  </Button>
                </Link>
              )}
              
              {/* Admin Button */}
              <AdminButton />
              
              {/* Auth Button */}
              <AuthButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
        {isMobile ? (
          /* Mobile Layout */
          <div className="space-y-8">
            {/* Main Heading */}
            <div className="text-center max-w-sm mx-auto">
              <h1 className="text-3xl font-extrabold text-white mb-4 leading-tight">
                Your property live in
                <br />
                <span className="text-white/90 font-semibold">2 minutes — free, fast, everywhere.</span>
              </h1>
              
              <p className="text-lg text-white/90 mb-6 leading-relaxed">
                Post once. Share on WhatsApp, Facebook & beyond.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3 mb-8">
                <Link to="/create">
                  <button className="w-full py-3 px-6 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300">
                    Create Your First Listing
                  </button>
                </Link>
                <Link to="/search">
                  <button className="w-full py-3 px-6 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300">
                    Search Properties
                  </button>
                </Link>
              </div>
            </div>

            {/* Mobile Layout: Feature Cards and Phone Mockup */}
            <div className="flex items-start justify-between gap-4">
              {/* Feature Cards - Left Side */}
              <div className="flex-1 space-y-4 max-w-[140px]">
                <Card className="card-z p-3">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center mb-2">
                      <Home className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-real-estate-neutral mb-1 text-sm">Quick Setup</h3>
                    <p className="text-xs text-real-estate-neutral/70">Create listings in under 2 minutes</p>
                  </div>
                </Card>

                <Card className="card-z p-3">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center mb-2">
                      <Share2 className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-real-estate-neutral mb-1 text-sm">Share Anywhere</h3>
                    <p className="text-xs text-real-estate-neutral/70">Perfect for social platforms</p>
                  </div>
                </Card>

                <Card className="card-z p-3">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center mb-2">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-real-estate-neutral mb-1 text-sm">Direct Contact</h3>
                    <p className="text-xs text-real-estate-neutral/70">WhatsApp buttons built in</p>
                  </div>
                </Card>
              </div>

              {/* Phone Mockup - Right Side */}
              <div className="flex-shrink-0">
                <PhoneMockup />
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Layout */
          <div className="text-left max-w-4xl">
            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Your property live in
              <br />
              <span className="text-white/90 font-semibold">2 minutes — free, fast, everywhere.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl leading-relaxed">
              Post once. Share on WhatsApp, Facebook & beyond.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-24">
              <Link to="/create">
                <button className="btn btn-white btn-xl">Create Your First Listing</button>
              </Link>
              <Link to="/search">
                <button className="btn btn-white btn-xl">Search Properties</button>
              </Link>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl">
              <Card className="card-z p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center mb-4">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-real-estate-neutral mb-2 text-lg">Quick Setup</h3>
                  <p className="text-base text-real-estate-neutral/70">Create listings in under 2 minutes with our mobile-optimized form</p>
                </div>
              </Card>

              <Card className="card-z p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center mb-4">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-real-estate-neutral mb-2 text-lg">Share Anywhere</h3>
                  <p className="text-base text-real-estate-neutral/70">Perfect for Facebook groups, WhatsApp, and social platforms</p>
                </div>
              </Card>

              <Card className="card-z p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-real-estate-neutral mb-2 text-lg">Direct Contact</h3>
                  <p className="text-base text-real-estate-neutral/70">WhatsApp buttons and direct messaging built in</p>
                </div>
              </Card>

              <Card className="card-z p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-real-estate-neutral mb-2 text-lg">Peer-to-Peer</h3>
                  <p className="text-base text-real-estate-neutral/70">Connect directly with property owners and renters</p>
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
