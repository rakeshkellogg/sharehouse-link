
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, DollarSign, Home, Bath, Bed, Square, Link, Copy, Share2, ExternalLink, Clipboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MapLocationPicker from "./MapLocationPicker";
import { ImagePicker } from "./ImagePicker";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const CreateListingForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareDialog, setShareDialog] = useState<{ open: boolean; listingId: string; shareUrl: string }>({
    open: false,
    listingId: "",
    shareUrl: ""
  });
  const [showYouTubeHelper, setShowYouTubeHelper] = useState(false);
  
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
    coverImageUrl: "",
    ownerName: "",
    propertyType: "house",
    transactionType: "sale"
  });

  // Check if user is returning from YouTube video creation
  useEffect(() => {
    const checkYouTubeReturn = () => {
      const wasCreatingVideo = localStorage.getItem('creating-youtube-video');
      if (wasCreatingVideo) {
        setShowYouTubeHelper(true);
        localStorage.removeItem('creating-youtube-video');
      }
    };

    checkYouTubeReturn();
    
    // Check when window regains focus (user returns from YouTube)
    const handleFocus = () => {
      setTimeout(checkYouTubeReturn, 500); // Small delay to ensure localStorage is updated
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a listing.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title || !formData.price || !formData.ownerName) {
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

      // Parse price to integer (remove any non-numeric characters except for digits)
      const priceValue = parseInt(formData.price.replace(/[^\d]/g, ''));
      if (isNaN(priceValue)) {
        throw new Error("Please enter a valid price");
      }

      // First create the listing without images to get an ID
      const initialListingData = {
        user_id: user.id,
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
        cover_image_url: null, // Will be updated after image upload
        owner_name: formData.ownerName,
        owner_phone: null,
        owner_whatsapp: null,
        property_type: formData.propertyType,
        transaction_type: formData.transactionType,
        is_public: true
      };

      const { data, error } = await supabase
        .from('listings')
        .insert([initialListingData])
        .select('id')
        .single();

      if (error) throw error;

      const shareUrl = `${window.location.origin}/listing/${data.id}`;
      
      setShareDialog({
        open: true,
        listingId: data.id,
        shareUrl
      });

      // Don't reset form immediately - let user upload photos first
      toast({
        title: "Listing created!",
        description: "You can now upload photos for your listing below.",
      });

    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error Creating Listing",
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

  const handleImagesChange = async (coverUrl: string, mediaUrls: string[]) => {
    setFormData(prev => ({
      ...prev,
      coverImageUrl: coverUrl,
      mediaLinks: mediaUrls.join('\n')
    }));

    // If we have a listing ID (after form submission), update the listing with image URLs
    if (shareDialog.listingId && (coverUrl || mediaUrls.length > 0)) {
      try {
        const { error } = await supabase
          .from('listings')
          .update({
            cover_image_url: coverUrl || null,
            media_links: [...mediaUrls, ...formData.mediaLinks.split('\n').filter(link => link.trim() && !mediaUrls.includes(link))]
          })
          .eq('id', shareDialog.listingId);

        if (error) {
          console.error('Error updating listing with images:', error);
          toast({
            title: "Image update failed",
            description: "Photos uploaded but couldn't update the listing. Please try refreshing.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Photos updated!",
            description: "Your property photos have been added to the listing."
          });
        }
      } catch (error) {
        console.error('Error updating listing:', error);
      }
    }
  };

  const handleGoogleMapsLink = (link: string) => {
    // Extract coordinates and address from Google Maps link if possible
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
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

  const handleShare = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: formData.title,
          text: `Check out this property listing: ${formData.title}`,
          url
        });
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          copyToClipboard(url);
        }
      }
    } else {
      copyToClipboard(url);
    }
  };

  const handleCreateVideo = () => {
    localStorage.setItem('creating-youtube-video', 'true');
    window.open('https://www.youtube.com/upload', '_blank');
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && (text.includes('youtube.com') || text.includes('youtu.be'))) {
        handleInputChange("youtubeUrl", text);
        setShowYouTubeHelper(false);
        toast({
          title: "YouTube URL Added!",
          description: "Video link pasted successfully",
        });
      } else {
        toast({
          title: "No YouTube URL Found",
          description: "Please copy a YouTube video URL first",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Clipboard Access Failed",
        description: "Please paste the YouTube URL manually",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-real-estate-light py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-real-estate-neutral mb-4">
            Create Your Property Listing
          </h1>
          <p className="text-lg md:text-xl text-real-estate-neutral/70">Fill out the details below to create a shareable listing</p>
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
              {/* Property Type and Transaction Type */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type *</Label>
                  <Select onValueChange={(value) => handleInputChange("propertyType", value)} defaultValue="house">
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transactionType">Transaction Type *</Label>
                  <Select onValueChange={(value) => handleInputChange("transactionType", value)} defaultValue="sale">
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">For Sale</SelectItem>
                      <SelectItem value="rent">For Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Title and Price */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Property Title *</Label>
                  <Input
                    id="title"
                    placeholder="Beautiful 2BR Apartment"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="h-12"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Price *
                  </Label>
                  <Input
                    id="price"
                    placeholder="$2,500/month"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    className="h-12"
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
                  <Select onValueChange={(value) => handleInputChange("bedrooms", value)}>
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
                  <Select onValueChange={(value) => handleInputChange("bathrooms", value)}>
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

               {/* Photo Upload - Show message if listing is created */}
               {shareDialog.listingId && (
                 <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                   <p className="text-green-800 font-medium">✅ Listing created successfully!</p>
                   <p className="text-green-700 text-sm">You can now upload photos for your property below:</p>
                 </div>
               )}
               <ImagePicker
                 onImagesChange={handleImagesChange}
                 listingId={shareDialog.listingId || undefined}
                 userId={user?.id}
               />

              {/* YouTube Video */}
              <div className="space-y-2">
                <Label htmlFor="youtubeUrl">Video (optional): Paste a YouTube link</Label>
                
                {/* Helper message when returning from YouTube */}
                {showYouTubeHelper && !formData.youtubeUrl && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                    <p className="text-blue-800 font-medium text-sm">✨ Ready to add your YouTube video?</p>
                    <p className="text-blue-700 text-xs">Copy your new video URL and click "Paste URL" below, or paste it manually.</p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Input
                    id="youtubeUrl"
                    placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                    value={formData.youtubeUrl}
                    onChange={(e) => {
                      handleInputChange("youtubeUrl", e.target.value);
                      if (e.target.value) setShowYouTubeHelper(false);
                    }}
                    className="h-12 flex-1"
                  />
                  
                  {showYouTubeHelper && !formData.youtubeUrl ? (
                    <Button
                      type="button"
                      variant="default"
                      onClick={handlePasteFromClipboard}
                      className="h-12 px-4"
                    >
                      <Clipboard className="w-4 h-4 mr-1" />
                      Paste URL
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCreateVideo}
                      className="h-12 px-4"
                    >
                      Create Video
                    </Button>
                  )}
                </div>
                <p className="text-sm text-real-estate-neutral/70">
                  Supports YouTube watch, shorts, and youtu.be links. Click "Create Video" to make a new YouTube video.
                </p>
              </div>

              {/* Additional Media Links */}
              <div className="space-y-2">
                <Label htmlFor="mediaLinks" className="flex items-center gap-1">
                  <Link className="w-4 h-4" />
                  Additional Media Links
                </Label>
                <Textarea
                  id="mediaLinks"
                  placeholder="Paste additional photo/video links (Instagram, Google Drive, etc.) - one per line"
                  value={formData.mediaLinks}
                  onChange={(e) => handleInputChange("mediaLinks", e.target.value)}
                  className="min-h-20"
                />
              </div>

              {/* Contact Information */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-real-estate-neutral mb-4">Contact Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Your Name *</Label>
                  <Input
                    id="ownerName"
                    placeholder="John Doe"
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange("ownerName", e.target.value)}
                    className="h-12"
                    required
                  />
                  <p className="text-sm text-real-estate-neutral/70">
                    Visitors will contact you through the built-in messaging system for privacy.
                  </p>
                </div>
              </div>

               {/* Submit Button */}
               {!shareDialog.listingId ? (
                 <Button 
                   type="submit" 
                   className="w-full h-12 bg-gradient-hero text-white font-semibold shadow-hero"
                   disabled={isSubmitting}
                 >
                   {isSubmitting ? "Creating Listing..." : "Create Listing & Get Share Link"}
                 </Button>
               ) : (
                 <div className="space-y-3">
                   <Button 
                     type="button"
                     onClick={() => window.open(shareDialog.shareUrl, '_blank')}
                     className="w-full h-12 bg-gradient-hero text-white font-semibold shadow-hero"
                   >
                     <ExternalLink className="w-4 h-4 mr-2" />
                     View Your Listing
                   </Button>
                   <Button 
                     type="button"
                     onClick={() => copyToClipboard(shareDialog.shareUrl)}
                     variant="outline"
                     className="w-full h-12"
                   >
                     <Copy className="w-4 h-4 mr-2" />
                     Copy Share Link
                   </Button>
                 </div>
               )}
            </form>
          </CardContent>
        </Card>

        {/* Share Dialog */}
        <Dialog open={shareDialog.open} onOpenChange={(open) => setShareDialog(prev => ({ ...prev, open }))}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Listing Created Successfully!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your listing is now live! Share this link with potential renters:
              </p>
              
              <div className="flex items-center space-x-2">
                <Input
                  value={shareDialog.shareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(shareDialog.shareUrl)}
                  variant="outline"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleShare(shareDialog.shareUrl)}
                  className="flex-1"
                  variant="outline"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  onClick={() => window.open(shareDialog.shareUrl, '_blank')}
                  className="flex-1"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Listing
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CreateListingForm;
