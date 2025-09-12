
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Users, Share2, MessageCircle, List, CheckCircle, Zap, Handshake } from "lucide-react";
import { Link } from "react-router-dom";
import AuthButton from "@/components/AuthButton";
import AdminButton from "@/components/AdminButton";
import InstallAppButton from "@/components/InstallAppButton";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/hero-city-background.jpg";

const Hero = () => {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-no-repeat"
        style={{ 
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "80% center",
        }}
      />
      
      {/* Gradient overlay for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/45 backdrop-blur-[1.5px] sm:backdrop-blur-[2px]" />

      {/* Navigation Bar */}
      <nav className="relative z-30 bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo space */}
            <div></div>
            
            {/* Navigation Links */}
            <div className="flex items-center gap-2 sm:gap-4">
              <InstallAppButton />
              
              {user && (
                <Link to="/my-listings">
                  <Button className="bg-white text-real-estate-primary hover:bg-white/90 shadow-hero text-sm sm:text-base">
                    <List className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">My Listings</span>
                    <span className="sm:hidden">Lists</span>
                  </Button>
                </Link>
              )}
              
              <AdminButton />
              <AuthButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-20 flex flex-col min-h-screen">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl w-full">
            <div className="max-w-4xl">
              {/* Main Heading */}
              <h1 className="text-white font-extrabold tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-7xl leading-tight drop-shadow-lg">
                Your property live in{" "}
                <span className="whitespace-nowrap">2 minutes</span>{" "}
                — free, fast, everywhere.
              </h1>
              
              <p className="mt-4 sm:mt-5 text-white/90 text-base sm:text-lg md:text-xl lg:text-2xl leading-snug drop-shadow-md max-w-3xl">
                Post once. Share on WhatsApp, Facebook & beyond.
              </p>

              {/* CTA Buttons */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link 
                  to="/create"
                  className="inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground h-12 sm:h-14 px-5 sm:px-6 text-base sm:text-lg font-semibold shadow-lg shadow-black/20 transition-colors"
                >
                  Create Your First Listing
                </Link>
                <Link 
                  to="/search"
                  className="inline-flex items-center justify-center rounded-xl bg-white hover:bg-white/90 text-foreground h-12 sm:h-14 px-5 sm:px-6 text-base sm:text-lg font-semibold shadow-lg shadow-black/10 transition-colors"
                >
                  Search Properties
                </Link>
              </div>

              {/* Free checkmark line */}
              <div className="mt-4 sm:mt-5 flex items-center gap-2 text-white/95">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
                <span className="text-sm sm:text-base lg:text-lg font-medium">
                  100% free, no middlemen
                </span>
              </div>
            </div>

            {/* Feature cards */}
            <div className="mt-12 sm:mt-16 md:mt-20 lg:mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 max-w-6xl">
              <FeatureCard
                icon={<Zap className="h-5 w-5 sm:h-6 sm:w-6" />}
                title="Quick Setup"
                description="Post in under 2 minutes."
              />
              <FeatureCard
                icon={<Share2 className="h-5 w-5 sm:h-6 sm:w-6" />}
                title="Share Anywhere"
                description="One click to WhatsApp & Facebook groups"
              />
              <FeatureCard
                icon={<Handshake className="h-5 w-5 sm:h-6 sm:w-6" />}
                title="Direct Contact"
                description="No brokers, no middlemen"
              />
              <FeatureCard
                icon={<MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />}
                title="Peer-to-Peer"
                description="Chat directly with buyers & renters."
              />
            </div>
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="h-8 sm:h-12 md:h-16 lg:h-20"></div>
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="rounded-2xl bg-white/90 backdrop-blur shadow-md shadow-black/5 px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>
        <h3 className="text-slate-900 font-semibold text-base sm:text-lg">{title}</h3>
      </div>
      <p className="text-slate-600 text-sm sm:text-[15px] leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default Hero;
