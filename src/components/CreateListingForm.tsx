import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Home, Bath, Bed, Square, Link, Copy, Share2, ExternalLink, Clipboard, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImagePicker } from "./ImagePicker";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  PriceUnit,
  SizeScale,
  calculatePriceRupees,
  calculateSizeValue,
  formatIndianPrice,
  formatINR,
  validatePincode,
  indianStates
} from "@/lib/indiaHelpers";

const FIXED_SIZE_UNIT = 'sq_ft' as const;

// Standardize state names coming from APIs to match the dropdown.
const canonicalizeState = (raw: string) => {
  const s = (raw || "").trim()
    .replace(/^NCT of Delhi$/i, "Delhi")
    .replace(/^Orissa$/i, "Odisha")
    .replace(/^Uttaranchal$/i, "Uttarakhand");
  // If still not in list, return raw (user can pick from dropdown)
  return indianStates.includes(s) ? s : s;
};

// --- PATCH: pincode lookup (India Postal API with optional Google fallback)
async function lookupPincode(pincode: string): Promise<{ city: string; state: string; lat?: number; lng?: number } | null> {
  try {
    // 1) India Postal API (no key). CORS-friendly.
    const r = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const j = await r.json();
    const po = j?.[0]?.PostOffice?.[0];
    if (po) {
      // Use District as "city" proxy, State as state
      const city = po.District || po.Block || po.Division || "";
      const state = canonicalizeState(po.State || "");
      return { city, state }; // lat/lng not provided here
    }
  } catch { /* fallthrough */ }

  // 2) Optional Google fallback (if key present in env and proxied server-side)
  // If you wire a backend proxy /api/pincode/resolve, call that here instead.

  return null;
}

const CreateListingForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareDialog, setShareDialog] = useState<{ open: boolean; listingId: string; shareUrl: string }>({
    open: false, listingId: "", shareUrl: ""
  });
  const [showYouTubeHelper, setShowYouTubeHelper] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    bedrooms: "",
    bathrooms: "",
    // Location
    pincode: "",
    city: "",
    state: "",
    locationCoords: { lat: 0, lng: 0 },
    // Price (PATCH: no 'rupees' unit)
    priceAmount: "",
    priceUnit: "lakh" as PriceUnit,
    // Size (PATCH: no Unit dropdown, fixed to sq ft)
    sizeAmount: "",
    sizeScale: "units" as SizeScale,
    // Media & misc
    mediaLinks: "",
    youtubeUrl: "",
    coverImageUrl: "",
    ownerName: "",
    propertyType: "house",
    transactionType: "sale",
    // Legacy compatibility (kept)
    price: "",
    size: "",
    location: ""
  });

  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pricePreview, setPricePreview] = useState("");
  const [sizePreview, setSizePreview] = useState("");

  // Price preview
  useEffect(() => {
    if (formData.priceAmount && !isNaN(Number(formData.priceAmount))) {
      const amount = Number(formData.priceAmount);
      const priceRupees = calculatePriceRupees(amount, formData.priceUnit);
      setPricePreview(formatIndianPrice(priceRupees));
    } else setPricePreview("");
  }, [formData.priceAmount, formData.priceUnit]);

  // Size preview (fixed sq ft)
  useEffect(() => {
    if (formData.sizeAmount && !isNaN(Number(formData.sizeAmount))) {
      const amount = Number(formData.sizeAmount);
      const v = calculateSizeValue(amount, formData.sizeScale);
      setSizePreview(`${formatINR(v)} sq ft`);
    } else setSizePreview("");
  }, [formData.sizeAmount, formData.sizeScale]);

  // Pincode change + auto-fill City/State
  const handlePincodeChange = async (pin: string) => {
    const pincode = pin.replace(/[^0-9]/g, "").slice(0, 6);
    setFormData(prev => ({ ...prev, pincode }));

    if (!validatePincode(pincode)) return;

    setPincodeLoading(true);
    try {
      const info = await lookupPincode(pincode);
      if (info) {
        setFormData(prev => ({
          ...prev,
          city: info.city || prev.city,
          state: canonicalizeState(info.state || prev.state)
        }));
        toast({ title: "Location found", description: `${info.city}, ${info.state}` });
      } else {
        toast({ title: "Couldn't auto-fill", description: "Please select City/State manually.", variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Lookup failed", description: "Please enter City/State manually.", variant: "destructive" });
    } finally {
      setPincodeLoading(false);
    }
  };

  // YouTube helper (unchanged)
  useEffect(() => {
    const checkYouTubeReturn = () => {
      const wasCreatingVideo = localStorage.getItem('creating-youtube-video');
      if (wasCreatingVideo) {
        setShowYouTubeHelper(true);
        localStorage.removeItem('creating-youtube-video');
      }
    };
    checkYouTubeReturn();
    const handleFocus = () => setTimeout(checkYouTubeReturn, 500);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: "Authentication Required", description: "Please sign in to create a listing.", variant: "destructive" });
      return;
    }

    if (!formData.title || !formData.priceAmount || !formData.pincode || !formData.city || !formData.state || !formData.ownerName) {
      toast({ title: "Missing Information", description: "Please fill in title, price, location and your name.", variant: "destructive" });
      return;
    }

    if (!validatePincode(formData.pincode)) {
      toast({ title: "Invalid Pincode", description: "Please enter a valid 6-digit Indian pincode.", variant: "destructive" });
      return;
    }

    const priceAmount = Number(formData.priceAmount);
    if (isNaN(priceAmount) || priceAmount <= 0) {
      toast({ title: "Invalid Price", description: "Please enter a valid price amount.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const mediaLinksArray = formData.mediaLinks
        .split('\n').map(s => s.trim()).filter(Boolean);

      const price_rupees = calculatePriceRupees(priceAmount, formData.priceUnit);

      // Size (optional)
      const size_value_canonical = formData.sizeAmount
        ? calculateSizeValue(Number(formData.sizeAmount), formData.sizeScale)
        : null;

      const payload = {
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        bedrooms: formData.bedrooms || null,
        bathrooms: formData.bathrooms || null,
        // Location
        pincode: formData.pincode,
        city: formData.city,
        state: formData.state,
        latitude: formData.locationCoords.lat || null,
        longitude: formData.locationCoords.lng || null,
        // Price
        price_rupees,
        price_amount_raw: priceAmount,
        price_unit: formData.priceUnit,
        // Size (PATCH: fixed unit)
        size_amount_raw: formData.sizeAmount ? Number(formData.sizeAmount) : null,
        size_scale: formData.sizeAmount ? formData.sizeScale : null,
        size_unit: formData.sizeAmount ? FIXED_SIZE_UNIT : null,
        size_value_canonical: size_value_canonical,
        // Legacy
        price: price_rupees,
        size: size_value_canonical ? `${formatINR(size_value_canonical)} sq ft` : null,
        location_address: `${formData.city}, ${formData.state} - ${formData.pincode}`,
        // Media
        media_links: mediaLinksArray,
        youtube_url: formData.youtubeUrl || null,
        cover_image_url: null,
        owner_name: formData.ownerName,
        owner_phone: null,
        owner_whatsapp: null,
        property_type: formData.propertyType,
        transaction_type: formData.transactionType,
        is_public: true
      };

      const { data, error } = await supabase.from('listings').insert([payload]).select('id').single();
      if (error) throw error;

      const shareUrl = `${window.location.origin}/listing/${data.id}`;
      setShareDialog({ open: true, listingId: data.id, shareUrl });

      toast({ title: "Listing created!", description: "You can now upload photos below." });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error Creating Listing", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: "Share link copied to clipboard" });
    } catch {
      toast({ title: "Copy Failed", description: "Please copy the link manually", variant: "destructive" });
    }
  };

  const handleShare = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: formData.title, text: `Check out this property: ${formData.title}`, url });
      } catch (e: any) {
        if (e?.name !== 'AbortError') copyToClipboard(url);
      }
    } else copyToClipboard(url);
  };

  // UI
  return (
    <div className="min-h-screen bg-real-estate-light py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-real-estate-neutral mb-4">
            Create Your Property Listing
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-real-estate-neutral/70">
            Fill out the details below to create a shareable listing
          </p>
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
              {/* Types */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Property Type *</Label>
                  <Select value={formData.propertyType} onValueChange={(v) => handleInputChange("propertyType", v)}>
                    <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Select property type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Transaction Type *</Label>
                  <Select value={formData.transactionType} onValueChange={(v) => handleInputChange("transactionType", v)}>
                    <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Select transaction type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">For Sale</SelectItem>
                      <SelectItem value="rent">For Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label>Property Title *</Label>
                <Input
                  placeholder="Beautiful 2BR Apartment"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="h-12 text-base"
                  required
                />
              </div>

              {/* Price (PATCH: no rupees unit) */}
              <div className="space-y-4">
                <Label className="flex items-center gap-1"><IndianRupee className="w-4 h-4" /> Price *</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Amount</Label>
                    <Input
                      type="number" inputMode="decimal" step="0.01" min="0" placeholder="1.2"
                      value={formData.priceAmount}
                      onChange={(e) => handleInputChange("priceAmount", e.target.value)}
                      className="h-12 text-base" required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Unit</Label>
                    <Select value={formData.priceUnit} onValueChange={(v: PriceUnit) => handleInputChange("priceUnit", v)}>
                      <SelectTrigger className="h-12 text-base"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="thousand">Thousand</SelectItem>
                        <SelectItem value="lakh">Lakh</SelectItem>
                        <SelectItem value="crore">Crore</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {pricePreview && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 font-medium text-sm">
                      Preview: {pricePreview}{formData.transactionType === 'rent' ? '/month' : ''}
                    </p>
                  </div>
                )}
              </div>

              {/* Bedrooms / Bathrooms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Bed className="w-4 h-4" /> Bedrooms</Label>
                  <Select value={formData.bedrooms} onValueChange={(v) => handleInputChange("bedrooms", v)}>
                    <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Select" /></SelectTrigger>
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
                  <Label className="flex items-center gap-1"><Bath className="w-4 h-4" /> Bathrooms</Label>
                  <Select value={formData.bathrooms} onValueChange={(v) => handleInputChange("bathrooms", v)}>
                    <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Select" /></SelectTrigger>
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
              </div>

              {/* Size (PATCH: no Unit dropdown; fixed to sq ft) */}
              <div className="space-y-4">
                <Label className="flex items-center gap-1"><Square className="w-4 h-4" /> Area / Size</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Amount</Label>
                    <Input
                      type="number" inputMode="decimal" step="0.01" min="0" placeholder="1000"
                      value={formData.sizeAmount}
                      onChange={(e) => handleInputChange("sizeAmount", e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Scale</Label>
                    <Select value={formData.sizeScale} onValueChange={(v: SizeScale) => handleInputChange("sizeScale", v)}>
                      <SelectTrigger className="h-12 text-base"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="units">Units</SelectItem>
                        <SelectItem value="thousand">Thousand</SelectItem>
                        <SelectItem value="lakh">Lakh</SelectItem>
                        <SelectItem value="crore">Crore</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {sizePreview && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-800 font-medium text-sm">Preview: {sizePreview}</p>
                  </div>
                )}
              </div>

              {/* Location (Pincode first) */}
              <div className="space-y-4">
                <Label className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Property Location *</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Pincode *</Label>
                    <Input
                      inputMode="numeric" maxLength={6} placeholder="560102"
                      value={formData.pincode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      className="h-12 text-base" required
                    />
                    {formData.pincode && !validatePincode(formData.pincode) && (
                      <p className="text-red-500 text-xs">Enter a valid 6-digit pincode</p>
                    )}
                    {pincodeLoading && <p className="text-blue-500 text-xs">Looking up location...</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">City *</Label>
                    <Input
                      placeholder="Bhubaneswar"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className="h-12 text-base" required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">State *</Label>
                    <Select value={formData.state} onValueChange={(v) => handleInputChange("state", v)}>
                      <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Select state" /></SelectTrigger>
                      <SelectContent>
                        {indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-sm md:text-xs text-real-estate-neutral/70">
                  Enter pincode first — city and state will be auto-filled. You can edit them if needed.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe your property... (amenities, features, nearby landmarks)"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="min-h-24 text-base"
                />
              </div>

              {/* Photos */}
              {shareDialog.listingId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-800 font-medium">✅ Listing created successfully!</p>
                  <p className="text-green-700 text-sm">You can now upload photos below:</p>
                </div>
              )}
              <ImagePicker
                onImagesChange={async (coverUrl, mediaUrls) => {
                  setFormData(prev => ({ ...prev, coverImageUrl: coverUrl, mediaLinks: mediaUrls.join('\n') }));
                  if (shareDialog.listingId && (coverUrl || mediaUrls.length)) {
                    const { error } = await supabase.from('listings')
                      .update({
                        cover_image_url: coverUrl || null,
                        media_links: mediaUrls
                      })
                      .eq('id', shareDialog.listingId);
                    if (error) {
                      console.error(error);
                      toast({ title: "Image update failed", description: "Please try refreshing.", variant: "destructive" });
                    } else {
                      toast({ title: "Photos updated!", description: "Your photos were added." });
                    }
                  }
                }}
                listingId={shareDialog.listingId || undefined}
                userId={user?.id}
              />

              {/* Contact */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-real-estate-neutral mb-3 md:mb-4 text-lg md:text-base">Contact Information</h3>
                <div className="space-y-2">
                  <Label>Your Name *</Label>
                  <Input
                    placeholder="John Doe"
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange("ownerName", e.target.value)}
                    className="h-12 text-base"
                    required
                  />
                  <p className="text-sm md:text-xs text-real-estate-neutral/70">
                    Visitors will contact you through built-in messaging for privacy.
                  </p>
                </div>
              </div>

              {/* Submit / Share */}
              {!shareDialog.listingId ? (
                <Button type="submit" onClick={handleSubmit}
                  className="w-full h-12 bg-gradient-hero text-white font-semibold shadow-hero text-base"
                  disabled={isSubmitting}>
                  {isSubmitting ? "Creating Listing..." : "Create Listing & Get Share Link"}
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button type="button" onClick={() => window.open(shareDialog.shareUrl, '_blank')}
                    className="w-full h-12 bg-gradient-hero text-white font-semibold shadow-hero text-base">
                    <ExternalLink className="w-4 h-4 mr-2" /> View Your Listing
                  </Button>
                  <Button type="button" onClick={() => copyToClipboard(shareDialog.shareUrl)}
                    variant="outline" className="w-full h-12 text-base">
                    <Copy className="w-4 h-4 mr-2" /> Copy Share Link
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
                <Home className="w-5 h-5 md:w-6 md:h-6" /> Listing Created Successfully!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm md:text-xs text-muted-foreground">
                Your listing is live. Share this link:
              </p>
              <div className="flex items-center space-x-2">
                <Input value={shareDialog.shareUrl} readOnly className="flex-1 text-base" />
                <Button size="sm" onClick={() => copyToClipboard(shareDialog.shareUrl)} variant="outline">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleShare(shareDialog.shareUrl)} className="flex-1 text-base" variant="outline">
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
                <Button onClick={() => window.open(shareDialog.shareUrl, '_blank')} className="flex-1 text-base">
                  <ExternalLink className="w-4 h-4 mr-2" /> View Listing
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
