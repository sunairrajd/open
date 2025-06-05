'use client';

export default function VideoPage() {
  return (
    <div className="flex flex-col gap-8 p-4">
      {/* Regular YouTube Video */}
      <iframe 
        width="560" 
        height="315" 
        src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
        title="Regular YouTube video"
        frameBorder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowFullScreen
      />

      {/* YouTube Shorts Video */}
      <iframe 
        width="315"
        height="560"
        src="https://www.youtube.com/embed/H6tdzlHL5Z8" 
        title="YouTube Shorts video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}