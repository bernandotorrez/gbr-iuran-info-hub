import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ScrollIndicator = () => {
  const [showIndicator, setShowIndicator] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Show indicator if content is scrollable
      const isScrollable = documentHeight > windowHeight;
      setShowIndicator(isScrollable);
      
      // Check if at bottom (with small threshold)
      const isBottom = scrollTop + windowHeight >= documentHeight - 50;
      setIsAtBottom(isBottom);
    };

    // Initial check
    handleScroll();
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleClick = () => {
    if (isAtBottom) {
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Scroll to bottom
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }
  };

  if (!showIndicator) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleClick}
        className="rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground p-3 h-auto w-auto flex flex-col items-center justify-center gap-0"
        aria-label={isAtBottom ? 'Scroll to top' : 'Scroll to bottom'}
      >
        {isAtBottom ? (
          <div className="flex flex-col items-center animate-bounce">
            <ChevronUp className="h-3 w-3 animate-pulse" style={{ animationDelay: '0ms' }} />
            <ChevronUp className="h-3 w-3 animate-pulse" style={{ animationDelay: '200ms' }} />
            <ChevronUp className="h-3 w-3 animate-pulse" style={{ animationDelay: '400ms' }} />
          </div>
        ) : (
          <div className="flex flex-col items-center animate-bounce">
            <ChevronDown className="h-3 w-3 animate-pulse" style={{ animationDelay: '0ms' }} />
            <ChevronDown className="h-3 w-3 animate-pulse" style={{ animationDelay: '200ms' }} />
            <ChevronDown className="h-3 w-3 animate-pulse" style={{ animationDelay: '400ms' }} />
          </div>
        )}
      </Button>
    </div>
  );
};

export default ScrollIndicator;