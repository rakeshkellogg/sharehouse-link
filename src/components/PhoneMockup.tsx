import { Share2, Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import sampleProperty from "@/assets/sample-property.jpg";

const PhoneMockup = () => {
  return (
    <div className="relative mx-auto">
      {/* Phone Frame */}
      <div className="relative w-[280px] h-[560px] bg-card border-8 border-real-estate-neutral/20 rounded-[3rem] shadow-hero overflow-hidden">
        {/* Screen Content */}
        <div className="h-full bg-background flex flex-col">
          {/* Status Bar */}
          <div className="h-6 bg-real-estate-neutral flex items-center justify-center">
            <div className="w-16 h-1 bg-white rounded-full"></div>
          </div>
          
          {/* Property Image */}
          <div className="relative h-48 overflow-hidden">
            <img 
              src={sampleProperty} 
              alt="Sample Property" 
              className="w-full h-full object-cover"
            />
            <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-real-estate-neutral" />
            </button>
          </div>
          
          {/* Property Details */}
          <div className="flex-1 p-4 space-y-3">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-real-estate-neutral">$2,500/month</h3>
              <p className="text-sm text-real-estate-neutral/70">2 bed • 1 bath • 850 sqft</p>
              <div className="flex items-center gap-1 text-xs text-real-estate-neutral/60">
                <MapPin className="w-3 h-3" />
                <span>Downtown District</span>
              </div>
            </div>
            
            <div className="space-y-2 pt-2">
              <p className="text-xs text-real-estate-neutral/70">
                Modern apartment with updated kitchen and great city views. Perfect for young professionals.
              </p>
            </div>
            
            {/* Share Button */}
            <div className="pt-4">
              <Button 
                size="sm" 
                className="w-full bg-real-estate-primary text-white hover:bg-real-estate-primary/90"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Property
              </Button>
            </div>
          </div>
        </div>
        
        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-real-estate-neutral/30 rounded-full"></div>
      </div>
    </div>
  );
};

export default PhoneMockup;