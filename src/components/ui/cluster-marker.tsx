'use client';

interface ClusterMarkerProps {
  count: number;
  className?: string;
}

export function ClusterMarker({ count, className = '' }: ClusterMarkerProps) {
  return (
    <div className={`
      inline-flex items-center gap-[1px] justify-start
      px-[6px] py-[3px]
      bg-[#084DCB]
      shadow-[0px_2px_4px_rgba(0,0,0,0.20)]
      hover:shadow-[0px_4px_8px_rgba(0,0,0,0.25)]
      hover:translate-y-[-2px]
      rounded-[6px]
      outline outline-1 outline-[#084DCB]
      -outline-offset-1
      transition-all duration-200 ease-in-out
      ${className}
    `}>
      <svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      
        <path d="M3 9.99998H4.67313V7.02886H7.32688V9.99998H9V5.49998L6 3.24036L3 5.49998V9.99998ZM2.25 10.75V5.12498L6 2.30286L9.75 5.12498V10.75H6.57688V7.77886H5.42313V10.75H2.25Z" fill="white"/>
      </svg>
      <span className="text-white text-[11px] font-semibold font-sans">{count}</span>
    </div>
  );
} 