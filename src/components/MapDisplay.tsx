import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, ExternalLink, Share2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shareLocation, shareLocationViaWhatsApp } from "@/lib/locationShare";
import { useToast } from "@/hooks/use-toast";

interface MapDisplayProps {
  address: string;
  lat?: number;
  lng?: number;
  title?: string;
}

const MapDisplay = ({ address, lat, lng, title = "Property Location" }: MapDisplayProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const { toast } = useToast();
  const apiKey = localStorage.getItem('googleMapsApiKey') || '';

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current || !apiKey) return;

      try {
        const loader = new Loader({
          apiKey: apiKey,
          version: "weekly",
          libraries: ["places", "geocoding"]
        });

        const google = await loader.load();
        
        let center = { lat: 37.7749, lng: -122.4194 }; // Default to San Francisco
        
        // Use provided coordinates or geocode the address
        if (lat && lng) {
          center = { lat, lng };
        } else if (address) {
          const geocoder = new google.maps.Geocoder();
          try {
            const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
              geocoder.geocode({ address }, (results, status) => {
                if (status === 'OK' && results) {
                  resolve(results);
                } else {
                  reject(new Error('Geocoding failed'));
                }
              });
            });
            
            if (results[0]?.geometry?.location) {
              const location = results[0].geometry.location;
              center = { lat: location.lat(), lng: location.lng() };
            }
          } catch (error) {
            console.error('Geocoding error:', error);
          }
        }

        const mapInstance = new google.maps.Map(mapRef.current, {
          center,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
        });

        new google.maps.Marker({
          position: center,
          map: mapInstance,
          title: title,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#3B82F6',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          }
        });

        setIsMapLoaded(true);

      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initializeMap();
  }, [apiKey, address, lat, lng, title]);

  const openInGoogleMaps = () => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    } else if (address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
    }
  };

  const handleShareLocation = async () => {
    const success = await shareLocation({
      address,
      lat,
      lng,
      title,
      message: `📍 Location: ${title}`
    });

    if (success) {
      toast({
        title: "Location shared!",
        description: "Location copied to clipboard or shared successfully."
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
      address,
      lat,
      lng,
      title,
      message: `📍 Check out this location: ${title}`
    });
  };

  if (!apiKey) {
    return (
      <Card className="bg-gradient-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-real-estate-primary" />
              <div>
                <p className="font-semibold text-real-estate-neutral">{title}</p>
                <p className="text-sm text-real-estate-neutral/70">{address}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShareLocation}>
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleWhatsAppShare}>
                <MessageCircle className="w-4 h-4 mr-1" />
                WhatsApp
              </Button>
              <Button variant="outline" size="sm" onClick={openInGoogleMaps}>
                <ExternalLink className="w-4 h-4 mr-1" />
                View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-real-estate-primary" />
              <div>
                <p className="font-semibold text-real-estate-neutral">{title}</p>
                <p className="text-sm text-real-estate-neutral/70">{address}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShareLocation}>
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleWhatsAppShare}>
                <MessageCircle className="w-4 h-4 mr-1" />
                WhatsApp
              </Button>
              <Button variant="outline" size="sm" onClick={openInGoogleMaps}>
                <ExternalLink className="w-4 h-4 mr-1" />
                Open
              </Button>
            </div>
          </div>
          
          <div 
            ref={mapRef} 
            className="w-full h-48 rounded-lg border border-real-estate-light bg-real-estate-light/50"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MapDisplay;