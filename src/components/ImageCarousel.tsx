import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ZoomIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CarouselApi } from "@/components/ui/carousel";

interface ImageCarouselProps {
  images: string[];
  title?: string;
  className?: string;
}

export const ImageCarousel = ({ images, title = "Property Photos", className = "" }: ImageCarouselProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // Track current slide
  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());
    
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (!images || images.length === 0) {
    return null;
  }

  const openLightbox = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Badge variant="outline" className="ml-2">
            {current + 1} / {images.length}
          </Badge>
        </div>

        <Carousel className="w-full" setApi={setApi}>
          <CarouselContent>
            {images.map((imageUrl, index) => (
              <CarouselItem key={index} className="basis-full">
                <Card className="overflow-hidden bg-gradient-card shadow-card border-0 group cursor-pointer">
                  <div className="relative aspect-video">
                    <img 
                      src={imageUrl}
                      alt={`${title} ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onClick={() => openLightbox(imageUrl)}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">Failed to load image</div>';
                        }
                      }}
                    />
                    
                    {/* Overlay with zoom icon */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Copy link button - similar to video */}
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2 bg-black/70 text-white hover:bg-black/60 border-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(imageUrl);
                      }}
                    >
                      Copy link
                    </Button>
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {images.length > 1 && (
            <>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </>
          )}
        </Carousel>

        {/* Mobile swipe hint */}
        {images.length > 1 && (
          <p className="text-sm text-muted-foreground text-center md:hidden">
            👈 Swipe to see more photos
          </p>
        )}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && closeLightbox()}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/10"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6" />
            </Button>
            
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Property photo enlarged"
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};