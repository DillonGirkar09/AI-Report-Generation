const express = require('express');
const router = express.Router();
const { Anthropic } = require('@anthropic-ai/sdk');

const SYSTEM_PROMPT = `You are an AI analyst embedded in a report panel. When the user asks for a report 
or data analysis, respond ONLY with a valid JSON object — no markdown, no preamble, 
no backticks.

The JSON must follow this exact schema:
{
  "title": "string",
  "subtitle": "string",
  "metrics": [
    { "label": "string", "value": "string", "trend": "up|down|neutral", "note": "string" }
  ],
  "chart": {
    "title": "string",
    "bars": [
      { "label": "string", "value": number, "max": number }
    ]
  },
  "insights": [
    { "heading": "string", "body": "string" }
  ],
  "summary": "string"
}

Rules:
- metrics: 3 to 4 items max
- chart.bars: 4 to 6 items, value and max must be numbers
- insights: 2 to 3 items
- Keep values concise e.g. $2.4B not $2,400,000,000
- Respond ONLY with the JSON object. No other text.`;

// Mock Report Generator to let the application run gracefully even if the user hasn't configured a valid API key yet
function getMockReport(promptText) {
  const query = (promptText || '').toLowerCase();
  
  if (query.includes('space') || query.includes('universe') || query.includes('satellite')) {
    return {
      title: "Space Tech Investment & Launch Analysis",
      subtitle: "Global data for private and public space endeavors",
      metrics: [
        { label: "Total Space Funding", value: "$48.2B", trend: "up", note: "18% YoY growth" },
        { label: "Active Satellites", value: "8,950", trend: "up", note: "72% low-earth orbit" },
        { label: "Launch Costs", value: "$1.5K/kg", trend: "down", note: "Reusable rockets impact" },
        { label: "Successful Missions", value: "98.4%", trend: "neutral", note: "Within target range" }
      ],
      chart: {
        title: "Space Tech Investment Leaders ($B)",
        bars: [
          { label: "United States", value: 24.5, max: 30 },
          { label: "China", value: 11.2, max: 30 },
          { label: "ESA (Europe)", value: 7.8, max: 30 },
          { label: "Japan", value: 3.1, max: 30 },
          { label: "India", value: 2.6, max: 30 }
        ]
      },
      insights: [
        { heading: "REUSABILITY REVOLUTION", body: "The dramatic cost decline of low-Earth orbit payloads is driven by vertical rocket landing technology, sparking massive constellation deployments." },
        { heading: "SOVEREIGN CONSTELLATIONS", body: "Governments globally are establishing dedicated communication nets, resulting in a spike in national security funding allocations." }
      ],
      summary: "The commercial space sector is undergoing a massive capital expansion phase, catalyzed by reusable launch systems and high-throughput satellite megaconstellations."
    };
  }
  
  if (query.includes('talent') || query.includes('hubs') || query.includes('workforce') || query.includes('education')) {
    return {
      title: "Global AI Talent & Hubs Analysis",
      subtitle: "Distribution of top-tier artificial intelligence researchers and engineers",
      metrics: [
        { label: "Global AI Talent Pool", value: "1.2M", trend: "up", note: "+35% from last year" },
        { label: "PhD Grads in AI", value: "24.5K", trend: "up", note: "Record university enrollments" },
        { label: "Remote AI Workers", value: "42%", trend: "down", note: "Return-to-office shifts" }
      ],
      chart: {
        title: "Top AI Talent Hubs (Thousands of Professionals)",
        bars: [
          { label: "San Francisco", value: 280, max: 300 },
          { label: "London", value: 140, max: 300 },
          { label: "Beijing", value: 195, max: 300 },
          { label: "Toronto", value: 95, max: 300 },
          { label: "Bengaluru", value: 160, max: 300 },
          { label: "Paris", value: 85, max: 300 }
        ]
      },
      insights: [
        { heading: "TALENT DENSITY PREMIUM", body: "The San Francisco Bay Area remains the absolute epicenter of high-end deep learning research, pulling in more than 40% of global venture funding for AI." },
        { heading: "EMERGING GLOBAL HUBS", body: "Bengaluru and Beijing are seeing explosive growth in applications development, with massive engineering workforces pivoting from web/mobile to generative models." }
      ],
      summary: "The artificial intelligence labor market is highly concentrated but expanding rapidly. Specialized talent remains the primary constraint for global tech firms looking to deploy frontier models."
    };
  }

  if (query.includes('industry') || query.includes('enterprise') || query.includes('business')) {
    return {
      title: "Enterprise AI Usage & Adoption Rates",
      subtitle: "Deployment of intelligent agents and automated pipelines across sectors",
      metrics: [
        { label: "Enterprise Adoption", value: "68%", trend: "up", note: "Active production usage" },
        { label: "Avg. ROI per Project", value: "4.2x", trend: "up", note: "Customer service & engineering" },
        { label: "Security Budget Allocation", value: "22%", trend: "up", note: "Guards against data leaks" }
      ],
      chart: {
        title: "AI Adoption Rate by Industry Sectors (%)",
        bars: [
          { label: "Tech & Software", value: 88, max: 100 },
          { label: "Finance", value: 74, max: 100 },
          { label: "Healthcare", value: 55, max: 100 },
          { label: "Manufacturing", value: 41, max: 100 },
          { label: "Retail", value: 63, max: 100 }
        ]
      },
      insights: [
        { heading: "INTELLIGENT AGENT RUNTIME", body: "Companies are moving from simple conversational RAG solutions to autonomous, multi-agent frameworks capable of executing multi-step business transactions." },
        { heading: "COMPLIANCE & ETHICS WALLS", body: "Strict EU AI Act requirements and localized privacy constraints are slowing health and finance rollouts, driving massive demand for locally run open-weight models." }
      ],
      summary: "Enterprise generative AI adoption has passed the early adopter phase. Companies are realizing strong returns in code generation and front-office automation, though regulatory compliance remains a hurdle."
    };
  }

  if (query.includes('fastest') || query.includes('rising') || query.includes('countries') || query.includes('growth')) {
    return {
      title: "Fastest Rising Tech Nations",
      subtitle: "Annual technology GDP and infrastructure expansion rankings",
      metrics: [
        { label: "Rising Star GDP Growth", value: "+8.4%", trend: "up", note: "Aggregated growth rate" },
        { label: "Internet Penetration", value: "79%", trend: "up", note: "Mobile-first digital boom" },
        { label: "FDI Tech Inflows", value: "$34B", trend: "up", note: "Venture capital shifting" }
      ],
      chart: {
        title: "Fastest Growing Tech GDPs (YoY %)",
        bars: [
          { label: "India", value: 12.4, max: 15 },
          { label: "Vietnam", value: 10.1, max: 15 },
          { label: "Brazil", value: 7.9, max: 15 },
          { label: "Indonesia", value: 9.3, max: 15 },
          { label: "Poland", value: 6.8, max: 15 }
        ]
      },
      insights: [
        { heading: "SOUTHEAST ASIA MOMENTUM", body: "Vietnam and Indonesia are capitalizing on supply-chain diversification, experiencing record levels of engineering talent graduation and foreign hardware manufacturing investments." },
        { heading: "POLISH SOFTWARE BOOM", body: "Poland has solidified its status as Europe's premier software engineering outsourcing powerhouse, driven by strong university programs and cost-effective high-quality developer talent." }
      ],
      summary: "Emerging markets are closing the digital divide at an accelerated rate, fueled by mobile-first infrastructure, strategic geopolitical positioning, and rich engineering talent pools."
    };
  }

  // Default: "AI adoption by country 2026" or fallback
  return {
    title: "AI Adoption & Investment by Country 2026",
    subtitle: "Global snapshot of infrastructure spending and commercial readiness",
    metrics: [
      { label: "Global AI Spending", value: "$320B", trend: "up", note: "42% YoY increase" },
      { label: "Sovereign AI Clusters", value: "45", trend: "up", note: "Gov-funded datacenters" },
      { label: "Commercial Model APIs", value: "98.9%", trend: "neutral", note: "Uptime and reliability" },
      { label: "GPU Chip Shortages", value: "Moderate", trend: "down", note: "Supply chain easing" }
    ],
    chart: {
      title: "AI Infrastructure Spending 2026 ($B)",
      bars: [
        { label: "United States", value: 145, max: 160 },
        { label: "China", value: 85, max: 160 },
        { label: "United Kingdom", value: 24, max: 160 },
        { label: "Germany", value: 18, max: 160 },
        { label: "Japan", value: 22, max: 160 },
        { label: "Singapore", value: 14, max: 160 }
      ]
    },
    insights: [
      { heading: "SOVEREIGN COMPUTE CLUSTERS", body: "Governments are pouring billions into domestic computing setups to protect national data sovereignty, creating a massive secondary market for local compute instances." },
      { heading: "CLOUD HYPERSCALER MONOPOLY", body: "The bulk of global investment is captured by three major US-based cloud hyperscalers, driving high concentration in compute access." }
    ],
    summary: "AI adoption continues its exponential expansion in 2026. Hardware supply chains are stabilizing, and national governments are increasingly funding specialized domestic AI hubs."
  };
}

// POST /api/report
router.post('/report', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Missing or invalid messages parameter" });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    const isMock = !apiKey || apiKey === '' || apiKey === 'your_key_here' || apiKey.startsWith('sk-ant-your');

    if (isMock) {
      console.warn("Backend: ANTHROPIC_API_KEY not configured or using default placeholder. Running in Mock Mode!");
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
      const queryText = lastUserMessage ? lastUserMessage.content : '';
      
      // Artificial slight delay to simulate AI processing (500ms - 1.2s)
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      const mockResult = getMockReport(queryText);
      return res.json({ report: mockResult });
    }

    // Call Anthropic API
    const anthropic = new Anthropic({ apiKey });
    
    // Format the messages for Anthropic API
    // Anthropic API expects messages to start with 'user' and alternate.
    // Also, we must map roles to 'user' or 'assistant'.
    const formattedMessages = messages.map(msg => {
      let content = msg.content;
      if (msg.role === 'assistant' && msg.reportPayload) {
        content = JSON.stringify(msg.reportPayload);
      }
      return {
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: content
      };
    });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: formattedMessages
    });

    if (!response || !response.content || response.content.length === 0) {
      throw new Error("Empty response from Anthropic API");
    }

    let responseText = response.content[0].text.trim();
    console.log("Raw Response received from Claude:", responseText);

    // Clean markdown code blocks from response if present
    if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    responseText = responseText.trim();

    const parsedJSON = JSON.parse(responseText);
    res.json({ report: parsedJSON });

  } catch (error) {
    console.error("Error in /api/report:", error);
    res.status(500).json({ error: "Failed to parse report", details: error.message });
  }
});

module.exports = router;
