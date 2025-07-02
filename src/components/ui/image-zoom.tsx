
import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
  thumbnailClassName?: string;
}

export const ImageZoom: React.FC<ImageZoomProps> = ({ 
  src, 
  alt, 
  className = "", 
  thumbnailClassName = "w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80" 
}) => {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!src) return null;

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={thumbnailClassName}
        onClick={() => setIsZoomed(true)}
      />
      
      <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 z-10 bg-black/50 text-white hover:bg-black/70"
              onClick={() => setIsZoomed(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <img
              src={src}
              alt={alt}
              className={`w-full h-auto max-h-[85vh] object-contain ${className}`}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
