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

// Popular/trending GIFs for demo (since we don't have API key)
const popularGifs = [
  {
    url: "https://media.tenor.com/rePDfDWO3XoAAAAj/haha-laughing.gif",
    name: "Laughing"
  },
  {
    url: "https://media.tenor.com/Z9kHBL2hXYcAAAAj/happy-excited.gif", 
    name: "Happy"
  },
  {
    url: "https://media.tenor.com/X_3HvnreJjUAAAAj/clap-good-job.gif",
    name: "Clapping"
  },
  {
    url: "https://media.tenor.com/wbKQtCg-zKcAAAAj/love-heart.gif",
    name: "Love"
  },
  {
    url: "https://media.tenor.com/3_7RzK3bJqQAAAAj/dance-party.gif",
    name: "Dancing"
  },
  {
    url: "https://media.tenor.com/UUQXC1wJ6FIAAAAJ/ok-thumbs-up.gif",
    name: "OK"
  },
  {
    url: "https://media.tenor.com/3Di1ux8ZENQAAAAJ/no-nope.gif",
    name: "No"
  },
  {
    url: "https://media.tenor.com/QyoGNUn5KRwAAAAj/surprised-shock.gif",
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
      <PopoverContent className="w-80 p-4">
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
          
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {filteredGifs.map((gif, index) => (
              <div
                key={index}
                className="cursor-pointer rounded overflow-hidden hover:opacity-80 transition-opacity"
                onClick={() => onGifSelect(gif.url, gif.name)}
              >
                <img
                  src={gif.url}
                  alt={gif.name}
                  className="w-full h-24 object-cover"
                  loading="lazy"
                />
                <div className="p-1 bg-gray-100 text-xs text-center">
                  {gif.name}
                </div>
              </div>
            ))}
          </div>
          
          {filteredGifs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No GIFs found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}