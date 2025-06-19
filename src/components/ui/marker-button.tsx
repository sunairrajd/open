'use client';

interface MarkerButtonProps {
  price: string;
  lastUpdated: string;  // This is actually upload_date from the cleandata table
  className?: string;
}

export function MarkerButton({ price, lastUpdated: uploadDate, className = '' }: MarkerButtonProps) {
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
        <span className="text-[#084DCB] text-[11px] font-normal font-sans">📞</span>
      ) : (
        <>
          <span className="text-[#084DCB] text-[11px] font-normal font-sans">₹</span>
          <span className="text-[#084DCB] text-[11px] font-semibold font-sans">{price}</span>
        </>
      )}
      {isRecentlyUpdated() && (
        <span className="text-[#084DCB] text-[11px] font-normal font-sans ml-[1px]">🔥</span>
      )}
    </div>
  );
} 