import type { ProblemStatement } from '@/types/database';
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client';

export const SEEDED_PROBLEM_STATEMENTS: ProblemStatement[] = [
  {
    id: 'ps-201',
    department_id: 'dept-101-verified',
    department_name: 'Ministry of Housing & Urban Affairs (Smart Cities Mission)',
    raw_input: 'Our city water distribution network is losing huge volumes of potable water every day. We estimate almost 40% never reaches households because of underground pipe cracks and leaks. Currently our engineers only find leaks when water literally floods up through the tarmac or citizens lodge complaints. We need acoustic sensors or AI sound analysis on pipes that can catch leaks within hours instead of weeks, without digging up the whole road.',
    title: 'Non-Invasive Acoustic Sensor Analytics for Real-Time Pipeline Leakage Detection',
    background: 'Municipal water distribution networks suffer from non-revenue water (NRW) losses of 35-42% attributed to sub-surface pipeline ruptures, unmetered tapping, and pressure anomalies. Traditional physical acoustic surveys are labor-intensive, reactive, and incapable of detecting micro-fractures before catastrophic pavement subsidence or contamination events occur.\n\nThe agency requires an innovative IoT-driven acoustic sensing and AI diagnostic solution that continuously detects localized frequency signatures of pipeline leaks, transmitting spatial coordinates to municipal maintenance teams within minutes of fissure development.',
    outcome: 'Turnkey acoustic anomaly detection and hydraulic telemetry platform deployed across selected urban feeder lines. The solution must pinpoint hidden leakages within a 2-meter radius, calculate water loss rates in real time, and deliver automated work orders to municipal response dispatchers.',
    metrics: [
      'Acoustic leak detection localization accuracy within <= 2.5 meters',
      'Real-time anomaly alert propagation to engineering dispatch <= 10 minutes',
      'Non-Revenue Water (NRW) loss reduction >= 28% in target pilot ward',
      'Sensor battery lifespan >= 3 years with continuous telemetry',
      'False-positive incident rate <= 4%',
    ],
    category_tags: ['IoT Sensing', 'Smart Water', 'Predictive Maintenance', 'Acoustic Analytics', 'Urban Utilities'],
    status: 'matching',
    budget_estimate: '₹22,00,000 - ₹35,00,000',
    target_timeline: '120 Days (4 Milestone Sprints)',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'ps-101',
    department_id: 'dept-101-verified',
    department_name: 'Ministry of Electronics & Information Technology',
    raw_input: 'Major intersections on the arterial corridors have huge traffic snarls during peak office hours. The signals are set on static 90 second timers regardless of whether 100 cars or 5 cars are queued up. We have existing HD surveillance cameras installed at all these junctions, but nobody is using the live video to automatically adjust the green lights. Also ambulances frequently get stuck in the gridlock.',
    title: 'Edge AI Video Analytics for Automated Traffic Signal Optimization & Emergency Corridors',
    background: 'Corridors administered by the department suffer from recurring peak-hour vehicular delays exceeding 45 minutes due to fixed-timer traffic controllers. While municipal IP cameras are installed across major junctions, video feeds remain siloed.\n\nThe department seeks an edge-inferencing computer vision pilot integrated with existing camera feeds to dynamically optimize green-signal phase splits and automatically trigger emergency green corridors for verified emergency vehicles.',
    outcome: 'Autonomous edge video analytics platform deployed across high-density intersections. The system autonomously calculates queue lengths, dynamically modulates green phase splits via local controller telemetry, and automatically activates priority green corridors for siren-verified ambulances and emergency responders.',
    metrics: [
      'Peak-hour corridor transit delay reduced by >= 32%',
      'Emergency vehicle intersection clearance latency <= 90 seconds',
      'Edge video inference latency <= 400ms per camera frame',
      'Zero physical replacement required for existing IP camera infrastructure',
      'Telemetry uptime >= 99.5%',
    ],
    category_tags: ['Computer Vision', 'Smart Mobility', 'Edge AI', 'Traffic Optimization'],
    status: 'published',
    budget_estimate: '₹18,00,000 - ₹28,00,000',
    target_timeline: '90 Days (3 Milestone Sprints)',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'ps-301',
    department_id: 'dept-101-verified',
    department_name: 'Department of Land Resources',
    raw_input: 'We have over a million old physical land revenue deed folios written in Urdu, Modi script and old regional cursive that are disintegrating in archives. Citizens need certified land ownership extracts and resolving title disputes takes months because clerks have to manually search through crumbling paper books. Standard OCR tools fail completely on cursive and degraded paper.',
    title: 'Automated Multi-Lingual OCR & Named Entity Recognition for Legacy Land Records Digitization',
    background: 'The revenue department manages over 1.2 million legacy land deed folios dating back decades. These physical records suffer from degradation, archaic bureaucratic terminology, and handwritten cursive script in regional dialects, impeding timely citizen verification and title dispute resolution.\n\nThe department requires an advanced computer vision and specialized NLP model capable of parsing degraded scanned folios, transcribing multilingual cursive script, and structuring extracted plot numbers, owner lineages, and encumbrances into searchable cadastral databases.',
    outcome: 'High-throughput land document ingestion pipeline with specialized regional OCR and entity extraction. The software must automatically index plot parcel records and flag archival discrepancies for human-in-the-loop notary sign-off.',
    metrics: [
      'Handwritten cursive text transcription character accuracy >= 97.5%',
      'Cadastral parcel number and owner entity extraction precision >= 99.0%',
      'Document processing speed <= 2.5 seconds per scanned folio',
      'Automated validation against state registry checksum algorithms',
      'Manual audit review reduction by >= 80%',
    ],
    category_tags: ['Computer Vision', 'Multilingual OCR', 'NLP', 'GovTech Data', 'Document AI'],
    status: 'published',
    budget_estimate: '₹20,00,000 - ₹30,00,000',
    target_timeline: '90 Days (3 Milestone Sprints)',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
];

const LOCAL_STORAGE_PS_KEY = 'polaris_problem_statements_store';

export function getAllProblemStatements(): ProblemStatement[] {
  if (typeof window === 'undefined') {
    return SEEDED_PROBLEM_STATEMENTS;
  }

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_PS_KEY);
    if (!stored) {
      localStorage.setItem(LOCAL_STORAGE_PS_KEY, JSON.stringify(SEEDED_PROBLEM_STATEMENTS));
      return SEEDED_PROBLEM_STATEMENTS;
    }
    return JSON.parse(stored);
  } catch {
    return SEEDED_PROBLEM_STATEMENTS;
  }
}

export function getProblemStatementById(id: string): ProblemStatement | undefined {
  const all = getAllProblemStatements();
  return all.find(ps => ps.id === id);
}

export async function saveProblemStatement(statement: ProblemStatement): Promise<{ success: boolean; data?: ProblemStatement; error?: string }> {
  // If live Supabase is configured, attempt write to Supabase
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const insertPayload = {
        id: statement.id,
        department_id: statement.department_id,
        raw_input: statement.raw_input,
        title: statement.title,
        background: statement.background,
        outcome: statement.outcome,
        metrics: statement.metrics,
        category_tags: statement.category_tags,
        status: statement.status,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('problem_statements') as any)
        .insert(insertPayload)
        .select()
        .single();

      if (error) {
        console.warn('Supabase problem statement insert failed, falling back to local registry:', error);
      } else if (data) {
        // Also persist locally for fast UI responsiveness
        const currentList = getAllProblemStatements();
        const updated = [statement, ...currentList.filter(p => p.id !== statement.id)];
        localStorage.setItem(LOCAL_STORAGE_PS_KEY, JSON.stringify(updated));
        return { success: true, data: statement };
      }
    } catch (err) {
      console.warn('Error inserting to Supabase:', err);
    }
  }

  // Local Storage persistence
  try {
    const currentList = getAllProblemStatements();
    const updated = [statement, ...currentList.filter(p => p.id !== statement.id)];
    localStorage.setItem(LOCAL_STORAGE_PS_KEY, JSON.stringify(updated));
    return { success: true, data: statement };
  } catch {
    return { success: false, error: 'Failed to persist problem statement locally.' };
  }
}

export function updateProblemStatementStatus(id: string, newStatus: ProblemStatement['status']): boolean {
  try {
    const list = getAllProblemStatements();
    const updated = list.map(p => {
      if (p.id === id) {
        return { ...p, status: newStatus, updated_at: new Date().toISOString() };
      }
      return p;
    });
    localStorage.setItem(LOCAL_STORAGE_PS_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}
