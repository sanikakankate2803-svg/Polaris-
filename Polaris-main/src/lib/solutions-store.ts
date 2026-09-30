import type { ValidationReport } from '@/types/database';
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client';
import { getPilotById } from '@/lib/pilots-store';

export interface CertifiedSolution {
  id: string;
  pilot_id: string;
  title: string;
  tagline: string;
  sector: string;
  vendor_name: string;
  vendor_website?: string;
  product_maturity: string;
  originating_department: string;
  pilot_budget: number;
  pilot_timeline: string;
  metrics_achieved: string[];
  scale_up_readiness_score: number;
  validator_name: string;
  validation_date: string;
  audit_summary: string;
  adoption_count: number;
  tags: string[];
}

export const SEEDED_CERTIFIED_SOLUTIONS: CertifiedSolution[] = [
  {
    id: 'sol-101',
    pilot_id: 'pilot-seeded-ocr',
    title: 'Optical OCR & Multi-Lingual NER for Land Records Digitization',
    tagline: 'Deep learning pipeline extracting historical land tenure records across regional scripts with 98.7% accuracy.',
    sector: 'Digital Land Governance & Civic AI',
    vendor_name: 'IndicVision AI',
    vendor_website: 'https://indicvision.ai',
    product_maturity: 'SCALING (TRL 9)',
    originating_department: 'Department of Land Resources',
    pilot_budget: 1600000,
    pilot_timeline: '90 Days (Completed)',
    metrics_achieved: [
      '98.7% OCR character recognition precision across Modi, Kaithi, and Urdu scripts',
      'Average document processing time under 380ms per folio sheet',
      'Zero sensitive citizen data leakage verified under STQC cybersecurity audit',
      'Automated georeferenced survey boundary extraction from cadastral maps',
    ],
    scale_up_readiness_score: 9.4,
    validator_name: 'Quality Council of India (QCI)',
    validation_date: '2026-02-15',
    audit_summary:
      'Rigorous 90-day sandbox trial conducted over 250,000 archival land deed scans. Meets all National Land Records Modernization Programme (NLRMP) technical specifications. Certified for state-wide procurement replication under fast-track provisions.',
    adoption_count: 4,
    tags: ['Land Governance', 'Computer Vision', 'OCR', 'NLRMP', 'STQC Audited'],
  },
  {
    id: 'sol-102',
    pilot_id: 'pilot-201',
    title: 'Sub-Surface Acoustic Leak Detection & Non-Revenue Water Telemetry',
    tagline: 'IoT acoustic noise logger and edge classifier isolating municipal pipe fractures within 1.8m accuracy.',
    sector: 'Smart Water & Municipal Utilities',
    vendor_name: 'HydroSense Acoustic Technologies',
    vendor_website: 'https://hydrosense-tech.io',
    product_maturity: 'DEPLOYED (TRL 8)',
    originating_department: 'Urban Water & Sewerage Board',
    pilot_budget: 1800000,
    pilot_timeline: '120 Days (Completed)',
    metrics_achieved: [
      '28.4% Non-Revenue Water (NRW) savings verified across pilot sector wards',
      'Pinpoint leak localization within 1.8 meters of subterranean fracture',
      '5-year lithium battery life verified under extreme high-moisture valve chambers',
      'Zero false alert dispatches over 60 consecutive operational days',
    ],
    scale_up_readiness_score: 9.1,
    validator_name: 'Standardisation Testing & Quality Certification (STQC)',
    validation_date: '2026-03-01',
    audit_summary:
      'Field deployment across 15km of pressurized feeder network verified 14 undetected pinhole leaks saving an estimated 420,000 liters daily. Hydraulic model interfaces seamlessly with SCADA control centers. Recommended for AMRUT 2.0 city adoptions.',
    adoption_count: 2,
    tags: ['Water Utilities', 'IoT', 'Acoustic Sensing', 'AMRUT 2.0', 'Leak Detection'],
  },
  {
    id: 'sol-103',
    pilot_id: 'pilot-101',
    title: 'Autonomous Edge AI Signal Preemption for Emergency Corridors',
    tagline: 'Real-time intersection video analytics dynamic phase optimization with automatic siren-verified green corridors.',
    sector: 'Smart Mobility & Intelligent Transit',
    vendor_name: 'AeroVision Autonomous Systems',
    vendor_website: 'https://aerovision.tech',
    product_maturity: 'DEPLOYED (TRL 8)',
    originating_department: 'Ministry of Electronics & IT (MeitY)',
    pilot_budget: 1250000,
    pilot_timeline: '90 Days (Completed)',
    metrics_achieved: [
      '34.2% Reduction in corridor transit delay across 6 critical arterial junctions',
      '98.2% Vehicle classification precision under rain, night, and glare illumination',
      'Sub-380ms edge inferencing latency verified on local signal controller units',
      'Zero false preemption overrides across 210 siren-detected emergency events',
    ],
    scale_up_readiness_score: 9.5,
    validator_name: 'Central Road Research Institute (CRRI) & QCI',
    validation_date: '2026-03-05',
    audit_summary:
      'Complete field benchmark across the ring road arterial corridor demonstrated robust edge video inference and flawless emergency vehicle transit clearance. Conforms to Indian Road Congress (IRC) intelligent traffic management codes. Ready for national Smart Cities deployment.',
    adoption_count: 3,
    tags: ['Smart Mobility', 'Edge AI', 'Emergency Preemption', 'Smart Cities', 'QCI Certified'],
  },
];

const LOCAL_STORAGE_SOLUTIONS_KEY = 'polaris_certified_solutions';
const LOCAL_STORAGE_VALIDATIONS_KEY = 'polaris_validation_reports';

export function getAllCertifiedSolutions(): CertifiedSolution[] {
  let solutions = SEEDED_CERTIFIED_SOLUTIONS;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_SOLUTIONS_KEY);
      if (stored) {
        solutions = JSON.parse(stored);
      } else {
        localStorage.setItem(LOCAL_STORAGE_SOLUTIONS_KEY, JSON.stringify(SEEDED_CERTIFIED_SOLUTIONS));
      }
    } catch {
      solutions = SEEDED_CERTIFIED_SOLUTIONS;
    }
  }
  return solutions;
}

export function getCertifiedSolutionById(id: string): CertifiedSolution | undefined {
  const all = getAllCertifiedSolutions();
  return all.find(s => s.id === id || s.pilot_id === id);
}

export function getAllValidationReports(): ValidationReport[] {
  let reports: ValidationReport[] = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_VALIDATIONS_KEY);
      if (stored) {
        reports = JSON.parse(stored);
      }
    } catch {
      reports = [];
    }
  }
  return reports;
}

export function getValidationReportByPilotId(pilotId: string): ValidationReport | undefined {
  const reports = getAllValidationReports();
  return reports.find(r => r.pilot_id === pilotId);
}

export async function submitValidationAudit(
  report: ValidationReport,
  solutionData?: Partial<CertifiedSolution>
): Promise<{ success: boolean; solutionId?: string; error?: string }> {
  // 1. Supabase persistence if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('validation_reports') as any).insert({
        id: report.id,
        pilot_id: report.pilot_id,
        validator_id: report.validator_id,
        findings: report.findings,
        metrics_achieved: report.metrics_achieved,
        scale_up_readiness_score: report.scale_up_readiness_score,
        decision: report.decision,
        created_at: report.created_at,
      });
    } catch (err) {
      console.warn('Supabase validation report failed, saving locally:', err);
    }
  }

  // 2. Local storage persistence for validation report
  try {
    const existingReports = getAllValidationReports();
    const updatedReports = [report, ...existingReports.filter(r => r.pilot_id !== report.pilot_id)];
    localStorage.setItem(LOCAL_STORAGE_VALIDATIONS_KEY, JSON.stringify(updatedReports));
  } catch (err) {
    console.error('Failed to save validation report locally:', err);
  }

  // 3. If decision is 'approve', mint and publish the Certified Solution to the Solutions Library
  let publishedSolutionId: string | undefined;
  if (report.decision === 'approve') {
    const pilot = getPilotById(report.pilot_id);
    const solutionId = `sol-${Date.now()}`;
    publishedSolutionId = solutionId;

    const newSolution: CertifiedSolution = {
      id: solutionId,
      pilot_id: report.pilot_id,
      title: solutionData?.title || pilot?.problem_statement?.title || 'Certified GovTech Solution',
      tagline:
        solutionData?.tagline ||
        pilot?.scope ||
        'Audited and verified public innovation solution approved for fast-track replication.',
      sector: solutionData?.sector || pilot?.startup?.sector || 'Civic Technology',
      vendor_name: solutionData?.vendor_name || pilot?.startup?.name || 'Verified Vendor',
      vendor_website: solutionData?.vendor_website || pilot?.startup?.website,
      product_maturity: 'SCALING (TRL 9)',
      originating_department:
        solutionData?.originating_department ||
        pilot?.problem_statement?.department_name ||
        'Government Department',
      pilot_budget: pilot?.budget || 1500000,
      pilot_timeline: pilot?.timeline || '90 Days (Completed)',
      metrics_achieved:
        solutionData?.metrics_achieved && solutionData.metrics_achieved.length > 0
          ? solutionData.metrics_achieved
          : pilot?.problem_statement?.metrics && pilot.problem_statement.metrics.length > 0
          ? pilot.problem_statement.metrics
          : ['Demonstrated >= 98% SLA target availability', 'Validated latency under 400ms', 'Zero compliance violations'],
      scale_up_readiness_score: report.scale_up_readiness_score,
      validator_name: report.validator_name || 'Quality Council of India (QCI)',
      validation_date: new Date().toISOString().split('T')[0],
      audit_summary: report.findings,
      adoption_count: 1,
      tags: solutionData?.tags || ['Certified Solution', 'Scale-Up Ready', 'QCI Audited'],
    };

    try {
      const existingSolutions = getAllCertifiedSolutions();
      const updatedSolutions = [newSolution, ...existingSolutions.filter(s => s.pilot_id !== report.pilot_id)];
      localStorage.setItem(LOCAL_STORAGE_SOLUTIONS_KEY, JSON.stringify(updatedSolutions));
    } catch (err) {
      console.error('Failed to publish certified solution locally:', err);
    }
  }

  return { success: true, solutionId: publishedSolutionId };
}

export function recordSolutionAdoption(solutionId: string): boolean {
  try {
    const solutions = getAllCertifiedSolutions();
    const updated = solutions.map(s => {
      if (s.id === solutionId) {
        return { ...s, adoption_count: s.adoption_count + 1 };
      }
      return s;
    });
    localStorage.setItem(LOCAL_STORAGE_SOLUTIONS_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}
