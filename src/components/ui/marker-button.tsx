'use client';

import Image from 'next/image';

interface MarkerButtonProps {
  price: string;
  lastUpdated: string;  // This is actually upload_date from the cleandata table
  propertyType?: string; // 'L' = Land, 'F' = Flat, 'I' = Independent house
  className?: string;
}

export function MarkerButton({ 
  price, 
  lastUpdated: uploadDate, 
  propertyType,
  className = '' 
}: MarkerButtonProps) {
  const isRecentlyUpdated = () => {
    try {
      const now = new Date();
      const updateDate = new Date(uploadDate);
      const diffInDays = (now.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffInDays <= 30; // Show flame for properties less than 30 days old
    } catch (error) {
      console.error('Error calculating date difference:', error);
      return false;
    }
  };

  const isPriceZero = price === '0.00Cr' || price === null || price === undefined;
  const isLand = propertyType === 'Plot/Land' || propertyType === 'Plot' || propertyType === 'L';
  const isIndependent = propertyType === 'Independent house' || propertyType === 'I';
  const isFlat = propertyType === 'Flat' || propertyType === 'F';

  const getMarkerImage = () => {
    if (isLand) return "/land300.png";
    if (isIndependent) return "/ind300.png";
    if (isFlat) return "/flat300.png";
    return "/flat300.png"; // default to flat icon
  };

  const getMarkerAlt = () => {
    if (isLand) return "Land marker";
    if (isIndependent) return "Independent house marker";
    if (isFlat) return "Flat marker";
    return "Property marker";
  };

  if (isLand || isIndependent || isFlat) {
    return (
      <div className={`
        flex flex-col items-center 
        ${className}
      `}>
        <div className="relative w-[32px] h-[auto]">
          <Image
            src={getMarkerImage()}
            alt={getMarkerAlt()}
            width={32}
            height={32}
            priority
            className="object-contain"
          />
        </div>
        <div className={`
          flex items-center justify-center
          min-w-[60px]
          px-[4px] py-[0px]
          text-center
        `}>
          {isPriceZero ? (
            <span className="
              text-primary text-[12px] font-bold font-sans
              [-webkit-text-stroke:_0px_white]
              [text-shadow:_0_1px_2px_rgba(0,0,0,0.3)]
            ">· · ·</span>
          ) : (
            <div className="flex items-center justify-center">
              <span className="
                text-primary text-[12px] font-semibold font-sans
                [-webkit-text-stroke:_0px_white]
                [text-shadow:_0_1px_2px_rgba(255,255,255,0.3)]
              ">₹</span>
              <span className="
                text-primary text-[12px] font-medium font-sans
                [-webkit-text-stroke:_0px_white]
                [text-shadow:_
                  -1px_-1px_0_#fff,
                  1px_-1px_0_#fff,
                  -1px_1px_0_#fff,
                  1px_1px_0_#fff
                ]
              ">{price}</span>
              {isRecentlyUpdated() && (
                <span className="text-primary text-[12px] font-normal font-sans ml-[1px]">🔥</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`
      inline-flex items-center gap-[1px] justify-start
      px-[4px] py-[3px]
      bg-[#F3F8FF]
      shadow-[0px_2px_4px_rgba(0,0,0,0.20)]
      hover:shadow-[0px_4px_8px_rgba(0,0,0,0.25)]
      hover:translate-y-[-2px]
      rounded-[6px]
      outline outline-1 outline-[#B6D7FB]
      -outline-offset-1
      transition-all duration-200 ease-in-out
      ${className}
    `}>
      {isPriceZero ? (
        <span className="text-[#084DCB] text-[11px] font-bold font-sans">· · ·</span>
      ) : (
        <>
          <span className="text-[#084DCB] text-[11px] font-normal font-sans">₹</span>
          <span className="text-[#084DCB] text-[11px] font-semibold font-sans">{price}</span>
          {isRecentlyUpdated() && (
            <span className="text-[#084DCB] text-[11px] font-normal font-sans ml-[1px]">🔥</span>
          )}
        </>
      )}
    </div>
  );
} 