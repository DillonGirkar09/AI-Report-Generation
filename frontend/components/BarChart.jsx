import React, { useEffect, useState } from 'react';

export default function BarChart({ title, bars }) {
  const [animate, setAnimate] = useState(false);

  // Trigger smooth bar growth animation on load or update
  useEffect(() => {
    setAnimate(false);
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [bars]);

  // Safety fallbacks
  const safeTitle = title || 'Chart Analysis';
  const safeBars = Array.isArray(bars) ? bars : [];

  return (
    <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm transition-all duration-300">
      <h3 className="text-[11px] text-neutral-400 font-bold tracking-wider uppercase mb-5 border-b border-neutral-100 pb-2">
        {safeTitle}
      </h3>
      
      <div className="space-y-4">
        {safeBars.length === 0 ? (
          <div className="text-center py-4 text-xs text-neutral-400">No chart data available</div>
        ) : (
          safeBars.map((bar, index) => {
            const val = typeof bar.value === 'number' ? bar.value : 0;
            const max = typeof bar.max === 'number' && bar.max > 0 ? bar.max : 100;
            const percentage = Math.min(100, Math.max(0, (val / max) * 100));
            const barColor = `hsl(${200 + index * 18}, 65%, 42%)`;
            const widthStyle = animate ? `${percentage}%` : '0%';

            return (
              <div key={index} className="flex items-center gap-3">
                {/* 70px right-aligned label */}
                <div className="w-[70px] text-right shrink-0">
                  <span className="text-[11px] font-semibold text-neutral-500 truncate block" title={bar.label}>
                    {bar.label || '—'}
                  </span>
                </div>

                {/* Progress bar track */}
                <div className="flex-1 h-5 bg-neutral-100 rounded-md overflow-hidden relative border border-neutral-50">
                  <div
                    className="h-full rounded-md transition-all duration-1000 ease-out shadow-inner"
                    style={{
                      width: widthStyle,
                      backgroundColor: barColor,
                    }}
                  />
                </div>

                {/* Value label */}
                <div className="w-10 text-left shrink-0">
                  <span className="text-[11px] font-bold text-neutral-700">
                    {val}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
