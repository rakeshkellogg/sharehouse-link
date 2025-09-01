import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square, Phone, MessageCircle, Share2 } from "lucide-react";
import { shareLocation, shareLocationViaWhatsApp } from "@/lib/locationShare";
import { useToast } from "@/hooks/use-toast";
import MapDisplay from "./MapDisplay";
import sampleProperty from "@/assets/sample-property.jpg";

interface PropertyCardProps {
  title: string;
  price: string;
  location: string;
  lat?: number;
  lng?: number;
  sub_area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  bedrooms?: string;
  bathrooms?: string;
  size?: string;
  description: string;
  ownerName: string;
  coverImageUrl?: string;
  image?: string;
  propertyType?: string;
  transactionType?: string;
  onClick?: () => void;
}

const PropertyCard = ({
  title,
  price,
  location,
  lat,
  lng,
  sub_area,
  city,
  state,
  pincode,
  bedrooms,
  bathrooms,
  size,
  description,
  ownerName,
  coverImageUrl,
  image,
  propertyType,
  transactionType,
  onClick
}: PropertyCardProps) => {
  const { toast } = useToast();

  // Format location for Indian addresses
  const formatLocationDisplay = () => {
    if (sub_area && city && state) {
      return `${sub_area}, ${city}, ${state}${pincode ? ` - ${pincode}` : ''}`;
    } else if (city && state) {
      return `${city}, ${state}${pincode ? ` - ${pincode}` : ''}`;
    } else if (city) {
      return city;
    }
    return location; // Fallback to original location
  };

  const handleShareLocation = async () => {
    const success = await shareLocation({
      address: location,
      lat,
      lng,
      title: `${title} - ${price}`,
      message: `Check out this property: ${title} for ${price} in ${location}`
    });

    if (success) {
      toast({
        title: "Location shared!",
        description: "Property location copied to clipboard or shared successfully."
      });
    } else {
      toast({
        title: "Failed to share",
        description: "Unable to share location. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleWhatsAppShare = () => {
    shareLocationViaWhatsApp({
      address: location,
      lat,
      lng,
      title: `${title} - ${price}`,
      message: `🏡 Check out this property!\n\n${title}\n${price}\n${location}`
    });
  };

  return (
    <Card className="bg-gradient-card shadow-card border-0 overflow-hidden cursor-pointer" onClick={onClick}>
      {/* Property Image */}
      <div className="relative h-64 md:h-80">
        <img 
          src={coverImageUrl || image || sampleProperty} 
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4">
          <Badge className="bg-real-estate-accent text-white font-bold text-lg md:text-sm px-4 py-2 md:px-2 md:py-1">
            {price}
          </Badge>
        </div>
        <div className="absolute top-4 left-4 flex gap-2">
          {propertyType && (
            <Badge className="bg-real-estate-primary text-white text-sm md:text-xs">
              {propertyType === 'house' ? 'House' : 'Land'}
            </Badge>
          )}
          {transactionType && (
            <Badge className="bg-real-estate-secondary text-white text-sm md:text-xs">
              {transactionType === 'sale' ? 'For Sale' : 'For Rent'}
            </Badge>
          )}
        </div>
        <div className="absolute bottom-4 left-4">
          <Button size="sm" variant="secondary" className="bg-white/90 backdrop-blur-sm text-sm md:text-xs" onClick={(e) => { e.stopPropagation(); handleShareLocation(); }}>
            <Share2 className="w-4 h-4 md:w-3 md:h-3 mr-1" />
            Share Location
          </Button>
        </div>
      </div>

      <CardContent className="p-6 md:p-3">
        {/* Title */}
        <div className="mb-4 md:mb-2">
          <h2 className="text-2xl md:text-lg font-bold text-real-estate-neutral mb-2 md:mb-1">
            {title}
          </h2>
          <div className="flex items-center text-real-estate-neutral/70 mb-3 md:mb-2 text-base md:text-sm">
            <MapPin className="w-5 h-5 md:w-4 md:h-4 mr-1" />
            <span>{formatLocationDisplay()}</span>
          </div>
        </div>

        {/* Property Features */}
        {(bedrooms || bathrooms || size) && (
          <div className="flex gap-6 md:gap-3">
            {bedrooms && (
              <div className="flex items-center gap-2 md:gap-1 text-real-estate-neutral/70">
                <Bed className="w-5 h-5 md:w-4 md:h-4" />
                <span className="text-base md:text-sm font-medium">{bedrooms} bed</span>
              </div>
            )}
            {bathrooms && (
              <div className="flex items-center gap-2 md:gap-1 text-real-estate-neutral/70">
                <Bath className="w-5 h-5 md:w-4 md:h-4" />
                <span className="text-base md:text-sm font-medium">{bathrooms} bath</span>
              </div>
            )}
            {size && (
              <div className="flex items-center gap-2 md:gap-1 text-real-estate-neutral/70">
                <Square className="w-5 h-5 md:w-4 md:h-4" />
                <span className="text-base md:text-sm font-medium">{size} sq ft</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyCard;