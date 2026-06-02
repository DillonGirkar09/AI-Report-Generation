import React from 'react';

export default function MetricCard({ label, value, trend, note }) {
  // Determine trend styles and arrow
  let trendColorClass = 'text-neutral-500 bg-neutral-100';
  let ArrowIcon = '→';

  if (trend === 'up') {
    trendColorClass = 'text-emerald-700 bg-emerald-50';
    ArrowIcon = '↑';
  } else if (trend === 'down') {
    trendColorClass = 'text-rose-700 bg-rose-50';
    ArrowIcon = '↓';
  }

  // Safety fallback for empty values
  const safeLabel = label || 'Metric';
  const safeValue = value || '—';
  const safeNote = note || '';

  return (
    <div className="bg-[#f8f8f6] p-4 rounded-xl border border-neutral-100 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-neutral-200">
      <div>
        <p className="text-[11px] text-neutral-500 font-semibold tracking-wider uppercase mb-1">
          {safeLabel}
        </p>
        <p className="text-[22px] font-bold text-neutral-800 tracking-tight leading-none my-1">
          {safeValue}
        </p>
      </div>
      {safeNote && (
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${trendColorClass}`}>
            <span>{ArrowIcon}</span>
            <span className="uppercase tracking-wider text-[9px]">{trend || 'neutral'}</span>
          </span>
          <span className="text-[11px] text-neutral-500">
            {safeNote}
          </span>
        </div>
      )}
    </div>
  );
}
