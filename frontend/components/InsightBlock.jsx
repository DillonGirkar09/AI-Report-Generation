import React from 'react';

export default function InsightBlock({ heading, body }) {
  // Safety fallbacks
  const safeHeading = heading || 'ANALYSIS INSIGHT';
  const safeBody = body || 'No insight narrative provided.';

  return (
    <div className="bg-[#f0f7ff] border-l-4 border-[#3b82f6] p-4 rounded-r-xl transition-all duration-300 hover:bg-[#e6f2ff] hover:shadow-sm">
      <h4 className="text-[10px] font-bold text-[#3b82f6] uppercase tracking-wider mb-1.5">
        {safeHeading}
      </h4>
      <p className="text-[12px] text-neutral-700 font-normal leading-[1.65]">
        {safeBody}
      </p>
    </div>
  );
}
