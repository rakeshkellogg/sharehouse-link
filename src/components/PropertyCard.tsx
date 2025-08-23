import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square, Phone, MessageCircle, Share2 } from "lucide-react";
import sampleProperty from "@/assets/sample-property.jpg";

interface PropertyCardProps {
  title: string;
  price: string;
  location: string;
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
  bedrooms,
  bathrooms,
  size,
  description,
  ownerName,
  image = sampleProperty
}: PropertyCardProps) => {
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
          <Badge className="bg-real-estate-accent text-white font-semibold px-3 py-1">
            {price}
          </Badge>
        </div>
        <div className="absolute top-4 left-4">
          <Button size="sm" variant="secondary" className="bg-white/90 backdrop-blur-sm">
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Title and Location */}
        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-real-estate-neutral mb-2">
            {title}
          </h2>
          <div className="flex items-center text-real-estate-neutral/70 mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{location}</span>
          </div>
        </div>

        {/* Property Features */}
        <div className="flex gap-4 mb-4">
          <div className="flex items-center gap-1 text-real-estate-neutral/70">
            <Bed className="w-4 h-4" />
            <span className="text-sm">{bedrooms} bed</span>
          </div>
          <div className="flex items-center gap-1 text-real-estate-neutral/70">
            <Bath className="w-4 h-4" />
            <span className="text-sm">{bathrooms} bath</span>
          </div>
          <div className="flex items-center gap-1 text-real-estate-neutral/70">
            <Square className="w-4 h-4" />
            <span className="text-sm">{size} sq ft</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-real-estate-neutral/80 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Contact Section */}
        <div className="border-t pt-4">
          <p className="text-sm text-real-estate-neutral/70 mb-3">
            Listed by <span className="font-semibold text-real-estate-neutral">{ownerName}</span>
          </p>
          
          <div className="flex gap-3">
            <Button className="flex-1 bg-real-estate-secondary hover:bg-real-estate-secondary/90 text-white">
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