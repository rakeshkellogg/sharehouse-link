
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, IndianRupee, Home, Bath, Bed, Ruler, Link, Copy, Share2, ExternalLink, Clipboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MapLocationPicker from "./MapLocationPicker";
import { ImagePicker } from "./ImagePicker";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// India-specific pricing types and helpers
type PriceUnit = "thousand" | "lakh" | "crore";

const PRICE_FACTOR: Record<PriceUnit, number> = {
  thousand: 1_000,
  lakh: 100_000,
  crore: 10_000_000,
};

const computePriceRupees = (amount: number, unit: PriceUnit) =>
  Math.round((Number.isFinite(amount) ? amount : 0) * PRICE_FACTOR[unit]);

const formatIN = (n: number) => (Number.isFinite(n) ? n.toLocaleString("en-IN") : "");
const humanShort = (rupees: number) =>
  rupees >= 10_000_000 ? `₹${(rupees / 10_000_000).toFixed(1)} crore`
  : rupees >= 100_000 ? `₹${(rupees / 100_000).toFixed(2)} lakh`
  : rupees >= 1_000   ? `₹${Math.round(rupees / 1_000)} thousand`
  : `₹${rupees}`;

// India-specific size/area types and helpers
type SizeUnit =
  | "sq_ft" | "sq_yd" | "sq_m"
  | "acre" | "hectare" | "cent" | "guntha"
  | "marla" | "kanal" | "ground"
  | "cottah_wb" | "bigha_wb" | "bigha_up";

const UNIT_TO_SQFT: Record<SizeUnit, number> = {
  sq_ft: 1,
  sq_yd: 9,
  sq_m: 10.7639,
  acre: 43560,
  hectare: 107639.104,
  cent: 435.6,
  guntha: 1089,
  marla: 272.25,         // note: varies by region
  kanal: 5445,           // 20 marla
  ground: 2400,          // Chennai
  cottah_wb: 720,        // West Bengal
  bigha_wb: 14400,       // WB/Assam
  bigha_up: 27000,       // UP/Uttarakhand (common convention)
};

const UNIT_LABEL: Record<SizeUnit, string> = {
  sq_ft: "sq ft",
  sq_yd: "sq yd (gaj)",
  sq_m: "sq m",
  acre: "acre",
  hectare: "hectare",
  cent: "cent",
  guntha: "guntha",
  marla: "marla",
  kanal: "kanal",
  ground: "ground",
  cottah_wb: "cottah (WB)",
  bigha_wb: "bigha (WB/Assam)",
  bigha_up: "bigha (UP/UK)",
};

const toSqft = (amount: number, unit: SizeUnit) =>
  Math.round((Number.isFinite(amount) ? amount : 0) * UNIT_TO_SQFT[unit]);

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
    priceAmount: "",
    priceUnit: "lakh" as PriceUnit,
    sizeAmount: "",
    sizeUnit: "sq_ft" as SizeUnit,
    description: "",
    bedrooms: "",
    bathrooms: "",
    size: "",
    location: "",
    locationCoords: { lat: 0, lng: 0 },
    sub_area: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    mediaLinks: "",
    youtubeUrl: "",
    coverImageUrl: "",
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

    if (!formData.title || !formData.priceAmount) {
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

      // Calculate price in rupees using the new system
      const priceAmount = Number(formData.priceAmount);
      if (isNaN(priceAmount) || priceAmount <= 0) {
        throw new Error("Please enter a valid price");
      }
      const priceValue = computePriceRupees(priceAmount, formData.priceUnit);

      // Calculate size in sq ft if provided
      const sizeAmount = Number(formData.sizeAmount);
      const sizeSqft = (sizeAmount && sizeAmount > 0) ? toSqft(sizeAmount, formData.sizeUnit) : null;
      const sizeDisplay = sizeSqft ? `${formatIN(sizeSqft)} sq ft` : null;

      // Generate sub_area_slug for searching
      const subAreaSlug = formData.sub_area 
        ? formData.sub_area.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        : null;

      // First create the listing without images to get an ID
      const initialListingData = {
        user_id: user.id,
        title: formData.title,
        price: priceValue,
        bedrooms: formData.bedrooms || null,
        bathrooms: formData.bathrooms || null,
        size: sizeDisplay,
        description: formData.description || null,
        location_address: formData.location || null,
        latitude: formData.locationCoords.lat || null,
        longitude: formData.locationCoords.lng || null,
        sub_area: formData.sub_area || null,
        sub_area_slug: subAreaSlug,
        city: formData.city || null,
        district: formData.district || null,
        state: formData.state || null,
        pincode: formData.pincode || null,
        google_maps_link: formData.location.startsWith('http') ? formData.location : null,
        media_links: mediaLinksArray,
        youtube_url: formData.youtubeUrl || null,
        cover_image_url: null, // Will be updated after image upload
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

  const handleLocationChange = (locationData: {
    lat: number;
    lng: number;
    address: string;
    sub_area?: string;
    city?: string;
    district?: string;
    state?: string;
    pincode?: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      location: locationData.address,
      locationCoords: { lat: locationData.lat, lng: locationData.lng },
      sub_area: locationData.sub_area || "",
      city: locationData.city || "",
      district: locationData.district || "",
      state: locationData.state || "",
      pincode: locationData.pincode || ""
    }));
  };

  const handleImagesChange = async (coverUrl: string, mediaUrls: string[]) => {
    setFormData(prev => ({
      ...prev,
      coverImageUrl: coverUrl
      // Don't update mediaLinks - keep it for user's additional links only
    }));

    // If we have a listing ID (after form submission), update the listing with image URLs
    if (shareDialog.listingId && (coverUrl || mediaUrls.length > 0)) {
      try {
        // Combine photo URLs with user's additional media links
        const userMediaLinks = formData.mediaLinks
          .split('\n')
          .map(link => link.trim())
          .filter(link => link.length > 0 && !mediaUrls.includes(link));
        const combinedMediaLinks = [...mediaUrls, ...userMediaLinks];

        const { error } = await supabase
          .from('listings')
          .update({
            cover_image_url: coverUrl || null,
            media_links: combinedMediaLinks
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
    <div className="min-h-screen bg-real-estate-light py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex justify-between items-start mb-6 md:mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-real-estate-neutral mb-4">
              Create Your Property Listing
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-real-estate-neutral/70">Fill out the details below to create a shareable listing</p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="h-10 px-4 ml-4"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>

        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-real-estate-neutral text-xl md:text-2xl">
              <Home className="w-5 h-5 md:w-6 md:h-6" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Property Type and Transaction Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyType" className="text-base md:text-sm">Property Type *</Label>
                  <Select onValueChange={(value) => handleInputChange("propertyType", value)} defaultValue="house">
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transactionType" className="text-base md:text-sm">Transaction Type *</Label>
                  <Select onValueChange={(value) => handleInputChange("transactionType", value)} defaultValue="sale">
                    <SelectTrigger className="h-12 text-base">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base md:text-sm">Property Title *</Label>
                  <Input
                    id="title"
                    placeholder="Beautiful 2BR Apartment"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="h-12 text-base"
                    required
                  />
                </div>
                <div className="space-y-4">
                  <Label className="flex items-center gap-1 text-base md:text-sm">
                    <IndianRupee className="w-4 h-4" />
                    Price *
                  </Label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Amount</Label>
                      <Input
                        inputMode="decimal"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="1.2"
                        value={formData.priceAmount}
                        onChange={(e) => handleInputChange("priceAmount", e.target.value)}
                        className="h-12 text-base"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Unit</Label>
                      <Select 
                        value={formData.priceUnit} 
                        onValueChange={(value: PriceUnit) => handleInputChange("priceUnit", value)}
                      >
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="thousand">Thousand</SelectItem>
                          <SelectItem value="lakh">Lakh</SelectItem>
                          <SelectItem value="crore">Crore</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.priceAmount && Number(formData.priceAmount) > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 font-medium">
                      Preview: ₹{formatIN(computePriceRupees(Number(formData.priceAmount), formData.priceUnit))} ({humanShort(computePriceRupees(Number(formData.priceAmount), formData.priceUnit))}){formData.transactionType === "rent" ? " /month" : ""}
                    </div>
                  )}
                </div>
              </div>

              {/* Property Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1 text-base md:text-sm">
                    <Bed className="w-4 h-4" />
                    Bedrooms
                  </Label>
                  <Select onValueChange={(value) => handleInputChange("bedrooms", value)}>
                    <SelectTrigger className="h-12 text-base">
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
                  <Label className="flex items-center gap-1 text-base md:text-sm">
                    <Bath className="w-4 h-4" />
                    Bathrooms
                  </Label>
                  <Select onValueChange={(value) => handleInputChange("bathrooms", value)}>
                    <SelectTrigger className="h-12 text-base">
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
                <div className="space-y-4">
                  <Label className="flex items-center gap-1 text-base md:text-sm">
                    <Ruler className="w-4 h-4" />
                    Area / Size
                  </Label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Amount</Label>
                      <Input
                        inputMode="decimal"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g. 2.5"
                        value={formData.sizeAmount}
                        onChange={(e) => handleInputChange("sizeAmount", e.target.value)}
                        className="h-12 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Unit</Label>
                      <Select 
                        value={formData.sizeUnit} 
                        onValueChange={(value: SizeUnit) => handleInputChange("sizeUnit", value)}
                      >
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Core units */}
                          <SelectItem value="sq_ft">{UNIT_LABEL.sq_ft}</SelectItem>
                          <SelectItem value="sq_yd">{UNIT_LABEL.sq_yd}</SelectItem>
                          <SelectItem value="sq_m">{UNIT_LABEL.sq_m}</SelectItem>
                          <SelectItem value="acre">{UNIT_LABEL.acre}</SelectItem>
                          <SelectItem value="hectare">{UNIT_LABEL.hectare}</SelectItem>
                          {/* India-local units */}
                          <SelectItem value="cent">{UNIT_LABEL.cent}</SelectItem>
                          <SelectItem value="guntha">{UNIT_LABEL.guntha}</SelectItem>
                          <SelectItem value="marla">{UNIT_LABEL.marla}</SelectItem>
                          <SelectItem value="kanal">{UNIT_LABEL.kanal}</SelectItem>
                          <SelectItem value="ground">{UNIT_LABEL.ground}</SelectItem>
                          <SelectItem value="cottah_wb">{UNIT_LABEL.cottah_wb}</SelectItem>
                          <SelectItem value="bigha_wb">{UNIT_LABEL.bigha_wb}</SelectItem>
                          <SelectItem value="bigha_up">{UNIT_LABEL.bigha_up}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.sizeAmount && Number(formData.sizeAmount) > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 font-medium">
                      Preview: {formData.sizeAmount} {UNIT_LABEL[formData.sizeUnit]} ({formatIN(toSqft(Number(formData.sizeAmount), formData.sizeUnit))} sq ft)
                    </div>
                  )}
                </div>
              </div>

              {/* Location Options */}
              <div className="space-y-4">
                <Label className="flex items-center gap-1 text-base md:text-sm">
                  <MapPin className="w-4 h-4" />
                  Property Location *
                </Label>
                <Tabs defaultValue="maps-link" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="maps-link" className="text-sm md:text-base">Google Maps Link</TabsTrigger>
                    <TabsTrigger value="api-autofill" className="text-sm md:text-base">Autofill Address</TabsTrigger>
                  </TabsList>
                  <TabsContent value="maps-link" className="space-y-2">
                    <Input
                      placeholder="Paste Google Maps location link here"
                      value={formData.location}
                      onChange={(e) => handleGoogleMapsLink(e.target.value)}
                      className="h-12 text-base"
                    />
                    <p className="text-sm md:text-xs text-real-estate-neutral/70">
                      Share a Google Maps link from your phone - just paste it here
                    </p>
                  </TabsContent>
                  <TabsContent value="api-autofill" className="space-y-2">
                    <MapLocationPicker 
                      onLocationChange={handleLocationChange}
                      initialLocation={formData.location}
                    />
                    <p className="text-sm md:text-xs text-real-estate-neutral/70">
                      Uses Google API for precise address search and pin placement
                    </p>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base md:text-sm">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your property... (amenities, features, nearby attractions)"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="min-h-24 text-base"
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
                <Label htmlFor="youtubeUrl" className="text-base md:text-sm">Video (optional): Paste a YouTube link</Label>
                
                {/* Helper message when returning from YouTube */}
                {showYouTubeHelper && !formData.youtubeUrl && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 md:mb-2">
                    <p className="text-blue-800 font-medium text-sm">✨ Ready to add your YouTube video?</p>
                    <p className="text-blue-700 text-xs">Copy your new video URL and click "Paste URL" below, or paste it manually.</p>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    id="youtubeUrl"
                    placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                    value={formData.youtubeUrl}
                    onChange={(e) => {
                      handleInputChange("youtubeUrl", e.target.value);
                      if (e.target.value) setShowYouTubeHelper(false);
                    }}
                    className="h-12 flex-1 text-base"
                  />
                  
                  {showYouTubeHelper && !formData.youtubeUrl ? (
                    <Button
                      type="button"
                      variant="default"
                      onClick={handlePasteFromClipboard}
                      className="h-12 px-4 text-base"
                    >
                      <Clipboard className="w-4 h-4 mr-1" />
                      Paste URL
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCreateVideo}
                      className="h-12 px-4 text-base"
                    >
                      Create Video
                    </Button>
                  )}
                </div>
                <p className="text-sm md:text-xs text-real-estate-neutral/70">
                  Supports YouTube watch, shorts, and youtu.be links. Click "Create Video" to make a new YouTube video.
                </p>
              </div>

              {/* Additional Media Links */}
              <div className="space-y-2">
                <Label htmlFor="mediaLinks" className="flex items-center gap-1 text-base md:text-sm">
                  <Link className="w-4 h-4" />
                  Additional Media Links
                </Label>
                <Textarea
                  id="mediaLinks"
                  placeholder="Paste additional photo/video links (Instagram, Google Drive, etc.) - one per line"
                  value={formData.mediaLinks}
                  onChange={(e) => handleInputChange("mediaLinks", e.target.value)}
                  className="min-h-20 text-base"
                />
              </div>

               {/* Submit Button */}
               {!shareDialog.listingId ? (
                 <Button 
                   type="submit" 
                   className="w-full h-12 bg-gradient-hero text-white font-semibold shadow-hero text-base"
                   disabled={isSubmitting}
                 >
                   {isSubmitting ? "Creating Listing..." : "Create Listing & Get Share Link"}
                 </Button>
               ) : (
                 <div className="space-y-3">
                   <Button 
                     type="button"
                     onClick={() => window.open(shareDialog.shareUrl, '_blank')}
                     className="w-full h-12 bg-gradient-hero text-white font-semibold shadow-hero text-base"
                   >
                     <ExternalLink className="w-4 h-4 mr-2" />
                     View Your Listing
                   </Button>
                   <Button 
                     type="button"
                     onClick={() => copyToClipboard(shareDialog.shareUrl)}
                     variant="outline"
                     className="w-full h-12 text-base"
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
              <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
                <Home className="w-5 h-5 md:w-6 md:h-6" />
                Listing Created Successfully!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm md:text-xs text-muted-foreground">
                Your listing is now live! Share this link with potential renters:
              </p>
              
              <div className="flex items-center space-x-2">
                <Input
                  value={shareDialog.shareUrl}
                  readOnly
                  className="flex-1 text-base"
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
                  className="flex-1 text-base"
                  variant="outline"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  onClick={() => window.open(shareDialog.shareUrl, '_blank')}
                  className="flex-1 text-base"
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
