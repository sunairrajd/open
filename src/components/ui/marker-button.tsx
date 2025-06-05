'use client';

interface MarkerButtonProps {
  price: string;
  lastUpdated: string;
  className?: string;
}

export function MarkerButton({ price, lastUpdated, className = '' }: MarkerButtonProps) {
  const isRecentlyUpdated = () => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const updateDate = new Date(lastUpdated);
    return updateDate > threeMonthsAgo;
  };

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
      <span className="text-[#084DCB] text-[11px] font-normal font-sans">₹</span>
      <span className="text-[#084DCB] text-[11px] font-semibold font-sans">{price}</span>
      {isRecentlyUpdated() && (
        <span className="text-[#084DCB] text-[11px] font-normal font-sans ml-[1px]">🔥</span>
      )}
    </div>
  );
} 