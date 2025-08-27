import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Home, 
  Heart,
  ExternalLink,
  Calendar,
  DollarSign,
  MapPin,
  MessageCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface SavedListing {
  id: string;
  saved_at: string;
  listing: {
    id: string;
    title: string;
    price: number;
    bedrooms: string | null;
    bathrooms: string | null;
    size: string | null;
    location_address: string | null;
    cover_image_url: string | null;
    created_at: string;
  };
}

const SavedListings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedListings = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('saved_listings')
          .select(`
            id,
            saved_at,
            listing:listings(
              id,
              title,
              price,
              bedrooms,
              bathrooms,
              size,
              location_address,
              cover_image_url,
              created_at
            )
          `)
          .eq('user_id', user.id)
          .order('saved_at', { ascending: false });

        if (error) throw error;
        
        // Filter out listings that may have been deleted
        const validSavedListings = (data || []).filter(item => item.listing);
        setSavedListings(validSavedListings);
      } catch (error) {
        console.error('Error fetching saved listings:', error);
        toast({
          title: "Error Loading Saved Listings",
          description: "Failed to load your saved listings. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSavedListings();
  }, [user, toast]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const unsaveListing = async (savedListingId: string, listingTitle: string) => {
    try {
      const { error } = await supabase
        .from('saved_listings')
        .delete()
        .eq('id', savedListingId);

      if (error) throw error;

      setSavedListings(prev => prev.filter(item => item.id !== savedListingId));
      
      toast({
        title: "Listing Removed",
        description: `"${listingTitle}" has been removed from your saved listings.`,
      });
    } catch (error) {
      console.error('Error removing saved listing:', error);
      toast({
        title: "Remove Failed",
        description: "Failed to remove listing. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-real-estate-light py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-real-estate-primary mx-auto"></div>
            <p className="mt-4 text-real-estate-neutral/70">Loading your saved listings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-real-estate-light py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-real-estate-neutral mb-2">
              Saved Listings
            </h1>
            <p className="text-lg md:text-xl text-real-estate-neutral/70">
              Properties you've saved for later viewing
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Link to="/">
              <Button variant="outline" className="shadow-hero">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link to="/my-listings">
              <Button variant="outline" className="shadow-hero">
                <MessageCircle className="w-4 h-4 mr-2" />
                My Listings
              </Button>
            </Link>
          </div>
        </div>

        {/* Saved Listings Grid */}
        {savedListings.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-real-estate-neutral/50 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-real-estate-neutral mb-2">
              No Saved Listings Yet
            </h2>
            <p className="text-lg md:text-xl text-real-estate-neutral/70 mb-6">
              Start exploring properties and save the ones you like for easy access later.
            </p>
            <Link to="/">
              <Button className="bg-gradient-hero text-white shadow-hero">
                <Home className="w-4 h-4 mr-2" />
                Browse Properties
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedListings.map((savedItem) => {
              const listing = savedItem.listing;
              return (
                <Card key={savedItem.id} className="bg-gradient-card shadow-card border-0 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl md:text-2xl line-clamp-2 flex-1 mr-2">
                        {listing.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Cover Image */}
                    {listing.cover_image_url && (
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <img 
                          src={listing.cover_image_url} 
                          alt={`Cover photo for ${listing.title}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center text-2xl md:text-3xl font-bold text-real-estate-primary">
                      <DollarSign className="w-6 h-6 mr-1" />
                      {formatPrice(listing.price)}
                      <span className="text-lg font-normal text-real-estate-neutral/70 ml-1">
                        /month
                      </span>
                    </div>

                    {/* Property Details */}
                    <div className="flex gap-4 text-base md:text-lg text-real-estate-neutral/70">
                      {listing.bedrooms && (
                        <span>{listing.bedrooms} bed</span>
                      )}
                      {listing.bathrooms && (
                        <span>{listing.bathrooms} bath</span>
                      )}
                      {listing.size && (
                        <span>{listing.size} sq ft</span>
                      )}
                    </div>

                    {/* Location */}
                    {listing.location_address && (
                      <div className="flex items-start gap-2 text-sm text-real-estate-neutral/70">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{listing.location_address}</span>
                      </div>
                    )}

                    {/* Saved Date */}
                    <div className="flex items-center text-sm text-real-estate-neutral/70">
                      <Calendar className="w-4 h-4 mr-2" />
                      Saved {new Date(savedItem.saved_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Link to={`/listing/${listing.id}`} className="flex-1">
                        <Button
                          size="sm"
                          className="w-full"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-red-500 text-red-600 hover:bg-red-500 hover:text-white"
                        onClick={() => unsaveListing(savedItem.id, listing.title)}
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedListings;