import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, DollarSign, Home, Bath, Bed, Square, Link, Phone, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CreateListingForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    bedrooms: "",
    bathrooms: "",
    size: "",
    location: "",
    mediaLinks: "",
    ownerName: "",
    ownerPhone: "",
    ownerWhatsApp: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Listing Created!",
      description: "Your property listing has been created successfully.",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-real-estate-light py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-real-estate-neutral mb-4">
            Create Your Property Listing
          </h1>
          <p className="text-real-estate-neutral/70">Fill out the details below to create a shareable listing</p>
        </div>

        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-real-estate-neutral">
              <Home className="w-5 h-5" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Location *
                </Label>
                <Input
                  id="location"
                  placeholder="Enter address or neighborhood"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="h-12"
                />
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

              {/* Media Links */}
              <div className="space-y-2">
                <Label htmlFor="mediaLinks" className="flex items-center gap-1">
                  <Link className="w-4 h-4" />
                  Media Links
                </Label>
                <Textarea
                  id="mediaLinks"
                  placeholder="Paste links to photos/videos (Instagram, Google Drive, YouTube, etc.) - one per line"
                  value={formData.mediaLinks}
                  onChange={(e) => handleInputChange("mediaLinks", e.target.value)}
                  className="min-h-20"
                />
              </div>

              {/* Contact Information */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-real-estate-neutral mb-4">Contact Information</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Your Name *</Label>
                    <Input
                      id="ownerName"
                      placeholder="John Doe"
                      value={formData.ownerName}
                      onChange={(e) => handleInputChange("ownerName", e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerPhone" className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="ownerPhone"
                      placeholder="+1 (555) 123-4567"
                      value={formData.ownerPhone}
                      onChange={(e) => handleInputChange("ownerPhone", e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerWhatsApp" className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </Label>
                    <Input
                      id="ownerWhatsApp"
                      placeholder="+1 (555) 123-4567"
                      value={formData.ownerWhatsApp}
                      onChange={(e) => handleInputChange("ownerWhatsApp", e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full h-12 bg-gradient-hero text-white font-semibold shadow-hero">
                Create Listing & Get Share Link
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateListingForm;