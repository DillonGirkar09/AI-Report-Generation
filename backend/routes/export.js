const express = require("express");
const router = express.Router();
const { exportReport } = require("../services/reportExporter");

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

router.post("/export", async function(req, res) {
  var prompt = req.body.prompt;   // Option A: raw user prompt
  var report = req.body.report;   // Option B: report JSON

  if (!prompt && !report) {
    return res.status(400).json({ 
      error: "Either 'prompt' or 'report' is required" 
    });
  }

  try {
    console.log("[export] Generating DOCX (Full Report: " + !!prompt + ")");
    var startTime = Date.now();

    // Pass either the prompt string or the report object
    var input = prompt || report;
    var result = await exportReport(input);

    var elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log("[export] Done: " + result.filename + " (" + result.buffer.length + " bytes) in " + elapsed + "s");

    res.setHeader("Content-Type", DOCX_MIME);
    res.setHeader("Content-Disposition", 'attachment; filename="' + encodeURIComponent(result.filename) + '"');
    res.send(result.buffer);
  } catch (error) {
    console.error("[export] Failed:", error.message);
    res.status(500).json({ error: "Export failed", details: error.message });
  }
});

module.exports = router;
