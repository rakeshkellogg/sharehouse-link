
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Home, Users, Share2, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthButton from "@/components/AuthButton";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import heroImage from "@/assets/hero-real-estate.jpg";

const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?location=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <nav className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left Navigation */}
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-bold text-primary">
                PropertyShare
              </Link>
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/search?transaction=sale" className="text-neutral-700 hover:text-primary font-medium">
                  Buy
                </Link>
                <Link to="/search?transaction=rent" className="text-neutral-700 hover:text-primary font-medium">
                  Rent
                </Link>
                <Link to="/create" className="text-neutral-700 hover:text-primary font-medium">
                  Sell
                </Link>
              </div>
            </div>
            
            {/* Right Navigation */}
            <div className="flex items-center space-x-4">
              {user && (
                <Link to="/my-listings" className="text-neutral-700 hover:text-primary font-medium">
                  My Listings
                </Link>
              )}
              <AuthButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        <div 
          className="h-[500px] bg-cover bg-center bg-no-repeat flex items-center justify-center"
          style={{ 
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${heroImage})` 
          }}
        >
          <div className="text-center text-white max-w-3xl px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Agents. Tours.
              <br />
              Loans. Homes.
            </h1>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mt-8">
              <div className="relative max-w-2xl mx-auto">
                <Input
                  type="text"
                  placeholder="Enter an address, neighborhood, city, or ZIP code"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 pl-6 pr-16 text-lg border-0 rounded-lg shadow-lg"
                />
                <Button 
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-2 h-10 w-10 p-0 bg-primary hover:bg-primary/90"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <Link to="/create" className="group text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
              <Home className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Create Listing</h3>
            <p className="text-neutral-600 text-sm">List your property in minutes</p>
          </Link>

          <Link to="/search" className="group text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Search Properties</h3>
            <p className="text-neutral-600 text-sm">Find your perfect home</p>
          </Link>

          <div className="group text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Share Easily</h3>
            <p className="text-neutral-600 text-sm">Share on social platforms</p>
          </div>

          <div className="group text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Direct Contact</h3>
            <p className="text-neutral-600 text-sm">Connect with owners</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
