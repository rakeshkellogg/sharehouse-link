import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PropertyCard from "@/components/PropertyCard";
import { formatListingPrice } from "@/lib/priceUtils";

const SearchProperties = () => {
  const [searchLocation, setSearchLocation] = useState("");
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch address suggestions from database (prioritize sub_area, city, pincode)
  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('search_public_listings', { search_location: query });

      if (error) {
        console.error('Error fetching suggestions:', error);
        return;
      }

      // Create unique suggestions with priority: sub_area > city > location_address
      const suggestions = new Set<string>();
      
      data?.forEach((item: any) => {
        if (item.sub_area && item.sub_area.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(`${item.sub_area}, ${item.city || ''}, ${item.state || ''}`.replace(/, ,/g, ',').replace(/^,|,$/g, ''));
        }
        if (item.city && item.city.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(`${item.city}, ${item.state || ''}`.replace(/, ,/g, ',').replace(/^,|,$/g, ''));
        }
        if (item.location_address) {
          suggestions.add(item.location_address);
        }
      });

      setSuggestions(Array.from(suggestions).slice(0, 5));
      setShowSuggestions(Array.from(suggestions).length > 0);
    } catch (error) {
      console.error('Suggestion fetch error:', error);
    }
  };

  // Debounced suggestion fetch
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchLocation.trim()) {
        fetchSuggestions(searchLocation.trim());
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchLocation]);

  const handleSuggestionClick = (suggestion: string) => {
    setSearchLocation(suggestion);
    setShowSuggestions(false);
    // Auto-search when suggestion is selected
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchLocation(e.target.value);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleSearch = async () => {
    const trimmedLocation = searchLocation.trim();
    
    // Only search if location is provided
    if (!trimmedLocation) {
      return;
    }

    setIsLoading(true);
    try {
      // Use secure function to get public listings, then fetch full details
      const { data: searchResults, error: searchError } = await supabase
        .rpc('search_public_listings', { search_location: trimmedLocation });

      if (searchError) {
        console.error('Error searching listings:', searchError);
        setListings([]);
        return;
      }

      // Get full listing details for the search results
      if (searchResults && searchResults.length > 0) {
        const listingIds = searchResults.map((item: any) => item.id);
        const { data: fullListings, error: listingsError } = await supabase
          .from('listings')
          .select('*')
          .in('id', listingIds)
          .eq('is_public', true)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (listingsError) {
          console.error('Error fetching full listings:', listingsError);
          setListings([]);
          return;
        }

        setListings(fullListings || []);
      } else {
        setListings([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press for search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-real-estate-light py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-2xl font-bold text-real-estate-neutral">
              Search Properties
            </h1>
            <p className="text-lg md:text-base text-real-estate-neutral/70">
              Find your perfect house or land for sale or rent
            </p>
          </div>
        </div>

        {/* Search Filters - Simplified */}
        <Card className="bg-white rounded-lg p-6 shadow-card mb-8">
          <div className="space-y-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-real-estate-neutral mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                <Input
                  type="text"
                  id="location"
                  value={searchLocation}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className="pl-10"
                  placeholder="Enter area, city, pincode, or state (e.g., Koramangala, Bangalore, 560001)"
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-20 mt-1 max-h-48 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-real-estate-neutral">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button 
              onClick={handleSearch} 
              disabled={isLoading || !searchLocation.trim()} 
              className="bg-gradient-hero text-white shadow-hero"
            >
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? 'Searching...' : 'Search Properties'}
            </Button>
          </div>
        </Card>

        {/* Search Results */}
        <div className="space-y-6">
          {listings.length > 0 && (
            <div>
              <h2 className="text-2xl md:text-xl font-semibold text-real-estate-neutral mb-4">
                Found {listings.length} {listings.length === 1 ? 'property' : 'properties'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                <PropertyCard
                  key={listing.id}
                  title={listing.title}
                  price={formatListingPrice({
                    price: listing.price,
                    price_rupees: listing.price_rupees,
                    price_amount_raw: listing.price_amount_raw,
                    price_unit: listing.price_unit,
                    transaction_type: listing.transaction_type
                  })}
                  location={listing.location_address}
                  lat={listing.latitude}
                  lng={listing.longitude}
                  sub_area={listing.sub_area}
                  city={listing.city}
                  state={listing.state}
                  pincode={listing.pincode}
                  bedrooms={listing.bedrooms}
                  bathrooms={listing.bathrooms}
                  size={listing.size}
                  description={listing.description}
                  coverImageUrl={listing.cover_image_url}
                  propertyType={listing.property_type || 'house'}
                  transactionType={listing.transaction_type || 'rent'}
                  onClick={() => window.open(`/listing/${listing.id}`, '_self')}
                />
                ))}
              </div>
            </div>
          )}

          {listings.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl md:text-lg font-semibold text-real-estate-neutral mb-2">
                No properties found
              </h3>
              <p className="text-base md:text-sm text-real-estate-neutral/70">
                Try adjusting your search filters to find more properties
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchProperties;