import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-dark-surface rounded-xl md:rounded-2xl border border-white/5 p-3 md:p-4 flex flex-col h-full animate-pulse">
      <div className="aspect-square rounded-lg md:rounded-xl bg-dark-card mb-3 md:mb-4 shrink-0 border border-white/5" />
      <div className="flex-1 flex flex-col gap-2 md:gap-3">
        <div className="h-3 w-1/3 bg-dark-card rounded" />
        <div className="h-4 w-3/4 bg-dark-card rounded" />
        <div className="h-4 w-1/2 bg-dark-card rounded" />
        <div className="mt-auto pt-2 flex items-end justify-between border-t border-white/5">
          <div className="flex flex-col gap-1">
            <div className="h-3 w-12 bg-dark-card rounded" />
            <div className="h-5 md:h-6 w-20 bg-dark-card rounded" />
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-dark-card shrink-0 ml-2" />
        </div>
      </div>
    </div>
  );
};
