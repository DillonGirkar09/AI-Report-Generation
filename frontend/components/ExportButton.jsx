import { useState } from "react";

export default function ExportButton({ report, prompt }) {
  var [loading, setLoading] = useState(false);

  async function handleDownloadDocx() {
    setLoading(true);
    try {
      var body = report
        ? { report: report }
        : prompt
          ? { prompt: prompt }
          : null;

      if (!body) {
        throw new Error("No report data available to export");
      }

      var res = await fetch("http://localhost:3001/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(600000),
      });

      if (!res.ok) {
        var err = await res.json().catch(function() { return { error: "Export failed" }; });
        throw new Error(err.details || err.error || "Export failed");
      }

      var blob = await res.blob();
      var url = URL.createObjectURL(blob);

      var disposition = res.headers.get("content-disposition");
      var match = disposition && disposition.match(/filename="(.+?)"/);
      var filename = match
        ? decodeURIComponent(match[1])
        : (report?.title || "report").toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".docx";

      var a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Export failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownloadDocx}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs 
        font-medium rounded border transition-all
        bg-blue-600 border-blue-600 text-white hover:bg-blue-500
        disabled:opacity-50"
    >
      {loading ? "Generating DOCX…" : "Download DOCX"}
    </button>
  );
}
