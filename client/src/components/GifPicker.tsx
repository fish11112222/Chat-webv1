import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Image, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Using Tenor API (free tier) for GIFs - will need API key
interface GifPickerProps {
  onGifSelect: (gifUrl: string, gifName: string) => void;
}

// Popular/trending GIFs for demo (using working URLs)
const popularGifs = [
  {
    url: "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif",
    name: "Laughing"
  },
  {
    url: "https://media.giphy.com/media/l3q2XhfQ8oCkm1Ts4/giphy.gif", 
    name: "Happy"
  },
  {
    url: "https://media.giphy.com/media/7rj2ZgttvgomY/giphy.gif",
    name: "Clapping"
  },
  {
    url: "https://media.giphy.com/media/3o6Zt3AC93PIPAdQ9a/giphy.gif",
    name: "Love"
  },
  {
    url: "https://media.giphy.com/media/l0HlKrB02QY0f1mbm/giphy.gif",
    name: "Dancing"
  },
  {
    url: "https://media.giphy.com/media/XreQmk7ETCak0/giphy.gif",
    name: "OK"
  },
  {
    url: "https://media.giphy.com/media/3og0INyCmHlNylks9O/giphy.gif",
    name: "No"
  },
  {
    url: "https://media.giphy.com/media/5VKbvrjxpVJCM/giphy.gif",
    name: "Surprised"
  }
];

export default function GifPicker({ onGifSelect }: GifPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // For now showing popular GIFs, can be enhanced with real API
  const filteredGifs = popularGifs.filter(gif => 
    gif.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 px-3">
          <Image className="w-4 h-4" />
          <span className="ml-1 text-xs">GIF</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-4">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search GIFs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto scroll-smooth">
            {filteredGifs.map((gif, index) => (
              <div
                key={index}
                className="cursor-pointer rounded-lg overflow-hidden hover:scale-105 hover:shadow-md transition-all duration-200 bg-white border"
                onClick={() => onGifSelect(gif.url, gif.name)}
              >
                <div className="aspect-square">
                  <img
                    src={gif.url}
                    alt={gif.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-2 bg-gradient-to-t from-gray-50 to-transparent">
                  <div className="text-xs font-medium text-center text-gray-700 truncate">
                    {gif.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredGifs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-2xl mb-2">🔍</div>
              <div className="text-sm">No GIFs found</div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}