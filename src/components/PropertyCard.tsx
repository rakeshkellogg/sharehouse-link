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
  bedrooms: string;
  bathrooms: string;
  size: string;
  description: string;
  ownerName: string;
  image?: string;
}

const PropertyCard = ({
  title,
  price,
  location,
  lat,
  lng,
  bedrooms,
  bathrooms,
  size,
  description,
  ownerName,
  image = sampleProperty
}: PropertyCardProps) => {
  const { toast } = useToast();

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
    <Card className="bg-gradient-card shadow-card border-0 overflow-hidden">
      {/* Property Image */}
      <div className="relative h-64 md:h-80">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4">
          <Badge className="bg-real-estate-accent text-white font-bold text-lg px-4 py-2">
            {price}
          </Badge>
        </div>
        <div className="absolute top-4 left-4">
          <Button size="sm" variant="secondary" className="bg-white/90 backdrop-blur-sm" onClick={handleShareLocation}>
            <Share2 className="w-4 h-4 mr-1" />
            Share Location
          </Button>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Title and Location */}
        <div className="mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-real-estate-neutral mb-2">
            {title}
          </h2>
          <div className="flex items-center text-real-estate-neutral/70 mb-3 text-base">
            <MapPin className="w-5 h-5 mr-1" />
            <span>{location}</span>
          </div>
        </div>

        {/* Property Features */}
        <div className="flex gap-6 mb-4">
          <div className="flex items-center gap-2 text-real-estate-neutral/70">
            <Bed className="w-5 h-5" />
            <span className="text-base font-medium">{bedrooms} bed</span>
          </div>
          <div className="flex items-center gap-2 text-real-estate-neutral/70">
            <Bath className="w-5 h-5" />
            <span className="text-base font-medium">{bathrooms} bath</span>
          </div>
          <div className="flex items-center gap-2 text-real-estate-neutral/70">
            <Square className="w-5 h-5" />
            <span className="text-base font-medium">{size} sq ft</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-real-estate-neutral/80 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Map Location */}
        <div className="mb-6">
          <MapDisplay 
            address={location}
            lat={lat}
            lng={lng}
            title="Property Location"
          />
        </div>

        {/* Contact Section */}
        <div className="border-t pt-4">
          <p className="text-sm text-real-estate-neutral/70 mb-3">
            Listed by <span className="font-semibold text-real-estate-neutral">{ownerName}</span>
          </p>
          
          <div className="flex gap-3">
            <Button className="flex-1 bg-real-estate-secondary hover:bg-real-estate-secondary/90 text-white" onClick={handleWhatsAppShare}>
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button variant="outline" className="flex-1 border-real-estate-primary text-real-estate-primary hover:bg-real-estate-primary/10">
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;