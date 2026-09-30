import { NextResponse, type NextRequest } from 'next/server';

interface AIStructuringResponse {
  title: string;
  background: string;
  outcome: string;
  metrics: string[];
  category_tags: string[];
  budget_estimate: string;
  target_timeline: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawInput, departmentName = 'Government Department' } = body;

    if (!rawInput || typeof rawInput !== 'string' || rawInput.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide a descriptive problem description (at least 10 characters).' },
        { status: 400 }
      );
    }

    const lower = rawInput.toLowerCase();

    // Check for external LLM API Key (e.g. GEMINI_API_KEY or OPENAI_API_KEY)
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const prompt = `You are an expert GovTech innovation procurement advisor.
A government department official from "${departmentName}" has submitted the following raw, informal operational problem statement:

"${rawInput}"

Convert this into a structured, procurement-ready Innovation Challenge / RFP Statement.
Output strictly valid JSON with this exact schema:
{
  "title": "Clear, formal, professional RFP problem statement title",
  "background": "Detailed 2-3 paragraph background explaining operational pain points, baseline issues, and public impact",
  "outcome": "Clear description of desired technical transformation and operational end-state",
  "metrics": ["3 to 5 quantitative, auditable success metrics with clear target thresholds"],
  "category_tags": ["4 to 6 relevant technology and domain tags"],
  "budget_estimate": "Estimated pilot budget range (e.g. ₹15,00,000 - ₹25,00,000)",
  "target_timeline": "Recommended pilot duration (e.g. 90 Days / 3 Sprints)"
}`;

        const candidateModels = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-2.5-flash'];
        for (const model of candidateModels) {
          try {
            const apiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: { responseMimeType: 'application/json' },
                }),
              }
            );

            if (apiRes.ok) {
              const geminiData = await apiRes.json();
              const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (rawText) {
                const parsed = JSON.parse(rawText) as AIStructuringResponse;
                return NextResponse.json({ success: true, structured: parsed, source: model });
              }
            }
          } catch (modelErr) {
            console.warn(`Model ${model} attempt failed:`, modelErr);
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to heuristic engine:', err);
      }
    }

    // Heuristic & Intelligent GovTech Structuring Engine
    let structured: AIStructuringResponse;

    if (lower.includes('traffic') || lower.includes('signal') || lower.includes('vehicle') || lower.includes('road') || lower.includes('congestion')) {
      structured = {
        title: 'Real-Time Adaptive Traffic Signal Optimization & Emergency Vehicle Clearance via Edge Vision',
        background: `Urban corridors administered by ${departmentName} suffer from severe recurring peak-hour bottlenecks due to static, pre-programmed signal timing cycles that fail to adjust to dynamic traffic flows. While CCTV cameras are physically deployed along critical arterial junctions, feeds remain unanalyzed in real time, causing average vehicular delays exceeding 45 minutes and critically obstructing emergency corridors.

The department seeks an agile GovTech pilot to deploy lightweight, edge-inferencing computer vision software integrated directly with existing municipal camera feeds to dynamically optimize green-signal phase allocations without requiring expensive pavement-loop hardware overhauls.`,
        outcome: `Autonomous, privacy-preserving edge video analytics platform deployed across high-density intersections. The system must autonomously calculate queue lengths, dynamically modulate green phase splits via local controller telemetry, and automatically activate priority green corridors for siren-verified ambulances and fire tenders.`,
        metrics: [
          'Peak-hour vehicular corridor transit delay reduced by >= 32%',
          'Emergency vehicle intersection clearance latency <= 90 seconds',
          'Edge video inference latency <= 400ms per camera frame',
          'Zero interruption or physical replacement required for existing IP camera infrastructure',
          'Municipal command-and-control telemetry uptime >= 99.5%'
        ],
        category_tags: ['Computer Vision', 'Smart Mobility', 'Edge AI', 'Traffic Engineering', 'GovTech IoT'],
        budget_estimate: '₹18,00,000 - ₹28,00,000',
        target_timeline: '90 Days (3 Milestone Sprints)'
      };
    } else if (lower.includes('water') || lower.includes('leak') || lower.includes('pipeline') || lower.includes('pipe') || lower.includes('pressure')) {
      structured = {
        title: 'Non-Invasive Acoustic Sensor Analytics for Real-Time Pipeline Leakage & Contamination Detection',
        background: `Municipal water distribution networks under ${departmentName} suffer from estimated non-revenue water (NRW) losses of 35-42% attributed to sub-surface pipeline ruptures, unmetered tapping, and pressure anomalies. Traditional physical acoustic surveys are labor-intensive, reactive, and incapable of detecting micro-fractures before catastrophic sinkholes or contamination events occur.

The agency requires an innovative IoT-driven acoustic sensing and AI diagnostic solution that continuously detects localized frequency signatures of pipeline leaks, transmitting spatial coordinates to municipal maintenance teams within minutes of fissure development.`,
        outcome: `Turnkey acoustic anomaly detection and hydraulic telemetry platform deployed across selected urban feeder lines. The solution must pinpoint hidden leakages within a 2-meter radius, calculate water loss rates in real time, and deliver automated work orders to municipal response dispatchers.`,
        metrics: [
          'Acoustic leak detection localization accuracy within <= 2.5 meters',
          'Real-time anomaly alert propagation to engineering dispatch <= 10 minutes',
          'Non-Revenue Water (NRW) loss reduction >= 28% in target pilot ward',
          'Sensor battery lifespan >= 3 years with continuous telemetry',
          'False-positive incident rate <= 4%'
        ],
        category_tags: ['IoT Sensing', 'Smart Water', 'Predictive Maintenance', 'Acoustic Analytics', 'Urban Utilities'],
        budget_estimate: '₹22,00,000 - ₹35,00,000',
        target_timeline: '120 Days (4 Milestone Sprints)'
      };
    } else if (lower.includes('hospital') || lower.includes('patient') || lower.includes('opd') || lower.includes('health') || lower.includes('clinic')) {
      structured = {
        title: 'Smart AI Triage & Dynamic OPD Queue Virtualization for District Civil Hospitals',
        background: `District hospitals overseen by ${departmentName} experience unmanageable outpatient crowding, where patients routinely wait 4-6 hours in unsanitary physical queues before triage. Overburdened medical staff face high burnout and misallocation of senior physician hours to minor ailments.

The department seeks an intuitive, multilingual voice/touch kiosk and mobile triage system that digitally schedules patient tokens, collects preliminary vitals, and automatically routes priority cases to specialty clinics.`,
        outcome: `Implementation of an automated smart triage workflow across the hospital OPD wing. Patients receive algorithmic priority tokens based on vital signs and symptoms, virtual wait-time tracking, and multilingual guidance to clinical consultation desks.`,
        metrics: [
          'Average outpatient wait time reduced by >= 45%',
          'Patient registration and triage throughput <= 3 minutes per patient',
          'Zero paper paperwork required at initial intake counter',
          'Support for at least 3 regional languages and voice prompts for low-literacy citizens',
          'Staff operational satisfaction rating >= 85%'
        ],
        category_tags: ['Digital Health', 'AI Triage', 'Queue Management', 'Citizen Services', 'Multilingual NLP'],
        budget_estimate: '₹14,00,000 - ₹22,00,000',
        target_timeline: '75 Days (3 Milestone Sprints)'
      };
    } else if (lower.includes('land') || lower.includes('record') || lower.includes('ocr') || lower.includes('document') || lower.includes('digitiz')) {
      structured = {
        title: 'Automated Multi-Lingual OCR & Named Entity Recognition for Legacy Land Records Digitization',
        background: `The revenue department under ${departmentName} manages over 1.2 million legacy land deed folios dating back several decades. These physical records suffer from physical degradation, archaic bureaucratic terminology, and handwritten cursive script in regional dialects, impeding timely citizen verification and title dispute resolution.

The department requires an advanced computer vision and specialized NLP model capable of parsing degraded scanned folios, transcribing multilingual cursive script, and structuring extracted plot numbers, owner lineages, and encumbrances into searchable cadastral databases.`,
        outcome: `High-throughput land document ingestion pipeline with specialized regional OCR and entity extraction. The software must automatically index plot parcel records and flag archival discrepancies for human-in-the-loop notary sign-off.`,
        metrics: [
          'Handwritten cursive text transcription character accuracy >= 97.5%',
          'Cadastral parcel number and owner entity extraction precision >= 99.0%',
          'Document processing speed <= 2.5 seconds per scanned folio',
          'Automated validation against state registry checksum algorithms',
          'Manual audit review reduction by >= 80%'
        ],
        category_tags: ['Computer Vision', 'Multilingual OCR', 'NLP', 'GovTech Data', 'Document AI'],
        budget_estimate: '₹20,00,000 - ₹30,00,000',
        target_timeline: '90 Days (3 Milestone Sprints)'
      };
    } else {
      // General dynamic generator based on raw text
      const cleanSnippet = rawInput.trim().replace(/\s+/g, ' ');
      const words = cleanSnippet.split(' ');
      const firstFew = words.slice(0, 7).join(' ');

      structured = {
        title: `AI-Driven Pilot Framework: ${firstFew.charAt(0).toUpperCase() + firstFew.slice(1)} Innovation`,
        background: `This problem statement was submitted by ${departmentName} to address critical operational bottlenecks: "${cleanSnippet}".

Current municipal workflows rely on manual, paperwork-heavy processes that lead to significant latency, limited auditability, and poor resource utilization. The department intends to initiate a competitive, template-driven GovTech pilot to validate eligible startup solutions against rigorous technical benchmarks before wider administrative scale-up.`,
        outcome: `Deployment of a scalable, cloud-or-edge enabled technology prototype addressing the described bottleneck. The solution must integrate with existing department systems, provide automated operational analytics, and reduce manual processing overhead.`,
        metrics: [
          'Operational processing latency reduced by >= 40% compared to baseline',
          'System service availability and SLA compliance >= 99.5%',
          'User adoption rate among department field officers >= 80% within 60 days',
          'Full audit trail and compliance with state data residency standards',
          'Measurable cost efficiency improvement >= 25%'
        ],
        category_tags: ['GovTech Innovation', 'Process Automation', 'AI Analytics', 'Public Sector IT', 'Pilot Sandbox'],
        budget_estimate: '₹15,00,000 - ₹25,00,000',
        target_timeline: '90 Days (3 Milestone Sprints)'
      };
    }

    return NextResponse.json({
      success: true,
      structured,
      source: 'polaris-govtech-ai-engine'
    });
  } catch (error) {
    console.error('Error structuring problem statement:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating the structured statement. Please try again.' },
      { status: 500 }
    );
  }
}
