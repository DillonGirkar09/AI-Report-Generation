import React, { useState } from 'react';
import MetricCard from './MetricCard';
import BarChart from './BarChart';
import InsightBlock from './InsightBlock';
import ExportButton from './ExportButton';

export default function ReportPanel({ report, prompt, loading, error, onExampleClick, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState(null);

  // Strict schema validation — supports both old (metrics) and new (keyMetrics) schema
  const validateReport = (rawReport) => {
    if (!rawReport) return null;

    // Backward compat: support old schema field names
    const metrics = rawReport.keyMetrics || rawReport.metrics || [];
    const profiles = rawReport.profiles || [];
    const trends = rawReport.trends || [];
    const comparisonTable = rawReport.comparisonTable || null;
    const methodology = rawReport.methodology || null;

    return {
      title: typeof rawReport.title === 'string' ? rawReport.title : "Report Analytics Overview",
      subtitle: typeof rawReport.subtitle === 'string' ? rawReport.subtitle : "Real-time AI data compilation",
      date: typeof rawReport.date === 'string' ? rawReport.date : "",
      summary: typeof rawReport.summary === 'string' ? rawReport.summary : "No descriptive summary overview was supplied for this generated report.",
      keyMetrics: Array.isArray(metrics)
        ? metrics.map(m => ({
            label: typeof m.label === 'string' ? m.label : "Metric Key",
            value: typeof m.value === 'string' || typeof m.value === 'number' ? String(m.value) : "—",
            trend: ['up', 'down', 'neutral'].includes(m.trend) ? m.trend : "neutral",
            note: typeof m.note === 'string' ? m.note : ""
          }))
        : [],
      profiles: Array.isArray(profiles)
        ? profiles.map(p => ({
            name: typeof p.name === 'string' ? p.name : "Entity",
            category: typeof p.category === 'string' ? p.category : "",
            rank: typeof p.rank === 'number' ? p.rank : 0,
            stats: Array.isArray(p.stats) ? p.stats.map(s => ({
              label: typeof s.label === 'string' ? s.label : "",
              value: typeof s.value === 'string' ? s.value : ""
            })) : [],
            description: typeof p.description === 'string' ? p.description : "",
            keyStrengths: Array.isArray(p.keyStrengths) ? p.keyStrengths.filter(s => typeof s === 'string') : [],
            majorPlayers: Array.isArray(p.majorPlayers) ? p.majorPlayers.filter(s => typeof s === 'string') : []
          }))
        : [],
      chart: {
        title: (rawReport.chart && typeof rawReport.chart.title === 'string')
          ? rawReport.chart.title
          : "DATA DISTRIBUTION MATRIX",
        bars: (rawReport.chart && Array.isArray(rawReport.chart.bars))
          ? rawReport.chart.bars.map(b => ({
              label: typeof b.label === 'string' ? b.label : "Category",
              value: typeof b.value === 'number' ? b.value : 0,
              max: typeof b.max === 'number' && b.max > 0 ? b.max : 100
            }))
          : []
      },
      comparisonTable: comparisonTable && Array.isArray(comparisonTable.columns) && Array.isArray(comparisonTable.rows)
        ? {
            title: typeof comparisonTable.title === 'string' ? comparisonTable.title : "Comparison",
            columns: comparisonTable.columns.filter(c => typeof c === 'string'),
            rows: comparisonTable.rows.map(r => ({
              label: typeof r.label === 'string' ? r.label : "",
              values: Array.isArray(r.values) ? r.values.map(v => String(v)) : []
            }))
          }
        : null,
      trends: Array.isArray(trends)
        ? trends.map(t => ({
            number: typeof t.number === 'number' ? t.number : 0,
            heading: typeof t.heading === 'string' ? t.heading : "",
            body: typeof t.body === 'string' ? t.body : ""
          }))
        : [],
      insights: Array.isArray(rawReport.insights)
        ? rawReport.insights.map(ins => ({
            heading: typeof ins.heading === 'string' ? ins.heading : "RECOMMENDED PATH",
            body: typeof ins.body === 'string' ? ins.body : "No insight narrative provided."
          }))
        : [],
      methodology: typeof methodology === 'string' ? methodology : null
    };
  };

  const validatedReport = validateReport(report);

  // Toggle Edit Mode
  const handleStartEdit = () => {
    if (validatedReport) {
      setEditState(JSON.parse(JSON.stringify(validatedReport)));
      setIsEditing(true);
    }
  };
  const handleCancelEdit = () => { setIsEditing(false); setEditState(null); };
  const handleSaveEdit = () => {
    if (editState && onSave) onSave(editState);
    setIsEditing(false);
    setEditState(null);
  };

  const handleUpdateField = (field, val) => setEditState(prev => ({ ...prev, [field]: val }));
  const handleUpdateMetric = (idx, field, val) => {
    setEditState(prev => {
      const updated = [...prev.keyMetrics];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, keyMetrics: updated };
    });
  };
  const handleAddMetric = () => setEditState(prev => ({
    ...prev,
    keyMetrics: [...prev.keyMetrics, { label: "New KPI", value: "0", trend: "neutral", note: "Change note" }]
  }));
  const handleRemoveMetric = (idx) => setEditState(prev => ({
    ...prev, keyMetrics: prev.keyMetrics.filter((_, i) => i !== idx)
  }));
  const handleUpdateChartTitle = (title) => setEditState(prev => ({ ...prev, chart: { ...prev.chart, title } }));
  const handleUpdateBar = (idx, field, val) => {
    setEditState(prev => {
      const updated = [...prev.chart.bars];
      updated[idx] = { ...updated[idx], [field]: (field === 'value' || field === 'max') ? Number(val) : val };
      return { ...prev, chart: { ...prev.chart, bars: updated } };
    });
  };
  const handleAddBar = () => setEditState(prev => ({
    ...prev, chart: { ...prev.chart, bars: [...prev.chart.bars, { label: "New Category", value: 50, max: 100 }] }
  }));
  const handleRemoveBar = (idx) => setEditState(prev => ({
    ...prev, chart: { ...prev.chart, bars: prev.chart.bars.filter((_, i) => i !== idx) }
  }));
  const handleUpdateInsight = (idx, field, val) => {
    setEditState(prev => {
      const updated = [...prev.insights];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, insights: updated };
    });
  };
  const handleAddInsight = () => setEditState(prev => ({
    ...prev, insights: [...prev.insights, { heading: "NEW STRATEGIC TAKEAWAY", body: "Insight narrative description goes here." }]
  }));
  const handleRemoveInsight = (idx) => setEditState(prev => ({
    ...prev, insights: prev.insights.filter((_, i) => i !== idx)
  }));

  return (
    <div className="flex-1 h-full bg-[#fafaf8] flex flex-col justify-between overflow-hidden relative">

      {/* Top Header */}
      <div className="h-[60px] border-b border-neutral-200 bg-white px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-xs font-bold text-neutral-600 tracking-wider uppercase">Report panel</span>
        </div>

        {validatedReport && !loading && (
          <div className="flex items-center gap-3">
            {!isEditing && report && <ExportButton report={report} prompt={prompt} />}
            {!isEditing && (
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                Live
              </div>
            )}
            <button
              onClick={isEditing ? handleCancelEdit : handleStartEdit}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 cursor-pointer shadow-sm ${
                isEditing
                  ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
                  : 'bg-white hover:bg-neutral-50 border-neutral-200 hover:border-neutral-300 text-neutral-600'
              }`}
            >
              {isEditing ? <><span>👁️</span><span>Cancel Edit</span></> : <><span>📝</span><span>Edit Report</span></>}
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-24">

        {/* LOADING STATE */}
        {loading && (
          <div className="h-full w-full flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-neutral-200 border-t-[#1d4ed8] rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-semibold text-neutral-700 tracking-wide">Generating report…</p>
            <p className="text-xs text-neutral-400 mt-1">Claude is analyzing dataset and constructing layout...</p>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="h-full w-full flex flex-col items-center justify-center py-20 px-6">
            <div className="w-12 h-12 bg-rose-50 border border-rose-200 text-rose-500 rounded-full flex items-center justify-center text-lg font-bold mb-4">⚠️</div>
            <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">Report Generation Failed</h3>
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 p-3 rounded-lg mt-3 text-center max-w-[400px] shadow-inner font-mono leading-relaxed">{error}</p>
            <p className="text-[11px] text-neutral-400 mt-2">Please check your API key config in backend/.env and try again.</p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && !validatedReport && (
          <div className="h-full w-full flex flex-col items-center justify-center py-20 px-6 max-w-[520px] mx-auto text-center">
            <div className="text-5xl mb-6 select-none animate-bounce">📊</div>
            <h2 className="text-base font-extrabold text-neutral-800 tracking-tight mb-2">Ready for Analysis</h2>
            <p className="text-xs text-neutral-500 leading-relaxed mb-6">
              Enter a query in the chat panel on the left, or click one of the preset example prompts below to synthesize a rich live-updating analytics dashboard instantly.
            </p>
            <div className="flex flex-col gap-2 w-full">
              {["AI adoption by country 2026", "Space tech investment leaders", "Enterprise AI usage by industry"].map((ex, i) => (
                <button
                  key={i}
                  onClick={() => onExampleClick && onExampleClick(ex)}
                  className="text-xs font-semibold text-neutral-600 bg-white border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-900 rounded-xl px-4 py-2.5 shadow-sm transition-all duration-300 cursor-pointer text-left flex items-center justify-between group"
                >
                  <span>{ex}</span>
                  <span className="text-[10px] text-neutral-300 group-hover:text-neutral-500 transition-colors">➔</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* EDIT MODE */}
        {!loading && !error && isEditing && editState && (
          <div className="space-y-6 max-w-[800px] mx-auto animate-fade-in pb-10">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-800 flex items-start gap-3 shadow-inner">
              <span className="text-lg">🛠️</span>
              <div>
                <p className="font-bold">Manual Editing Dashboard Enabled</p>
                <p className="mt-0.5 opacity-90">Modify text, numbers, metrics, charts, and insights below. When satisfied, click "Save Changes" at the bottom.</p>
              </div>
            </div>

            {/* Header Config */}
            <div className="bg-white border border-neutral-200 p-5 rounded-xl shadow-sm space-y-4">
              <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-1.5">Dashboard Header Configuration</h4>
              <div className="grid grid-cols-1 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Report Title</label>
                  <input type="text" value={editState.title} onChange={(e) => handleUpdateField('title', e.target.value)} className="text-xs p-2.5 border rounded-lg border-neutral-200 focus:border-blue-500 outline-none transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Report Subtitle</label>
                  <input type="text" value={editState.subtitle} onChange={(e) => handleUpdateField('subtitle', e.target.value)} className="text-xs p-2.5 border rounded-lg border-neutral-200 focus:border-blue-500 outline-none transition" />
                </div>
              </div>
            </div>

            {/* Summary Editor */}
            <div className="bg-white border border-neutral-200 p-5 rounded-xl shadow-sm space-y-3">
              <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-1.5">Executive Summary Narrative</h4>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Overview Narrative</label>
                <textarea value={editState.summary} onChange={(e) => handleUpdateField('summary', e.target.value)} className="text-xs p-2.5 border rounded-lg border-neutral-200 focus:border-blue-500 outline-none transition h-28 w-full resize-y font-mono leading-relaxed" />
              </div>
            </div>

            {/* Metrics Config */}
            <div className="bg-white border border-neutral-200 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Key Metrics (Max 6 Items)</h4>
                {editState.keyMetrics.length < 6 && (
                  <button onClick={handleAddMetric} className="text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 cursor-pointer">
                    <span>➕</span> Add Metric
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {editState.keyMetrics.map((metric, idx) => (
                  <div key={idx} className="border border-neutral-150 p-4 rounded-xl bg-[#fcfcfb] space-y-3 relative group">
                    <button onClick={() => handleRemoveMetric(idx)} className="absolute right-3 top-3 text-[10px] text-rose-500 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-full font-bold transition cursor-pointer" title="Remove Metric">🗑️</button>
                    <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Metric #{idx + 1}</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-neutral-400 uppercase">Label</label>
                        <input type="text" value={metric.label} onChange={(e) => handleUpdateMetric(idx, 'label', e.target.value)} className="text-xs p-2 border rounded-lg border-neutral-200 focus:border-blue-500 outline-none transition" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-neutral-400 uppercase">Value</label>
                        <input type="text" value={metric.value} onChange={(e) => handleUpdateMetric(idx, 'value', e.target.value)} className="text-xs p-2 border rounded-lg border-neutral-200 focus:border-blue-500 outline-none transition font-bold" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-neutral-400 uppercase">Trend Indicator</label>
                        <select value={metric.trend} onChange={(e) => handleUpdateMetric(idx, 'trend', e.target.value)} className="text-xs p-2 border rounded-lg border-neutral-200 focus:border-blue-500 outline-none bg-white transition">
                          <option value="up">Up (Green Arrow)</option>
                          <option value="down">Down (Red Arrow)</option>
                          <option value="neutral">Neutral (Gray Dot)</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-neutral-400 uppercase">Footnote / Subtext</label>
                      <input type="text" value={metric.note} onChange={(e) => handleUpdateMetric(idx, 'note', e.target.value)} className="text-xs p-2 border rounded-lg border-neutral-200 focus:border-blue-500 outline-none transition" placeholder="e.g. 15% growth from Q1" />
                    </div>
                  </div>
                ))}
                {editState.keyMetrics.length === 0 && <p className="text-xs text-neutral-400 text-center py-4 italic">No metrics configured. Click "Add Metric" to add one.</p>}
              </div>
            </div>

            {/* Chart Config */}
            <div className="bg-white border border-neutral-200 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Bar Chart Builder (Max 8 Rows)</h4>
                {editState.chart.bars.length < 8 && (
                  <button onClick={handleAddBar} className="text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 cursor-pointer">
                    <span>➕</span> Add Row
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-1.5 pb-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Chart Axis Title</label>
                <input type="text" value={editState.chart.title} onChange={(e) => handleUpdateChartTitle(e.target.value)} className="text-xs p-2.5 border rounded-lg border-neutral-200 focus:border-blue-500 outline-none transition uppercase font-semibold" />
              </div>
              <div className="space-y-3">
                {editState.chart.bars.map((bar, idx) => (
                  <div key={idx} className="flex items-end gap-3 p-3 rounded-lg border border-neutral-100 bg-[#fbfbfa] relative group">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[8px] font-bold text-neutral-400 uppercase">Row Label</label>
                        <input type="text" value={bar.label} onChange={(e) => handleUpdateBar(idx, 'label', e.target.value)} className="text-xs p-2 border rounded border-neutral-200 focus:border-blue-500 outline-none transition" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[8px] font-bold text-neutral-400 uppercase">Current Value</label>
                        <input type="number" value={bar.value} onChange={(e) => handleUpdateBar(idx, 'value', e.target.value)} className="text-xs p-2 border rounded border-neutral-200 focus:border-blue-500 outline-none transition font-bold" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[8px] font-bold text-neutral-400 uppercase">Maximum Scale</label>
                        <input type="number" value={bar.max} onChange={(e) => handleUpdateBar(idx, 'max', e.target.value)} className="text-xs p-2 border rounded border-neutral-200 focus:border-blue-500 outline-none transition" />
                      </div>
                    </div>
                    <button onClick={() => handleRemoveBar(idx)} className="text-rose-500 bg-rose-50 hover:bg-rose-100 p-2 rounded-lg font-bold transition shrink-0 h-[36px] flex items-center justify-center cursor-pointer" title="Remove Row">🗑️</button>
                  </div>
                ))}
                {editState.chart.bars.length === 0 && <p className="text-xs text-neutral-400 text-center py-4 italic">No bar items defined. Click "Add Row" to append items.</p>}
              </div>
            </div>

            {/* Insights Editor */}
            <div className="bg-white border border-neutral-200 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Strategic Insights (Max 3 Items)</h4>
                {editState.insights.length < 3 && (
                  <button onClick={handleAddInsight} className="text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 cursor-pointer">
                    <span>➕</span> Add Takeaway
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {editState.insights.map((insight, idx) => (
                  <div key={idx} className="border border-neutral-150 p-4 rounded-xl bg-[#fcfcfb] space-y-3 relative group">
                    <button onClick={() => handleRemoveInsight(idx)} className="absolute right-3 top-3 text-[10px] text-rose-500 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-full font-bold transition cursor-pointer" title="Remove Takeaway">🗑️</button>
                    <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Takeaway #{idx + 1}</span>
                    <div className="flex flex-col gap-1 pt-1">
                      <label className="text-[9px] font-bold text-neutral-400 uppercase">Insight Heading</label>
                      <input type="text" value={insight.heading} onChange={(e) => handleUpdateInsight(idx, 'heading', e.target.value)} className="text-xs p-2.5 border rounded-lg border-neutral-200 focus:border-blue-500 outline-none transition font-bold uppercase text-blue-600" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-neutral-400 uppercase">Narrative Body</label>
                      <textarea value={insight.body} onChange={(e) => handleUpdateInsight(idx, 'body', e.target.value)} className="text-xs p-2.5 border rounded-lg border-neutral-200 focus:border-blue-500 outline-none transition h-20 w-full resize-y font-normal" placeholder="Explain the detailed context..." />
                    </div>
                  </div>
                ))}
                {editState.insights.length === 0 && <p className="text-xs text-neutral-400 text-center py-4 italic">No insights compiled. Click "Add Takeaway" to append insights.</p>}
              </div>
            </div>
          </div>
        )}

        {/* REPORT VIEW (rich read-only render) */}
        {!loading && !error && validatedReport && !isEditing && (
          <div className="space-y-8 max-w-[800px] mx-auto animate-fade-in">

            {/* ── Report Header ── */}
            <div className="bg-white border border-neutral-200 p-5 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1 bg-blue-50 text-[#1d4ed8] px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border border-blue-100">
                  Live Report · {validatedReport.date || '2026'}
                </span>
              </div>
              <h2 className="text-[17px] font-extrabold text-neutral-800 tracking-tight leading-snug">{validatedReport.title}</h2>
              <p className="text-[12px] text-neutral-500 font-medium mt-1">{validatedReport.subtitle}</p>
            </div>

            {/* ── Executive Summary ── */}
            <div className="bg-[#FAF6F0] border border-[#EBE3D5] p-5 rounded-xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#EBE3D5]/20 to-transparent rounded-bl-full pointer-events-none"></div>
              <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">EXECUTIVE SUMMARY</h4>
              <div className="space-y-2">
                {validatedReport.summary.split('\n').filter(p => p.trim()).map((para, i) => (
                  <p key={i} className="text-[12px] text-neutral-700 leading-[1.75] font-normal italic">{para}</p>
                ))}
              </div>
            </div>

            {/* ── Key Metrics ── */}
            {validatedReport.keyMetrics && validatedReport.keyMetrics.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3 pl-1">KEY PERFORMANCE METRICS</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {validatedReport.keyMetrics.map((metric, i) => (
                    <MetricCard key={i} label={metric.label} value={metric.value} trend={metric.trend} note={metric.note} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Profiles ── */}
            {validatedReport.profiles && validatedReport.profiles.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4 pl-1">DETAILED PROFILES</h4>
                <div className="space-y-5">
                  {validatedReport.profiles.map((profile, i) => (
                    <div key={i} className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
                      {/* Profile header */}
                      <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100 bg-gradient-to-r from-white to-[#f8f8fd]">
                        <div
                          style={{ width: 32, height: 32, minWidth: 32, borderRadius: '50%', background: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13 }}
                        >
                          {profile.rank || i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[15px] font-bold text-neutral-900 leading-tight block truncate">{profile.name}</span>
                        </div>
                        {profile.category && (
                          <span style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', border: '1px solid #bfdbfe' }}>
                            {profile.category}
                          </span>
                        )}
                      </div>

                      <div className="p-5 space-y-4">
                        {/* Stats row */}
                        {profile.stats && profile.stats.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {profile.stats.map((stat, si) => (
                              <div
                                key={si}
                                style={{ background: '#f8f8f6', border: '1px solid #e5e5e0', borderRadius: 8, padding: '8px 14px', minWidth: 90 }}
                              >
                                <div style={{ fontSize: 11, color: '#888', fontWeight: 600, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{stat.value}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Description */}
                        {profile.description && (
                          <div className="space-y-1.5">
                            {profile.description.split('\n').filter(p => p.trim()).map((para, pi) => (
                              <p key={pi} style={{ fontSize: 13, color: '#444', lineHeight: 1.65, margin: 0 }}>{para}</p>
                            ))}
                          </div>
                        )}

                        {/* Strengths + Major Players */}
                        {(profile.keyStrengths?.length > 0 || profile.majorPlayers?.length > 0) && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {profile.keyStrengths?.length > 0 && (
                              <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Key Strengths</div>
                                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                  {profile.keyStrengths.map((s, si) => (
                                    <li key={si} style={{ fontSize: 12, color: '#333', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                      <span style={{ color: '#1d4ed8', fontWeight: 800, marginTop: 1, flexShrink: 0 }}>▸</span>
                                      <span>{s}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {profile.majorPlayers?.length > 0 && (
                              <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Major Players</div>
                                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                  {profile.majorPlayers.map((p, pi) => (
                                    <li key={pi} style={{ fontSize: 12, color: '#333', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                      <span style={{ color: '#1d4ed8', fontWeight: 800, marginTop: 1, flexShrink: 0 }}>▸</span>
                                      <span>{p}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Chart ── */}
            {validatedReport.chart && validatedReport.chart.bars && validatedReport.chart.bars.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3 pl-1">GRAPHICAL CORRELATIONS</h4>
                <BarChart title={validatedReport.chart.title} bars={validatedReport.chart.bars} />
              </div>
            )}

            {/* ── Comparison Table ── */}
            {validatedReport.comparisonTable && validatedReport.comparisonTable.columns.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3 pl-1">
                  {validatedReport.comparisonTable.title.toUpperCase()}
                </h4>
                <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #e5e5e0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#1e2761' }}>
                        <th style={{ padding: '10px 14px', textAlign: 'left', color: '#fff', fontWeight: 700, fontSize: 11, letterSpacing: '0.04em' }}>
                          Entity
                        </th>
                        {validatedReport.comparisonTable.columns.map((col, ci) => (
                          <th key={ci} style={{ padding: '10px 14px', textAlign: 'center', color: '#fff', fontWeight: 700, fontSize: 11, letterSpacing: '0.04em' }}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {validatedReport.comparisonTable.rows.map((row, ri) => (
                        <tr key={ri} style={{ background: ri % 2 === 0 ? '#fff' : '#f8f8f6', borderBottom: '1px solid #e5e5e0' }}>
                          <td style={{ padding: '10px 14px', fontWeight: 700, color: '#111', textAlign: 'left' }}>{row.label}</td>
                          {row.values.map((val, vi) => (
                            <td key={vi} style={{ padding: '10px 14px', textAlign: 'center', color: '#444' }}>{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Trends ── */}
            {validatedReport.trends && validatedReport.trends.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4 pl-1">KEY TRENDS & OUTLOOK</h4>
                <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
                  {validatedReport.trends.map((trend, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 14, padding: '18px 20px',
                        borderBottom: i < validatedReport.trends.length - 1 ? '1px solid #e5e5e0' : 'none'
                      }}
                    >
                      <div style={{
                        width: 28, height: 28, minWidth: 28, borderRadius: '50%',
                        background: '#1d4ed8', color: '#fff', fontWeight: 800, fontSize: 13,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2
                      }}>
                        {trend.number || i + 1}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 5 }}>{trend.heading}</div>
                        <p style={{ fontSize: 13, color: '#444', lineHeight: 1.65, margin: 0 }}>{trend.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Insights ── */}
            {validatedReport.insights && validatedReport.insights.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3 pl-1">STRATEGIC INSIGHTS</h4>
                <div className="space-y-3">
                  {validatedReport.insights.map((insight, i) => (
                    <InsightBlock key={i} heading={insight.heading} body={insight.body} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Methodology ── */}
            {validatedReport.methodology && (
              <div style={{ borderTop: '1px solid #e5e5e0', paddingTop: 16, marginTop: 8 }}>
                <p style={{ fontSize: 11, color: '#888', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
                  <strong style={{ fontWeight: 700, color: '#aaa' }}>Methodology & Sources: </strong>
                  {validatedReport.methodology}
                </p>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Floating Save Bar (edit mode) */}
      {!loading && !error && isEditing && editState && (
        <div className="absolute bottom-0 left-0 right-0 h-[70px] bg-white border-t border-neutral-200 px-6 flex items-center justify-end gap-3 z-30 shadow-lg">
          <button onClick={handleCancelEdit} className="text-xs font-semibold text-neutral-600 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 hover:border-neutral-300 rounded-lg px-4 py-2 transition cursor-pointer">Cancel</button>
          <button onClick={handleSaveEdit} className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-5 py-2 shadow transition cursor-pointer">Save Changes</button>
        </div>
      )}

    </div>
  );
}
