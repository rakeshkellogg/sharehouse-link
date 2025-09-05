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
  MapPin,
  Edit3,
  Trash2,
  MessageCircle,
  Heart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatListingPrice } from "@/lib/priceUtils";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Listing {
  id: string;
  title: string;
  price: number;
  price_rupees?: number;
  price_amount_raw?: number;
  price_unit?: string;
  transaction_type?: string;
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
      if (!user) {
        return;
      }

      try {
        const { data, error } = await supabase
          .from('listings')
          .select('id, title, price, price_rupees, price_amount_raw, price_unit, transaction_type, bedrooms, bathrooms, size, location_address, is_public, created_at')
          .eq('user_id', user.id)
          .is('deleted_at', null)
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

  const deleteListing = async (listingId: string, title: string) => {
    try {
      console.log('Delete attempt:', {
        listingId,
        userId: user?.id,
        userEmail: user?.email
      });

      // First verify ownership
      const { data: listingData, error: fetchError } = await supabase
        .from('listings')
        .select('id, user_id, title')
        .eq('id', listingId)
        .single();

      console.log('Listing ownership check:', {
        listingData,
        fetchError
      });

      if (fetchError) {
        throw new Error(`Failed to verify listing ownership: ${fetchError.message}`);
      }

      if (!listingData) {
        throw new Error('Listing not found');
      }

      if (listingData.user_id !== user?.id) {
        throw new Error('You do not have permission to delete this listing');
      }

      // Perform hard delete (not soft delete)
      const { data, error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId)
        .eq('user_id', user?.id)
        .select('id')
        .single();

      console.log('Delete response:', {
        data,
        error
      });

      if (error) throw error;

      // Remove from local state
      setListings(prev => prev.filter(listing => listing.id !== listingId));

      toast({
        title: "Listing Deleted",
        description: `"${title}" has been permanently deleted.`,
      });
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? `Failed to delete listing: ${error.message}` : "Failed to delete listing. Please try again.",
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
            <p className="mt-4 text-real-estate-neutral/70">Loading your listings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-real-estate-light py-12 overflow-x-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-real-estate-neutral mb-2">
              My Listings
            </h1>
            <p className="text-sm md:text-base text-real-estate-neutral/70">
              Manage and share your property listings
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto shadow-hero">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link to="/inbox">
              <Button variant="outline" className="w-full sm:w-auto shadow-hero">
                <MessageCircle className="w-4 h-4 mr-2" />
                Inbox
              </Button>
            </Link>
            <Link to="/saved">
              <Button variant="outline" className="w-full sm:w-auto shadow-hero">
                <Heart className="w-4 h-4 mr-2" />
                Saved
              </Button>
            </Link>
            <Link to="/create">
              <Button className="w-full sm:w-auto bg-gradient-hero text-white shadow-hero">
                <Plus className="w-4 h-4 mr-2" />
                Create New Listing
              </Button>
            </Link>
          </div>
        </div>


        {/* Listings Grid */}
        {listings.length === 0 ? (
          <div className="text-center py-12">
            <Home className="w-12 h-12 text-real-estate-neutral/50 mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-bold text-real-estate-neutral mb-2">
              No Listings Yet
            </h2>
            <p className="text-sm md:text-base text-real-estate-neutral/70 mb-6">
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
                <Card key={listing.id} className="bg-gradient-card shadow-card border-0 hover:shadow-lg transition-shadow flex flex-col h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg md:text-xl line-clamp-2 flex-1 mr-2">
                        {listing.title}
                      </CardTitle>
                      <Badge variant={listing.is_public ? "default" : "secondary"}>
                        {listing.is_public ? "Public" : "Private"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 space-y-4">
                    {/* Content Area - grows to fill available space */}
                    <div className="flex-1 space-y-4">
                      {/* Price */}
                      <div className="text-xl md:text-2xl font-bold text-real-estate-primary">
                        {formatListingPrice({
                          price: listing.price,
                          price_rupees: listing.price_rupees,
                          price_amount_raw: listing.price_amount_raw,
                          price_unit: listing.price_unit,
                          transaction_type: listing.transaction_type
                        })}
                      </div>

                      {/* Property Details */}
                      <div className="flex gap-4 text-sm md:text-base text-real-estate-neutral/70">
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
                    </div>

                    {/* Fixed Button Area - always at bottom */}
                    <div className="space-y-2 pt-2 border-t border-real-estate-light">
                      {/* Copy Link / View Actions */}
                      <div className="flex gap-2">
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

                      {/* Edit/Delete Actions */}
                      <div className="flex gap-2">
                        <Link to={`/edit/${listing.id}`} className="flex-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full bg-white border-real-estate-primary text-real-estate-primary hover:bg-real-estate-primary hover:text-white"
                          >
                            <Edit3 className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-white border-red-500 text-red-600 hover:bg-red-500 hover:text-white"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove "{listing.title}" from public view. 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteListing(listing.id, listing.title)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Listing
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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