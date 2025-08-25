import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Star, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { compressImage, CompressedImage } from "@/lib/compressImage";
import { supabase } from "@/integrations/supabase/client";

interface ImagePickerProps {
  onImagesChange: (coverUrl: string, mediaUrls: string[]) => void;
  initialCoverUrl?: string;
  initialMediaUrls?: string[];
  listingId?: string;
  userId?: string;
}

export const ImagePicker = ({ 
  onImagesChange, 
  initialCoverUrl = "", 
  initialMediaUrls = [], 
  listingId,
  userId 
}: ImagePickerProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<CompressedImage[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(initialMediaUrls);
  const [coverUrl, setCoverUrl] = useState(initialCoverUrl);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length + images.length > 4) {
      toast({
        title: "Too many images",
        description: "You can upload up to 4 images maximum.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const compressedImages = await Promise.all(
        files.map(file => compressImage(file))
      );
      
      const newImages = [...images, ...compressedImages].slice(0, 4);
      setImages(newImages);
      
      // Upload to Supabase Storage if we have listing and user info
      if (listingId && userId) {
        const uploadPromises = compressedImages.map(async (img, index) => {
          const fileName = `${Date.now()}-${images.length + index}.jpg`;
          const filePath = `${userId}/${listingId}/${fileName}`;
          
          const { data, error } = await supabase.storage
            .from('listing-photos')
            .upload(filePath, img.file);
          
          if (error) throw error;
          
    const { data: urlData } = supabase.storage
      .from('listing-photos')
      .getPublicUrl(filePath);

    console.log('Generated public URL:', urlData.publicUrl);
    return urlData.publicUrl;
        });
        
        const newUrls = await Promise.all(uploadPromises);
        const allUrls = [...uploadedUrls, ...newUrls];
        setUploadedUrls(allUrls);
        
        // Set cover photo to first image if none selected
        const newCoverUrl = coverUrl || allUrls[0] || "";
        setCoverUrl(newCoverUrl);
        
        onImagesChange(newCoverUrl, allUrls);
      }

    } catch (error) {
      console.error('Error processing images:', error);
      toast({
        title: "Upload failed",
        description: "Failed to process images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    if (uploadedUrls[index]) {
      // Remove from Supabase Storage
      try {
        const url = uploadedUrls[index];
        const fileName = url.split('/').pop();
        const filePath = `${userId}/${listingId}/${fileName}`;
        
        await supabase.storage
          .from('listing-photos')
          .remove([filePath]);
      } catch (error) {
        console.error('Error removing image:', error);
      }
    }

    const newImages = images.filter((_, i) => i !== index);
    const newUrls = uploadedUrls.filter((_, i) => i !== index);
    
    setImages(newImages);
    setUploadedUrls(newUrls);
    
    // Update cover if we removed the cover image
    let newCoverIndex = coverIndex;
    if (index === coverIndex) {
      newCoverIndex = 0;
    } else if (index < coverIndex) {
      newCoverIndex = coverIndex - 1;
    }
    
    setCoverIndex(newCoverIndex);
    const newCoverUrl = newUrls[newCoverIndex] || "";
    setCoverUrl(newCoverUrl);
    
    onImagesChange(newCoverUrl, newUrls);
  };

  const setCoverImage = (index: number) => {
    setCoverIndex(index);
    const newCoverUrl = uploadedUrls[index] || "";
    setCoverUrl(newCoverUrl);
    onImagesChange(newCoverUrl, uploadedUrls);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2">
        <ImageIcon className="w-4 h-4" />
        Property Photos (up to 4)
      </Label>
      
      {/* Upload Button */}
      <Button
        type="button"
        variant="outline"
        onClick={triggerFileInput}
        disabled={uploading || images.length >= 4}
        className="w-full h-12 border-dashed"
      >
        <Upload className="w-4 h-4 mr-2" />
        {uploading ? "Processing..." : images.length >= 4 ? "Maximum 4 photos reached" : "Select Photos"}
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* Image Preview Grid */}
      {(images.length > 0 || uploadedUrls.length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {(uploadedUrls.length > 0 ? uploadedUrls : images).map((item, index) => {
            const imageUrl = typeof item === 'string' ? item : item.url;
            const isCover = index === coverIndex;
            
            return (
              <Card key={index} className={`relative overflow-hidden ${isCover ? 'ring-2 ring-primary' : ''}`}>
                <CardContent className="p-0">
                  <div className="aspect-video relative">
                    <img 
                      src={imageUrl} 
                      alt={`Property photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Cover badge */}
                    {isCover && (
                      <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                        <Star className="w-3 h-3 mr-1" />
                        Cover
                      </Badge>
                    )}
                    
                    {/* Controls */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {!isCover && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setCoverImage(index)}
                          className="h-6 px-2 text-xs"
                        >
                          Set Cover
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeImage(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      <p className="text-sm text-muted-foreground">
        Upload up to 4 high-quality photos. The first photo will be used as the cover image, or select "Set Cover" on any photo to make it the main display image.
      </p>
    </div>
  );
};