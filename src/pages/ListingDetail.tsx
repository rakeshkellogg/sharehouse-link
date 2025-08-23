
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  Phone, 
  MessageCircle, 
  ExternalLink,
  ArrowLeft,
  DollarSign
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Listing {
  id: string;
  title: string;
  price: number;
  bedrooms: string | null;
  bathrooms: string | null;
  size: string | null;
  description: string | null;
  location_address: string | null;
  google_maps_link: string | null;
  media_links: string[];
  owner_name: string;
  owner_phone: string | null;
  owner_whatsapp: string | null;
  created_at: string;
}

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) {
        setError("No listing ID provided");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .eq('is_public', true)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          setError("Listing not found or not publicly available");
        } else {
          setListing(data);
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
        setError("Failed to load listing");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleWhatsAppContact = (phone: string) => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const message = encodeURIComponent(`Hi! I'm interested in your property listing: ${listing?.title}`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handlePhoneCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-real-estate-light py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-real-estate-primary mx-auto"></div>
            <p className="mt-4 text-real-estate-neutral/70">Loading listing...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-real-estate-light py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <Home className="w-16 h-16 text-real-estate-neutral/50 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-real-estate-neutral mb-2">
              {error || "Listing Not Found"}
            </h1>
            <p className="text-real-estate-neutral/70 mb-6">
              This listing may have been removed or is no longer available.
            </p>
            <Link to="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-real-estate-light py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-real-estate-neutral mb-2">
                {listing.title}
              </h1>
              {listing.location_address && (
                <div className="flex items-center text-real-estate-neutral/70">
                  <MapPin className="w-4 h-4 mr-1" />
                  {listing.location_address}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-real-estate-primary flex items-center md:justify-end">
                <DollarSign className="w-8 h-8" />
                {formatPrice(listing.price)}
              </div>
              <div className="text-sm text-real-estate-neutral/70">per month</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Features */}
            <Card className="bg-gradient-card shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Property Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {listing.bedrooms && (
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Bed className="w-6 h-6 text-real-estate-primary" />
                      </div>
                      <div className="font-semibold">{listing.bedrooms}</div>
                      <div className="text-sm text-muted-foreground">Bedrooms</div>
                    </div>
                  )}
                  {listing.bathrooms && (
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Bath className="w-6 h-6 text-real-estate-primary" />
                      </div>
                      <div className="font-semibold">{listing.bathrooms}</div>
                      <div className="text-sm text-muted-foreground">Bathrooms</div>
                    </div>
                  )}
                  {listing.size && (
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Square className="w-6 h-6 text-real-estate-primary" />
                      </div>
                      <div className="font-semibold">{listing.size}</div>
                      <div className="text-sm text-muted-foreground">Sq Ft</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {listing.description && (
              <Card className="bg-gradient-card shadow-card border-0">
                <CardHeader>
                  <CardTitle>About This Property</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-real-estate-neutral/80 leading-relaxed whitespace-pre-wrap">
                    {listing.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Media Links */}
            {listing.media_links && listing.media_links.length > 0 && (
              <Card className="bg-gradient-card shadow-card border-0">
                <CardHeader>
                  <CardTitle>Photos & Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {listing.media_links.map((link, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => window.open(link, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Media {index + 1}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="bg-gradient-card shadow-card border-0">
              <CardHeader>
                <CardTitle>Contact Owner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-semibold text-real-estate-neutral mb-1">
                    {listing.owner_name}
                  </div>
                  <div className="text-sm text-real-estate-neutral/70">Property Owner</div>
                </div>

                <Separator />

                <div className="space-y-3">
                  {listing.owner_whatsapp && (
                    <Button
                      onClick={() => handleWhatsAppContact(listing.owner_whatsapp!)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                  )}
                  
                  {listing.owner_phone && (
                    <Button
                      onClick={() => handlePhoneCall(listing.owner_phone!)}
                      variant="outline"
                      className="w-full"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call {listing.owner_phone}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            {(listing.google_maps_link || listing.location_address) && (
              <Card className="bg-gradient-card shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {listing.location_address && (
                    <p className="text-real-estate-neutral/80 mb-3">
                      {listing.location_address}
                    </p>
                  )}
                  {listing.google_maps_link && (
                    <Button
                      onClick={() => window.open(listing.google_maps_link!, '_blank')}
                      variant="outline"
                      className="w-full"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Google Maps
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Listed Date */}
            <Card className="bg-gradient-card shadow-card border-0">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-sm text-real-estate-neutral/70">Listed on</div>
                  <div className="font-semibold">
                    {new Date(listing.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
