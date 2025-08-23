import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Users, Share2, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-real-estate.jpg";

const Hero = () => {
  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-real-estate-primary/80 via-real-estate-primary/70 to-real-estate-secondary/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Share Properties
            <br />
            <span className="text-real-estate-accent">Effortlessly</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Create beautiful property listings in under 2 minutes and share them across Facebook, WhatsApp, and beyond.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/create">
              <Button size="lg" className="bg-white text-real-estate-primary hover:bg-white/90 shadow-hero px-8 py-4 text-lg font-semibold">
                Create Your First Listing
              </Button>
            </Link>
            <Link to="/sample">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
                View Sample Listing
              </Button>
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Card className="bg-white/95 backdrop-blur-sm p-6 shadow-card border-0">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center mb-4">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-real-estate-neutral mb-2">Quick Setup</h3>
                <p className="text-sm text-real-estate-neutral/70">Create listings in under 2 minutes with our mobile-optimized form</p>
              </div>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm p-6 shadow-card border-0">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center mb-4">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-real-estate-neutral mb-2">Share Anywhere</h3>
                <p className="text-sm text-real-estate-neutral/70">Perfect for Facebook groups, WhatsApp, and social platforms</p>
              </div>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm p-6 shadow-card border-0">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-real-estate-neutral mb-2">Direct Contact</h3>
                <p className="text-sm text-real-estate-neutral/70">WhatsApp buttons and direct messaging built in</p>
              </div>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm p-6 shadow-card border-0">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-real-estate-neutral mb-2">Peer-to-Peer</h3>
                <p className="text-sm text-real-estate-neutral/70">Connect directly with property owners and renters</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;