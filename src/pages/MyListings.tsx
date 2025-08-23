
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Plus, 
  Copy, 
  ExternalLink, 
  Eye,
  Calendar,
  DollarSign,
  MapPin
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Listing {
  id: string;
  title: string;
  price: number;
  bedrooms: string | null;
  bathrooms: string | null;
  size: string | null;
  location_address: string | null;
  is_public: boolean;
  created_at: string;
}

const MyListings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyListings = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('listings')
          .select('id, title, price, bedrooms, bathrooms, size, location_address, is_public, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setListings(data || []);
      } catch (error) {
        console.error('Error fetching listings:', error);
        toast({
          title: "Error Loading Listings",
          description: "Failed to load your listings. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMyListings();
  }, [user, toast]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const copyShareLink = async (listingId: string) => {
    const shareUrl = `${window.location.origin}/listing/${listingId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Copied!",
        description: "Share link copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Copy Failed",
        description: "Please copy the link manually",
        variant: "destructive"
      });
    }
  };

  const openListing = (listingId: string) => {
    window.open(`/listing/${listingId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-real-estate-light py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-real-estate-primary mx-auto"></div>
            <p className="mt-4 text-real-estate-neutral/70">Loading your listings...</p>
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
            <h1 className="text-3xl md:text-4xl font-bold text-real-estate-neutral mb-2">
              My Listings
            </h1>
            <p className="text-real-estate-neutral/70">
              Manage and share your property listings
            </p>
          </div>
          <Link to="/create">
            <Button className="bg-gradient-hero text-white shadow-hero mt-4 md:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Create New Listing
            </Button>
          </Link>
        </div>

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-real-estate-neutral/50 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-real-estate-neutral mb-2">
              No Listings Yet
            </h2>
            <p className="text-real-estate-neutral/70 mb-6">
              Create your first property listing to get started sharing with potential renters.
            </p>
            <Link to="/create">
              <Button className="bg-gradient-hero text-white shadow-hero">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Listing
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="bg-gradient-card shadow-card border-0 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2 flex-1 mr-2">
                      {listing.title}
                    </CardTitle>
                    <Badge variant={listing.is_public ? "default" : "secondary"}>
                      {listing.is_public ? "Public" : "Private"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Price */}
                  <div className="flex items-center text-xl font-bold text-real-estate-primary">
                    <DollarSign className="w-5 h-5 mr-1" />
                    {formatPrice(listing.price)}
                    <span className="text-sm font-normal text-real-estate-neutral/70 ml-1">
                      /month
                    </span>
                  </div>

                  {/* Property Details */}
                  <div className="flex gap-4 text-sm text-real-estate-neutral/70">
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

                  {/* Created Date */}
                  <div className="flex items-center text-sm text-real-estate-neutral/70">
                    <Calendar className="w-4 h-4 mr-2" />
                    Created {new Date(listing.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => copyShareLink(listing.id)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Link
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => openListing(listing.id)}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;
