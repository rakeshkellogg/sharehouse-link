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
  className?: string;
}

const MapDisplay = ({ address, lat, lng, title = "Property Location", className = "" }: MapDisplayProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [resolvedCoords, setResolvedCoords] = useState<{lat: number, lng: number} | null>(null);
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
          setResolvedCoords({ lat, lng });
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
              setResolvedCoords({ lat: location.lat(), lng: location.lng() });
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

        // Add click handler to map
        mapInstance.addListener('click', () => {
          openInGoogleMaps();
        });

        // Add pointer cursor
        mapInstance.setOptions({ styles: [{ stylers: [{ cursor: 'pointer' }] }] });

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
    const coords = resolvedCoords || (lat && lng ? { lat, lng } : null);
    if (coords) {
      window.open(`https://www.google.com/maps?q=${coords.lat},${coords.lng}`, '_blank');
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
    // Fallback to Google Maps iframe when no API key available
    const coords = lat && lng ? `${lat},${lng}` : encodeURIComponent(address);
    const iframeSrc = `https://www.google.com/maps/embed/v1/place?key=AIzaSyDummy&q=${coords}&zoom=15`;
    
    return (
      <Card className={`bg-gradient-card ${className}`}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8 text-real-estate-primary" />
                <div>
                  <p className="font-bold text-4xl md:text-2xl text-real-estate-neutral">{title}</p>
                  <p className="text-2xl md:text-lg text-real-estate-neutral/70">{address}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleShareLocation} className="text-xl md:text-base py-4 px-6">
                  <Share2 className="w-6 h-6 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" onClick={handleWhatsAppShare} className="text-xl md:text-base py-4 px-6">
                  <MessageCircle className="w-6 h-6 mr-2" />
                  WhatsApp
                </Button>
                <Button variant="outline" size="sm" onClick={openInGoogleMaps} className="text-xl md:text-base py-4 px-6">
                  <ExternalLink className="w-6 h-6 mr-2" />
                  Open
                </Button>
              </div>
            </div>
            
            <div 
              className="w-full h-48 rounded-lg border border-real-estate-light bg-real-estate-light/50 overflow-hidden cursor-pointer"
              onClick={openInGoogleMaps}
            >
              <iframe
                src={`https://maps.google.com/maps?q=${coords}&output=embed&z=15`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map of ${title}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-card ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8 text-real-estate-primary" />
              <div>
                <p className="font-bold text-4xl md:text-2xl text-real-estate-neutral">{title}</p>
                <p className="text-2xl md:text-lg text-real-estate-neutral/70">{address}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShareLocation} className="text-xl md:text-base py-4 px-6">
                <Share2 className="w-6 h-6 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleWhatsAppShare} className="text-xl md:text-base py-4 px-6">
                <MessageCircle className="w-6 h-6 mr-2" />
                WhatsApp
              </Button>
              <Button variant="outline" size="sm" onClick={openInGoogleMaps} className="text-xl md:text-base py-4 px-6">
                <ExternalLink className="w-6 h-6 mr-2" />
                Open
              </Button>
            </div>
          </div>
          
          <div 
            ref={mapRef} 
            className="w-full h-48 rounded-lg border border-real-estate-light bg-real-estate-light/50 cursor-pointer"
            onClick={openInGoogleMaps}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MapDisplay;