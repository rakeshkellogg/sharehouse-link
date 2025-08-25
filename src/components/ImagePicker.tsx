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

  // Storage bucket health check (read-only)
  const testStorageConnection = async () => {
    console.log('🔍 Testing storage connection (read-only)...');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('👤 Auth session:', session ? 'Active' : 'None');

      // Try listing objects in the public bucket (no admin perms required)
      const { data, error } = await supabase.storage
        .from('listing-photos')
        .list('', { limit: 1 });

      if (error) {
        console.error('❌ Storage list error:', error);
        const status = (error as any).statusCode ?? (error as any).status ?? 'unknown';
        let description = 'Unable to access listing-photos bucket.';
        if (status === 404) description = 'Bucket "listing-photos" not found. Please ensure it exists and is public.';
        if (status === 401 || status === 403) description = 'Permission denied. Ensure you are logged in and storage RLS allows read.';
        toast({ title: 'Storage Error', description, variant: 'destructive' });
        return false;
      }

      console.log('✅ listing-photos bucket accessible. Sample contents:', data);
      toast({ title: 'Storage OK', description: 'listing-photos bucket is accessible.' });
      return true;
    } catch (err) {
      console.error('💥 Storage connection test failed:', err);
      toast({ title: 'Storage Error', description: 'Unexpected error when checking storage. See console for details.', variant: 'destructive' });
      return false;
    }
  };

  // Enhanced upload process with debugging
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📸 Starting file selection process...');
    const files = Array.from(event.target.files || []);
    console.log(`📁 Selected ${files.length} files:`, files.map(f => ({ name: f.name, size: f.size, type: f.type })));
    
    if (files.length + images.length > 4) {
      console.warn('⚠️ Too many images selected');
      toast({
        title: "Too many images",
        description: "You can upload up to 4 images maximum.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    console.log('🔄 Starting upload process...');

    try {
      // Test storage connection first
      console.log('🧪 Testing storage connection...');
      const storageReady = await testStorageConnection();
      if (!storageReady) {
        throw new Error('Storage connection failed');
      }

      console.log('🗜️ Compressing images...');
      const compressedImages = await Promise.all(
        files.map(async (file, index) => {
          console.log(`📦 Compressing file ${index + 1}/${files.length}: ${file.name}`);
          const compressed = await compressImage(file);
          console.log(`✅ Compressed ${file.name}: ${file.size} → ${compressed.file.size} bytes`);
          return compressed;
        })
      );
      
      const newImages = [...images, ...compressedImages].slice(0, 4);
      setImages(newImages);
      console.log(`🖼️ Total images after compression: ${newImages.length}`);

      // Upload to Supabase Storage if we have listing and user info
      if (listingId && userId) {
        console.log(`🚀 Starting upload to Supabase Storage (listingId: ${listingId}, userId: ${userId})`);
        
        const uploadPromises = compressedImages.map(async (img, index) => {
          const fileName = `${Date.now()}-${images.length + index}.jpg`;
          const filePath = `${userId}/${listingId}/${fileName}`;
          
          console.log(`⬆️ Uploading file ${index + 1}/${compressedImages.length}: ${fileName}`);
          console.log(`📍 Upload path: ${filePath}`);

          const { data, error } = await supabase.storage
            .from('listing-photos')
            .upload(filePath, img.file);

          if (error) {
            console.error(`❌ Upload failed for ${fileName}:`, error);
            throw error;
          }

          console.log(`✅ Upload successful for ${fileName}:`, data);

          const { data: urlData } = supabase.storage
            .from('listing-photos')
            .getPublicUrl(filePath);

          console.log(`🔗 Generated public URL for ${fileName}:`, urlData.publicUrl);
          return urlData.publicUrl;
        });

        console.log('⏳ Waiting for all uploads to complete...');
        const newUrls = await Promise.all(uploadPromises);
        const allUrls = [...uploadedUrls, ...newUrls];
        
        console.log('🎉 All uploads completed successfully!');
        console.log('📊 Upload summary:', {
          newUrls: newUrls.length,
          totalUrls: allUrls.length,
          urls: allUrls
        });

        setUploadedUrls(allUrls);

        // Set cover photo to first image if none selected
        const newCoverUrl = coverUrl || allUrls[0] || "";
        setCoverUrl(newCoverUrl);
        console.log(`🖼️ Cover image set to: ${newCoverUrl}`);

        onImagesChange(newCoverUrl, allUrls);
        
        // Success notification
        toast({
          title: "Upload Successful",
          description: `${newUrls.length} photo${newUrls.length > 1 ? 's' : ''} uploaded successfully!`,
        });
      } else {
        console.log('📝 Processing images locally - will upload after listing creation');
        // Store images locally for now, they'll be uploaded when listingId becomes available
        const localUrls = newImages.map((img, index) => img.url);
        
        // Set cover to first image if none selected
        const newCoverUrl = coverUrl || localUrls[0] || "";
        setCoverUrl(newCoverUrl);
        
        // Update parent with local URLs for now
        onImagesChange(newCoverUrl, localUrls);
        
        toast({
          title: "Images Ready",
          description: "Images processed! They'll be uploaded when you create the listing.",
        });
      }

    } catch (error) {
      console.error('💥 Error during upload process:', error);
      
      // Specific error messages
      let errorMessage = "Failed to process images. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('Storage')) {
          errorMessage = "Storage connection failed. Please check your internet connection.";
        } else if (error.message.includes('upload')) {
          errorMessage = "Upload failed. Please try smaller images or check your connection.";
        } else if (error.message.includes('compress')) {
          errorMessage = "Image compression failed. Please try different images.";
        }
      }
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      console.log('🏁 Upload process completed');
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
      
      {/* Test Storage Connection Button */}
      <Button
        type="button"
        variant="secondary"
        onClick={testStorageConnection}
        className="w-full h-10 mb-2"
      >
        🔍 Test Storage Connection
      </Button>

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