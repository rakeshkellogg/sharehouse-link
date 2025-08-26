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
  MapPin,
  Edit3,
  Trash2,
  MessageCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
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
  const [showDebug, setShowDebug] = useState(false);

  // Debug logging
  console.log('🔍 DEBUG: MyListings component rendered');
  console.log('🔍 DEBUG: User object:', user);
  console.log('🔍 DEBUG: User ID:', user?.id);
  console.log('🔍 DEBUG: Loading state:', loading);
  console.log('🔍 DEBUG: Listings count:', listings.length);

  useEffect(() => {
    const fetchMyListings = async () => {
      if (!user) {
        console.log('🔍 DEBUG: No user, skipping fetch');
        return;
      }

      console.log('🔍 DEBUG: Fetching listings for user:', user.id);
      console.log('🔍 DEBUG: User object:', user);

      try {
        const { data, error } = await supabase
          .from('listings')
          .select('id, title, price, bedrooms, bathrooms, size, location_address, is_public, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        console.log('🔍 DEBUG: Supabase response:', { data, error });
        
        if (error) throw error;
        
        console.log('🔍 DEBUG: Set listings:', data?.length || 0, 'items');
        setListings(data || []);
      } catch (error) {
        console.error('🔍 DEBUG: Error fetching listings:', error);
        toast({
          title: "Error Loading Listings",
          description: "Failed to load your listings. Please try again.",
          variant: "destructive"
        });
      } finally {
        console.log('🔍 DEBUG: Fetch complete, setting loading to false');
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

  const deleteListing = async (listingId: string, title: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', listingId);

      if (error) throw error;

      // Remove from local state
      setListings(prev => prev.filter(listing => listing.id !== listingId));

      toast({
        title: "Listing Deleted",
        description: `"${title}" has been deleted and is no longer public.`,
      });
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete listing. Please try again.",
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
          <div className="flex gap-2 mt-4 md:mt-0">
            <Link to="/">
              <Button variant="outline" className="shadow-hero">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link to="/inbox">
              <Button variant="outline" className="shadow-hero">
                <MessageCircle className="w-4 h-4 mr-2" />
                Inbox
              </Button>
            </Link>
            <Link to="/create">
              <Button className="bg-gradient-hero text-white shadow-hero">
                <Plus className="w-4 h-4 mr-2" />
                Create New Listing
              </Button>
            </Link>
          </div>
        </div>

        {/* Debug Panel */}
        <Card className="mb-6 border-yellow-400 bg-yellow-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-yellow-800">🔍 Debug Panel</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDebug(!showDebug)}
                className="border-yellow-400 text-yellow-800 hover:bg-yellow-100"
              >
                {showDebug ? 'Hide Debug' : 'Show Debug'}
              </Button>
            </div>
          </CardHeader>
          {showDebug && (
            <CardContent className="text-sm text-yellow-800 space-y-2">
              <div><strong>User ID:</strong> {user?.id || 'Not authenticated'}</div>
              <div><strong>Listings Count:</strong> {listings.length}</div>
              <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
              <div><strong>Route:</strong> /my-listings</div>
              <div className="border-t pt-2 mt-2">
                <strong>User Object:</strong>
                <pre className="text-xs mt-1 bg-yellow-100 p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </CardContent>
          )}
        </Card>

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
            {listings.map((listing) => {
              console.log('🔍 DEBUG: Rendering listing:', listing.id, listing.title);
              return (
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

                    {/* Edit/Delete Actions */}
                    <div className="flex gap-2 pt-2 border-t border-real-estate-light mt-2">
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

export default MyListings;