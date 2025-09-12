
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Users, Share2, MessageCircle, List } from "lucide-react";
import { Link } from "react-router-dom";
import AuthButton from "@/components/AuthButton";
import AdminButton from "@/components/AdminButton";
import InstallAppButton from "@/components/InstallAppButton";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/hero-city-skyline.jpg";

const Hero = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-right md:bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
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
      </div>
    </div>
  );
};

export default Hero;
