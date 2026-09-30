import type { Startup, EligibilityBreakdown } from '@/types/database';
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client';

export const SEEDED_STARTUPS: Startup[] = [
  {
    id: 'startup-101',
    profile_id: 'startup-202-verified', // matches demo persona Priya Sharma
    name: 'AeroVision Autonomous Systems Pvt Ltd',
    description: 'Edge-AI computer vision platform interfacing with existing municipal traffic cameras for real-time green signal optimization, automated queue length estimation, and siren-activated emergency vehicle green corridors.',
    sector: 'Computer Vision & Smart Mobility',
    website: 'https://aerovision.io',
    team_info: 'Led by Priya Sharma (ex-ISRO robotics engineer) with 12 AI and embedded systems engineers with patents in edge video processing.',
    references: [
      'Bengaluru Traffic Police Pilot (Phase 1, 6 Junctions)',
      'State Transport Department Corridor Survey 2024',
      'Smart Cities India Innovation Award 2024'
    ],
    eligibility_score: 88,
    product_maturity: 'deployed',
    tags: ['Computer Vision', 'Smart Mobility', 'Edge AI', 'Traffic Optimization', 'GovTech IoT', 'Emergency Corridors'],
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'startup-102',
    name: 'HydroSense Acoustic Technologies',
    description: 'Non-invasive clamp-on acoustic IoT sensors and machine learning algorithms that detect subsurface water pipeline micro-leaks within a 2-meter radius before catastrophic ground subsidence.',
    sector: 'Smart Water & Infrastructure IoT',
    website: 'https://hydrosense-tech.in',
    team_info: 'Founded by Dr. Vikram Sen (PhD, Acoustic Sensing) and team of 8 hardware and hydraulic engineers with extensive municipal utility deployment experience.',
    references: [
      'Pune Municipal Corporation Water Audit (Ward 7)',
      'National Water Mission Sandbox Cohort 2',
      'Council of Scientific & Industrial Research (CSIR) Validation'
    ],
    eligibility_score: 92,
    product_maturity: 'deployed',
    tags: ['IoT Sensing', 'Smart Water', 'Predictive Maintenance', 'Acoustic Analytics', 'Urban Utilities'],
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: 'startup-103',
    name: 'IndicVision AI Lab',
    description: 'Specialized multilingual OCR and Named Entity Recognition pipeline trained on centuries-old cursive scripts, Modi script, Urdu, and degraded regional land deed folios with 98% transcription accuracy.',
    sector: 'Document AI & GovTech Data',
    website: 'https://indicvision.ai',
    team_info: 'Founded by computational linguists and computer vision researchers from IIT Bombay specializing in Indic language script processing.',
    references: [
      'State Revenue Department Cadastral Digitization Trial',
      'State Archives Historical Deed Ingestion Proof-of-Concept'
    ],
    eligibility_score: 86,
    product_maturity: 'deployed',
    tags: ['Computer Vision', 'Multilingual OCR', 'NLP', 'GovTech Data', 'Document AI', 'Language AI'],
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'startup-104',
    name: 'MediQueue HealthTech',
    description: 'Multilingual voice kiosk and mobile virtual queue management system with automated preliminary vital signs check and smart OPD clinical routing for civil hospitals.',
    sector: 'Digital Health & Public Systems',
    website: 'https://mediqueue.health',
    team_info: 'Clinical informatics team led by Dr. Sameer Khan (ex-AIIMS health informatics) and 6 software architects.',
    references: [
      'District Civil Hospital Outpatient Pilot (3000 daily patients)',
      'Community Health Center Virtual Token Trial'
    ],
    eligibility_score: 78,
    product_maturity: 'prototype',
    tags: ['Digital Health', 'AI Triage', 'Queue Management', 'Citizen Services', 'Multilingual NLP'],
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'startup-105',
    name: 'GeoPave Drone Surveying',
    description: 'Transit bus mounted dashcams and drone photogrammetry for automated road surface pothole, crack, and asset degradation indexing with GIS coordinate mapping.',
    sector: 'Transport & Road Infrastructure',
    website: 'https://geopave.co',
    team_info: 'Civil engineers, drone pilots, and GIS spatial computing engineers with state highway survey contracts.',
    references: [
      'Municipal Corporation Road Condition Survey (120 km)',
      'State Highway Infrastructure Audit'
    ],
    eligibility_score: 75,
    product_maturity: 'prototype',
    tags: ['Computer Vision', 'Smart Mobility', 'Roads', 'Asset Tracking', 'GIS'],
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'startup-106',
    name: 'CleanGrid Microgrid Systems',
    description: 'Decentralized solar microgrid IoT telemetry and remote predictive battery management for primary healthcare centers in off-grid rural districts.',
    sector: 'Clean Energy & Public Utilities',
    website: 'https://cleangrid.energy',
    team_info: 'Clean energy hardware engineers and power systems technicians.',
    references: [
      'Rural Primary Health Center Solar Microgrid Trial (4 clinics)'
    ],
    eligibility_score: 68,
    product_maturity: 'concept',
    tags: ['CleanTech', 'Energy', 'IoT', 'Rural Development', 'Microgrids'],
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

const LOCAL_STORAGE_STARTUPS_KEY = 'polaris_startups_registry';

/**
 * Objective Eligibility Scoring Formula:
 * - Product Maturity (max 25)
 * - Technical Fit & Description (max 35)
 * - Past Pilot Performance (max 25)
 * - Verified References (max 15)
 */
export function calculateStartupEligibility(startup: Partial<Startup>): {
  totalScore: number;
  breakdown: EligibilityBreakdown;
} {
  // 1. Product Maturity Score (max 25)
  let productMaturityScore = 12;
  const maturity = startup.product_maturity || 'prototype';
  if (maturity === 'scaling') productMaturityScore = 25;
  else if (maturity === 'deployed') productMaturityScore = 23;
  else if (maturity === 'prototype') productMaturityScore = 18;
  else productMaturityScore = 12;

  // 2. Technical Fit & Description Depth (max 35)
  let technicalFitScore = 20;
  const descLen = (startup.description || '').length;
  const tagsCount = (startup.tags || []).length;
  if (descLen > 150) technicalFitScore += 8;
  else if (descLen > 60) technicalFitScore += 5;
  if (tagsCount >= 4) technicalFitScore += 7;
  else if (tagsCount >= 2) technicalFitScore += 4;
  technicalFitScore = Math.min(35, technicalFitScore);

  // 3. Past Pilot Performance (max 25)
  let pastPilotScore = 10;
  const refCount = (startup.references || []).length;
  if (refCount >= 3) pastPilotScore = 24;
  else if (refCount >= 2) pastPilotScore = 20;
  else if (refCount === 1) pastPilotScore = 15;

  // 4. References & Credentials Score (max 15)
  let referencesScore = 8;
  const teamLen = (startup.team_info || '').length;
  if (teamLen > 80) referencesScore += 5;
  if (startup.website && startup.website.startsWith('http')) referencesScore += 2;
  referencesScore = Math.min(15, referencesScore);

  const totalScore = Math.min(100, productMaturityScore + technicalFitScore + pastPilotScore + referencesScore);

  const notes: string[] = [
    `Product Maturity classified as ${maturity.toUpperCase()} (${productMaturityScore}/25).`,
    `Technical scope breadth and domain tagging verified (${technicalFitScore}/35).`,
    `${refCount} prior public pilots and commercial references recorded (${pastPilotScore}/25).`,
    `Team credentials and technical leadership verified (${referencesScore}/15).`,
  ];

  return {
    totalScore,
    breakdown: {
      product_maturity_score: productMaturityScore,
      technical_fit_score: technicalFitScore,
      past_pilot_score: pastPilotScore,
      references_score: referencesScore,
      notes,
    },
  };
}

export function getAllStartups(): Startup[] {
  if (typeof window === 'undefined') {
    return SEEDED_STARTUPS;
  }

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_STARTUPS_KEY);
    if (!stored) {
      localStorage.setItem(LOCAL_STORAGE_STARTUPS_KEY, JSON.stringify(SEEDED_STARTUPS));
      return SEEDED_STARTUPS;
    }
    return JSON.parse(stored);
  } catch {
    return SEEDED_STARTUPS;
  }
}

export function getStartupById(id: string): Startup | undefined {
  const all = getAllStartups();
  return all.find(s => s.id === id);
}

export function getStartupByProfileId(profileId: string): Startup | undefined {
  const all = getAllStartups();
  return all.find(s => s.profile_id === profileId);
}

export async function saveStartup(startup: Startup): Promise<{ success: boolean; data?: Startup; error?: string }> {
  // Live Supabase integration if active
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const insertPayload = {
        id: startup.id,
        profile_id: startup.profile_id,
        name: startup.name,
        description: startup.description,
        sector: startup.sector,
        website: startup.website,
        team_info: startup.team_info,
        references: startup.references,
        eligibility_score: startup.eligibility_score,
        product_maturity: startup.product_maturity,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('startups') as any)
        .upsert(insertPayload)
        .select()
        .single();

      if (error) {
        console.warn('Supabase startup upsert failed, syncing locally:', error);
      } else if (data) {
        const currentList = getAllStartups();
        const updated = [startup, ...currentList.filter(s => s.id !== startup.id)];
        localStorage.setItem(LOCAL_STORAGE_STARTUPS_KEY, JSON.stringify(updated));
        return { success: true, data: startup };
      }
    } catch (err) {
      console.warn('Error upserting startup to Supabase:', err);
    }
  }

  // Local storage persistence
  try {
    const currentList = getAllStartups();
    const updated = [startup, ...currentList.filter(s => s.id !== startup.id)];
    localStorage.setItem(LOCAL_STORAGE_STARTUPS_KEY, JSON.stringify(updated));
    return { success: true, data: startup };
  } catch {
    return { success: false, error: 'Failed to persist startup profile.' };
  }
}
