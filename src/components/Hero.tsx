
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, Search, List } from "lucide-react";
import { Link } from "react-router-dom";
import AuthButton from "@/components/AuthButton";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/hero-real-estate.jpg";

const Hero = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-20 bg-transparent">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="text-2xl font-bold text-blue-600">
              PropertyShare
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="#" className="text-white hover:text-gray-200 font-medium">
                Buy
              </Link>
              <Link to="#" className="text-white hover:text-gray-200 font-medium">
                Rent
              </Link>
              <Link to="#" className="text-white hover:text-gray-200 font-medium">
                Sell
              </Link>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {user && (
                <Link to="/my-listings">
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    <List className="w-4 h-4 mr-2" />
                    My Listings
                  </Button>
                </Link>
              )}
              <AuthButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-12 leading-tight">
            List, Share, Connect —<br />
            Real Estate Made Simple
          </h1>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter an address, neighborhood, city, or ZIP code"
                className="w-full px-6 py-4 text-lg rounded-full border-0 shadow-lg"
              />
              <Button 
                size="lg" 
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 hover:bg-blue-700 px-6"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="relative z-10 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-8 md:gap-16">
            <Link to="/create" className="flex flex-col items-center group">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-full mb-4 group-hover:bg-white/20 transition-colors">
                <Home className="w-8 h-8 text-white" />
              </div>
              <span className="text-white font-semibold text-lg">Create Listing</span>
            </Link>
            
            <Link to="/search" className="flex flex-col items-center group">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-full mb-4 group-hover:bg-white/20 transition-colors">
                <Search className="w-8 h-8 text-white" />
              </div>
              <span className="text-white font-semibold text-lg">Search Properties</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
