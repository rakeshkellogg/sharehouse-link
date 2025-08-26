
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
  DollarSign,
  Play
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import MessageOwner from "@/components/MessageOwner";
import MapDisplay from "@/components/MapDisplay";
import { ImageCarousel } from "@/components/ImageCarousel";
import { useAuth } from "@/contexts/AuthContext";

interface Listing {
  id: string;
  user_id: string;
  title: string;
  price: number;
  bedrooms: string | null;
  bathrooms: string | null;
  size: string | null;
  description: string | null;
  location_address: string | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_link: string | null;
  media_links: string[];
  youtube_url: string | null;
  cover_image_url: string | null;
  owner_name: string;
  owner_phone: string | null;
  owner_whatsapp: string | null;
  created_at: string;
}

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
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
              <h1 className="text-6xl md:text-5xl font-bold text-real-estate-neutral mb-2">
                {listing.title}
              </h1>
              {listing.location_address && (
                <div className="flex items-center text-real-estate-neutral/70 text-2xl md:text-lg">
                  <MapPin className="w-5 h-5 mr-2" />
                  {listing.location_address}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-6xl md:text-5xl font-bold text-real-estate-primary flex items-center md:justify-end">
                <DollarSign className="w-10 h-10" />
                {formatPrice(listing.price)}
              </div>
              <div className="text-2xl md:text-base text-real-estate-neutral/70">per month</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover Photo */}
            {listing.cover_image_url && !listing.media_links.some(link => link.includes('storage.googleapis.com') || link.includes('supabase.co')) && (
              <Card className="bg-gradient-card shadow-card border-0 overflow-hidden">
                <div className="aspect-video bg-muted">
                  <img 
                    src={listing.cover_image_url} 
                    alt={`Cover photo for ${listing.title}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = 
                        '<div class="w-full h-full flex items-center justify-center text-muted-foreground">Failed to load image</div>';
                    }}
                  />
                </div>
              </Card>
            )}

            {/* YouTube Video */}
            {listing.youtube_url && (
              <Card className="bg-gradient-card shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Property Video
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <YouTubeEmbed url={listing.youtube_url} title={`Video tour of ${listing.title}`} />
                </CardContent>
              </Card>
            )}

            {/* Property Features */}
            <Card className="bg-gradient-card shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-4xl md:text-2xl font-bold">
                  <Home className="w-7 h-7" />
                  Property Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  {listing.bedrooms && (
                      <div className="text-center">
                      <div className="flex items-center justify-center mb-3">
                        <Bed className="w-14 h-14 text-real-estate-primary" />
                      </div>
                      <div className="font-bold text-6xl md:text-4xl text-real-estate-neutral">{listing.bedrooms}</div>
                      <div className="text-2xl md:text-lg text-muted-foreground font-medium">Bedrooms</div>
                    </div>
                  )}
                  {listing.bathrooms && (
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-3">
                        <Bath className="w-14 h-14 text-real-estate-primary" />
                      </div>
                      <div className="font-bold text-6xl md:text-4xl text-real-estate-neutral">{listing.bathrooms}</div>
                      <div className="text-2xl md:text-lg text-muted-foreground font-medium">Bathrooms</div>
                    </div>
                  )}
                  {listing.size && (
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-3">
                        <Square className="w-14 h-14 text-real-estate-primary" />
                      </div>
                      <div className="font-bold text-6xl md:text-4xl text-real-estate-neutral">{listing.size}</div>
                      <div className="text-2xl md:text-lg text-muted-foreground font-medium">Sq Ft</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {listing.description && (
              <Card className="bg-gradient-card shadow-card border-0">
                <CardHeader>
                  <CardTitle className="text-4xl md:text-2xl font-bold">About This Property</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl md:text-lg text-real-estate-neutral/80 leading-relaxed whitespace-pre-wrap">
                    {listing.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Property Photos Carousel */}
            {listing.media_links && listing.media_links.length > 0 && (
              <Card className="bg-gradient-card shadow-card border-0">
                <CardHeader>
                  <CardTitle className="text-4xl md:text-2xl font-bold">Photos & Media</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Swipeable Image Carousel - Show for ANY images */}
                    {listing.media_links.length > 0 && (
                      <ImageCarousel
                        images={listing.media_links.filter(link => 
                          // Include ALL possible image formats
                          link.includes('storage.googleapis.com') || 
                          link.includes('supabase.co') ||
                          /\.(jpg|jpeg|png|gif|webp)$/i.test(link) ||
                          link.startsWith('data:image/') ||
                          link.startsWith('http') // Include all http URLs as potential images
                        )}
                        title="Property Photos"
                      />
                    )}
                     
                    {/* Only show Additional Media for truly non-image links */}
                    {listing.media_links.some(link => 
                      !link.includes('storage.googleapis.com') && 
                      !link.includes('supabase.co') && 
                      !/\.(jpg|jpeg|png|gif|webp)$/i.test(link) &&
                      !link.startsWith('data:image/') &&
                      !link.startsWith('http') // Exclude http URLs from Additional Media
                    ) && (
                      <div>
                        <h4 className="font-medium mb-3">Additional Media</h4>
                        <div className="space-y-2">
                          {listing.media_links
                            .filter(link => 
                              !link.includes('storage.googleapis.com') && 
                              !link.includes('supabase.co') && 
                              !/\.(jpg|jpeg|png|gif|webp)$/i.test(link) &&
                              !link.startsWith('data:image/') &&
                              !link.startsWith('http')
                            )
                            .map((link, index) => (
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
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Message Owner */}
            <MessageOwner 
              listingId={listing.id}
              ownerUserId={listing.user_id}
              listingTitle={listing.title}
            />

            {/* Contact Information */}
            <Card className="bg-gradient-card shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-5xl md:text-3xl font-bold">Contact Owner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="font-bold text-4xl md:text-2xl text-real-estate-neutral mb-2">
                    {listing.owner_name}
                  </div>
                  <div className="text-xl md:text-lg text-real-estate-neutral/70">Property Owner</div>
                </div>

                <Separator />

                <div className="space-y-4">
                  {listing.owner_whatsapp && (
                    <Button
                      onClick={() => handleWhatsAppContact(listing.owner_whatsapp!)}
                      className="w-full bg-green-600 hover:bg-green-700 text-2xl py-10"
                    >
                      <MessageCircle className="w-8 h-8 mr-3" />
                      WhatsApp
                    </Button>
                  )}
                  
                  {listing.owner_phone && (
                    <Button
                      onClick={() => handlePhoneCall(listing.owner_phone!)}
                      variant="outline"
                      className="w-full text-2xl py-10"
                    >
                      <Phone className="w-8 h-8 mr-3" />
                      Call {listing.owner_phone}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            {listing.location_address && (
              <MapDisplay
                address={listing.location_address}
                lat={listing.latitude || undefined}
                lng={listing.longitude || undefined}
                title="Property Location"
              />
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
