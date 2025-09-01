import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  sub_area?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
}

interface MapLocationPickerProps {
  onLocationChange: (location: LocationData) => void;
  initialLocation?: string;
}

const MapLocationPicker = ({ onLocationChange, initialLocation = "" }: MapLocationPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [address, setAddress] = useState<string>(initialLocation);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchApiKey = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please log in to use location features');
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('get-maps-api-key');
      
      if (error) {
        throw error;
      }

      if (data?.apiKey) {
        setApiKey(data.apiKey);
        setError('');
      } else {
        setError('Google Maps API key not configured');
      }
    } catch (err) {
      console.error('Error fetching API key:', err);
      setError('Failed to load maps. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKey();
  }, []);

  // Helper function to parse address components from Google Places result
  const parseAddressComponents = (place: google.maps.places.PlaceResult | google.maps.GeocoderResult): LocationData => {
    const components = place.address_components || [];
    let sub_area = '';
    let city = '';
    let district = '';
    let state = '';
    let pincode = '';

    components.forEach((component) => {
      const types = component.types;
      
      if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
        sub_area = component.long_name;
      } else if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_2')) {
        district = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.long_name;
      } else if (types.includes('postal_code')) {
        pincode = component.long_name;
      }
    });

    return {
      lat: 0, // Will be set by caller
      lng: 0, // Will be set by caller
      address: place.formatted_address || '',
      sub_area: sub_area || undefined,
      city: city || undefined,
      district: district || undefined,
      state: state || undefined,
      pincode: pincode || undefined,
    };
  };

  const initializeMap = async (key: string) => {
    if (!mapRef.current || !key) return;

    try {
      const loader = new Loader({
        apiKey: key,
        version: "weekly",
        libraries: ["places", "geocoding"]
      });

      const google = await loader.load();
      
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 20.5937, lng: 78.9629 }, // Center on India
        zoom: 5,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      const markerInstance = new google.maps.Marker({
        map: mapInstance,
        draggable: true,
        title: "Property Location"
      });

      // Geocoder for address lookup
      const geocoder = new google.maps.Geocoder();

      // Handle map clicks
      mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const position = event.latLng;
          markerInstance.setPosition(position);
          
          // Reverse geocode to get address
          geocoder.geocode({ location: position }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
              const addressData = parseAddressComponents(results[0]);
              addressData.lat = position.lat();
              addressData.lng = position.lng();
              
              setAddress(addressData.address);
              onLocationChange(addressData);
            }
          });
        }
      });

      // Handle marker drag
      markerInstance.addListener('dragend', () => {
        const position = markerInstance.getPosition();
        if (position) {
          geocoder.geocode({ location: position }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
              const addressData = parseAddressComponents(results[0]);
              addressData.lat = position.lat();
              addressData.lng = position.lng();
              
              setAddress(addressData.address);
              onLocationChange(addressData);
            }
          });
        }
      });

      setMap(mapInstance);
      setMarker(markerInstance);
      setIsMapLoaded(true);

      // Initialize Google Places Autocomplete (restricted to India)
      if (addressInputRef.current) {
        const autocompleteInstance = new google.maps.places.Autocomplete(
          addressInputRef.current,
          {
            types: ['address'],
            componentRestrictions: { country: 'IN' }, // Restrict to India
            fields: ['formatted_address', 'geometry', 'name', 'address_components']
          }
        );

        autocompleteInstance.addListener('place_changed', () => {
          const place = autocompleteInstance.getPlace();
          
          if (place.geometry?.location) {
            const location = place.geometry.location;
            const addressData = parseAddressComponents(place);
            addressData.lat = location.lat();
            addressData.lng = location.lng();
            
            mapInstance.setCenter(location);
            markerInstance.setPosition(location);
            setAddress(addressData.address);
            
            onLocationChange(addressData);
          }
        });

        setAutocomplete(autocompleteInstance);
      }

      // If there's an initial address, geocode it
      if (initialLocation) {
        geocoder.geocode({ address: initialLocation }, (results, status) => {
          if (status === 'OK' && results?.[0] && results[0].geometry?.location) {
            const location = results[0].geometry.location;
            const addressData = parseAddressComponents(results[0]);
            addressData.lat = location.lat();
            addressData.lng = location.lng();
            
            mapInstance.setCenter(location);
            markerInstance.setPosition(location);
            onLocationChange(addressData);
          }
        });
      }

    } catch (error) {
      console.error('Error loading Google Maps:', error);
    }
  };

  useEffect(() => {
    if (apiKey) {
      initializeMap(apiKey);
    }
  }, [apiKey]);

  const handleAddressSearch = () => {
    if (!map || !marker || !address) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results?.[0] && results[0].geometry?.location) {
        const location = results[0].geometry.location;
        const addressData = parseAddressComponents(results[0]);
        addressData.lat = location.lat();
        addressData.lng = location.lng();
        
        map.setCenter(location);
        marker.setPosition(location);
        setAddress(addressData.address);
        onLocationChange(addressData);
      }
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-card">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-real-estate-primary" />
              <Label className="text-base font-semibold">Property Location</Label>
            </div>
            
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-real-estate-primary" />
              <span className="ml-2 text-real-estate-neutral/70">Loading maps...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-card">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-real-estate-primary" />
              <Label className="text-base font-semibold">Property Location</Label>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-real-estate-primary" />
            <Label className="text-base font-semibold">Property Location</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <div className="flex gap-2">
              <Input
                ref={addressInputRef}
                id="address"
                placeholder="Start typing an address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
                className="flex-1"
              />
              <button
                type="button"
                onClick={handleAddressSearch}
                className="px-4 py-2 bg-real-estate-primary text-white rounded-md hover:bg-real-estate-primary/90 transition-colors"
              >
                Search
              </button>
            </div>
            <p className="text-sm text-real-estate-neutral/60">
              Start typing to see Indian address suggestions from Google Places
            </p>
          </div>

          <div className="space-y-2">
            <Label>Map Location</Label>
            <div 
              ref={mapRef} 
              className="w-full h-64 rounded-lg border border-real-estate-light bg-real-estate-light/50"
            />
            {isMapLoaded && (
              <p className="text-sm text-real-estate-neutral/60">
                Click on the map or drag the marker to set the exact location
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapLocationPicker;