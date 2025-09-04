import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, DollarSign, Home, Bath, Bed, Square, Link, Phone, MessageCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MapLocationPicker from "@/components/MapLocationPicker";
import { ImagePicker } from "@/components/ImagePicker";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const EditListing = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    bedrooms: "",
    bathrooms: "",
    size: "",
    location: "",
    locationCoords: { lat: 0, lng: 0 },
    mediaLinks: "",
    youtubeUrl: "",
    coverImageUrl: ""
  });

  useEffect(() => {
    const fetchListing = async () => {
      if (!id || !user) return;

      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            title: data.title || "",
            price: data.price?.toString() || "",
            description: data.description || "",
            bedrooms: data.bedrooms || "",
            bathrooms: data.bathrooms || "",
            size: data.size || "",
            location: data.location_address || data.google_maps_link || "",
            locationCoords: { 
              lat: data.latitude || 0, 
              lng: data.longitude || 0 
            },
            mediaLinks: data.media_links?.join('\n') || "",
            youtubeUrl: data.youtube_url || "",
            coverImageUrl: data.cover_image_url || ""
          });
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
        toast({
          title: "Error",
          description: "Failed to load listing for editing.",
          variant: "destructive"
        });
        navigate('/my-listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, user, toast, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to edit this listing.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title || !formData.price) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse media links into array
      const mediaLinksArray = formData.mediaLinks
        .split('\n')
        .map(link => link.trim())
        .filter(link => link.length > 0);

      // Parse price to integer
      const priceValue = parseInt(formData.price.replace(/[^\d]/g, ''));
      if (isNaN(priceValue)) {
        throw new Error("Please enter a valid price");
      }

      const updateData = {
        title: formData.title,
        price: priceValue,
        bedrooms: formData.bedrooms || null,
        bathrooms: formData.bathrooms || null,
        size: formData.size || null,
        description: formData.description || null,
        location_address: formData.location || null,
        latitude: formData.locationCoords.lat || null,
        longitude: formData.locationCoords.lng || null,
        google_maps_link: formData.location.startsWith('http') ? formData.location : null,
        media_links: mediaLinksArray,
        youtube_url: formData.youtubeUrl || null,
        cover_image_url: formData.coverImageUrl || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('listings')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Listing Updated",
        description: "Your listing has been successfully updated.",
      });

      navigate('/my-listings');

    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: "Error Updating Listing",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (locationData: { lat: number; lng: number; address: string }) => {
    setFormData(prev => ({
      ...prev,
      location: locationData.address,
      locationCoords: { lat: locationData.lat, lng: locationData.lng }
    }));
  };

  const handleImagesChange = (coverUrl: string, mediaUrls: string[]) => {
    setFormData(prev => ({
      ...prev,
      coverImageUrl: coverUrl,
      mediaLinks: mediaUrls.join('\n')
    }));
  };

  const handleGoogleMapsLink = (link: string) => {
    const coordsMatch = link.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (coordsMatch) {
      const lat = parseFloat(coordsMatch[1]);
      const lng = parseFloat(coordsMatch[2]);
      setFormData(prev => ({
        ...prev,
        location: link,
        locationCoords: { lat, lng }
      }));
    } else {
      setFormData(prev => ({ ...prev, location: link }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-real-estate-light py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-real-estate-primary mx-auto"></div>
            <p className="mt-4 text-real-estate-neutral/70">Loading listing...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-real-estate-light py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-4"
            onClick={() => navigate('/my-listings')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Listings
          </Button>
          
          <h1 className="text-4xl md:text-5xl font-bold text-real-estate-neutral mb-4">
            Edit Property Listing
          </h1>
          <p className="text-lg md:text-xl text-real-estate-neutral/70">Update your property details</p>
        </div>

        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-real-estate-neutral text-2xl">
              <Home className="w-6 h-6" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title and Price */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-lg">Property Title *</Label>
                  <Input
                    id="title"
                    placeholder="Beautiful 2BR Apartment"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="h-14 text-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center gap-1 text-lg">
                    <DollarSign className="w-5 h-5" />
                    Price *
                  </Label>
                  <Input
                    id="price"
                    placeholder="$2,500/month"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    className="h-14 text-lg"
                    required
                  />
                </div>
              </div>

              {/* Property Features */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    Bedrooms
                  </Label>
                  <Select value={formData.bedrooms} onValueChange={(value) => handleInputChange("bedrooms", value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5+">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    Bathrooms
                  </Label>
                  <Select value={formData.bathrooms} onValueChange={(value) => handleInputChange("bathrooms", value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="1.5">1.5</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="2.5">2.5</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="3+">3+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Square className="w-4 h-4" />
                    Size (sq ft)
                  </Label>
                  <Input
                    placeholder="1,200"
                    value={formData.size}
                    onChange={(e) => handleInputChange("size", e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              {/* Location Options */}
              <div className="space-y-4">
                <Label className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Property Location *
                </Label>
                <Tabs defaultValue="maps-link" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="maps-link">Google Maps Link</TabsTrigger>
                    <TabsTrigger value="api-autofill">Autofill Address</TabsTrigger>
                  </TabsList>
                  <TabsContent value="maps-link" className="space-y-2">
                    <Input
                      placeholder="Paste Google Maps location link here"
                      value={formData.location}
                      onChange={(e) => handleGoogleMapsLink(e.target.value)}
                      className="h-12"
                    />
                    <p className="text-sm text-real-estate-neutral/70">
                      Share a Google Maps link from your phone - just paste it here
                    </p>
                  </TabsContent>
                  <TabsContent value="api-autofill" className="space-y-2">
                    <MapLocationPicker 
                      onLocationChange={handleLocationChange}
                      initialLocation={formData.location}
                    />
                    <p className="text-sm text-real-estate-neutral/70">
                      Uses Google API for precise address search and pin placement
                    </p>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your property... (amenities, features, nearby attractions)"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="min-h-24"
                />
              </div>

              {/* Photo Upload */}
              <ImagePicker
                onImagesChange={handleImagesChange}
                initialCoverUrl={formData.coverImageUrl}
                initialMediaUrls={formData.mediaLinks.split('\n').filter(url => url.trim())}
                listingId={id}
                userId={user?.id}
              />

              {/* YouTube Video */}
              <div className="space-y-2">
                <Label htmlFor="youtubeUrl">Video (optional): Paste a YouTube link</Label>
                <Input
                  id="youtubeUrl"
                  placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                  value={formData.youtubeUrl}
                  onChange={(e) => handleInputChange("youtubeUrl", e.target.value)}
                  className="h-12"
                />
                <p className="text-sm text-real-estate-neutral/70">
                  Supports YouTube watch, shorts, and youtu.be links
                </p>
              </div>


              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-hero text-white font-semibold shadow-hero"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating Listing..." : "Update Listing"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditListing;