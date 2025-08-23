import React from 'react';

interface YouTubeEmbedProps {
  url: string;
  title?: string;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ url, title = "YouTube video" }) => {
  const getEmbedUrl = (url: string): string | null => {
    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const videoId = match[1];
        return `https://www.youtube-nocookie.com/embed/${videoId}`;
      }
    }

    return null;
  };

  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) {
    return (
      <div className="bg-muted p-4 rounded-md text-center text-muted-foreground">
        Invalid YouTube URL format
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-md"
        src={embedUrl}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
};

export default YouTubeEmbed;