import type { Pilot, MilestoneStatus, PaymentStatus } from '@/types/database';
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client';
import { getProblemStatementById } from '@/lib/problem-statements-store';
import { getStartupById } from '@/lib/startups-store';

export interface MilestoneDraft {
  milestone_number: number;
  title: string;
  description: string;
  due_date: string;
  payment_amount: number;
}

export function generatePilotId(): string {
  return `pilot-${Date.now()}`;
}

export function getFutureDateFormatted(daysFromNow: number): string {
  const d = new Date(Date.now() + daysFromNow * 86400000);
  return d.toISOString().split('T')[0];
}

export function getInitialMilestonesDraft(): MilestoneDraft[] {
  return [
    {
      milestone_number: 1,
      title: 'Infrastructure Stream Integration & Baseline Calibration',
      description: 'Physical sensor/camera hardware deployment, telemetry stream verification, and baseline data calibration.',
      due_date: getFutureDateFormatted(30),
      payment_amount: 450000,
    },
    {
      milestone_number: 2,
      title: 'Core Algorithm Benchmark & Mid-Term Verification',
      description: 'Demonstration of core predictive analytics / computer vision accuracy under live operating conditions meeting minimum SLA threshold.',
      due_date: getFutureDateFormatted(60),
      payment_amount: 550000,
    },
    {
      milestone_number: 3,
      title: 'Final Pilot Demonstration & Scale-Up Readiness Audit',
      description: 'Full automated operational deployment with complete audit logs submitted for third-party validation certification.',
      due_date: getFutureDateFormatted(90),
      payment_amount: 500000,
    },
  ];
}

export const SEEDED_PILOTS: Pilot[] = [
  {
    id: 'pilot-101',
    problem_statement_id: 'ps-101',
    startup_id: 'startup-101',
    department_id: 'dept-101-verified',
    scope: 'Deployment of edge video analytics on 6 critical municipal intersections along the outer ring road corridor. System will interface with local signal controllers to dynamically adjust phase duration based on real-time vehicle queues and create green corridors for siren-verified emergency vehicles.',
    timeline: '90 Days (3 Milestone Sprints)',
    budget: 1250000,
    status: 'active',
    created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
    milestones: [
      {
        id: 'ms-101-1',
        pilot_id: 'pilot-101',
        milestone_number: 1,
        title: 'Corridor Baseline Calibration & Camera Stream Integration',
        description: 'Physical integration of RTSP video streams from 12 IP surveillance cameras across 6 arterial junctions into local edge compute units. Latency verification under 400ms.',
        due_date: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
        status: 'approved',
        payment_amount: 400000,
        payment_status: 'paid',
        deliverable_url: 'https://polaris.gov/deliverables/pilot-101/Phase_1_Calibration_Report_Signed.pdf',
        deliverable_filename: 'Phase_1_Calibration_Report_Signed.pdf',
        submission_notes: 'All 12 camera streams integrated successfully. RTSP latency benchmarked at 320ms average. Edge telemetry online.',
        feedback: 'Approved by MeitY procurement committee. Payment of ₹4,00,000 released from escrow on schedule.',
        created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
      },
      {
        id: 'ms-101-2',
        pilot_id: 'pilot-101',
        milestone_number: 2,
        title: 'Edge Video Inference Accuracy Benchmark & Queue Measurement',
        description: 'Demonstration of >= 98% precision in vehicle classification and real-time queue length calculation under daytime, rain, and night illumination conditions.',
        due_date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
        status: 'submitted',
        payment_amount: 450000,
        payment_status: 'escrowed',
        deliverable_url: 'https://polaris.gov/deliverables/pilot-101/AeroVision_Edge_Accuracy_Harness_Benchmark.pdf',
        deliverable_filename: 'AeroVision_Edge_Accuracy_Harness_Benchmark.pdf',
        submission_notes: 'Benchmarked vehicle detection at 98.2% precision across daytime and night illumination. Edge inferencing latency averaged 380ms per frame. Test logs and video clips attached.',
        feedback: undefined,
        created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
      },
      {
        id: 'ms-101-3',
        pilot_id: 'pilot-101',
        milestone_number: 3,
        title: 'Live Dynamic Signal Optimization & Emergency Vehicle Preemption Corridor',
        description: 'Live closed-loop signal phase modulation reducing corridor transit delay by >= 30%, with automated siren-activated green preemption for ambulances.',
        due_date: new Date(Date.now() + 35 * 86400000).toISOString().split('T')[0],
        status: 'in_progress',
        payment_amount: 400000,
        payment_status: 'escrowed',
        created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
      },
    ],
  },
  {
    id: 'pilot-201',
    problem_statement_id: 'ps-201',
    startup_id: 'startup-102',
    department_id: 'dept-101-verified',
    scope: 'Sub-surface acoustic leak detection deployment across 15 km of municipal water distribution feeder lines in Ward 7. Real-time telemetry alerts pinpointing pipe fractures within a 2-meter radius.',
    timeline: '120 Days (4 Milestone Sprints)',
    budget: 1800000,
    status: 'active',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    milestones: [
      {
        id: 'ms-201-1',
        pilot_id: 'pilot-201',
        milestone_number: 1,
        title: 'Sensor Hardware Installation & Hydraulic Network Mapping',
        description: 'Deployment of 30 clamp-on acoustic IoT nodes at designated pipe valves and calibration of frequency baseline.',
        due_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
        status: 'in_progress',
        payment_amount: 500000,
        payment_status: 'escrowed',
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      },
      {
        id: 'ms-201-2',
        pilot_id: 'pilot-201',
        milestone_number: 2,
        title: 'Automated Acoustic Anomaly Detection & Dispatch Integration',
        description: 'Integration of ML leak frequency classifier with municipal engineering work-order dispatch system.',
        due_date: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
        status: 'pending',
        payment_amount: 600000,
        payment_status: 'escrowed',
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      },
      {
        id: 'ms-201-3',
        pilot_id: 'pilot-201',
        milestone_number: 3,
        title: 'Water Loss Reduction Audit & Final Validation Review',
        description: 'Demonstration of >= 25% non-revenue water savings in pilot zone verified by independent municipal auditor.',
        due_date: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
        status: 'pending',
        payment_amount: 700000,
        payment_status: 'escrowed',
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      },
    ],
  },
];

const LOCAL_STORAGE_PILOTS_KEY = 'polaris_pilots_registry';

export function getAllPilots(): Pilot[] {
  let pilotsList = SEEDED_PILOTS;

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_PILOTS_KEY);
      if (stored) {
        pilotsList = JSON.parse(stored);
      } else {
        localStorage.setItem(LOCAL_STORAGE_PILOTS_KEY, JSON.stringify(SEEDED_PILOTS));
      }
    } catch {
      pilotsList = SEEDED_PILOTS;
    }
  }

  // Populate joined relations
  return pilotsList.map(p => ({
    ...p,
    problem_statement: p.problem_statement || getProblemStatementById(p.problem_statement_id),
    startup: p.startup || getStartupById(p.startup_id),
  }));
}

export function getPilotById(id: string): Pilot | undefined {
  const all = getAllPilots();
  return all.find(p => p.id === id);
}

export async function createPilot(pilotData: Pilot): Promise<{ success: boolean; data?: Pilot; error?: string }> {
  // Supabase persistence if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const pilotPayload = {
        id: pilotData.id,
        problem_statement_id: pilotData.problem_statement_id,
        startup_id: pilotData.startup_id,
        department_id: pilotData.department_id,
        scope: pilotData.scope,
        timeline: pilotData.timeline,
        budget: pilotData.budget,
        status: pilotData.status,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('pilots') as any).insert(pilotPayload);

      if (pilotData.milestones && pilotData.milestones.length > 0) {
        const milestonesPayload = pilotData.milestones.map(m => ({
          id: m.id,
          pilot_id: pilotData.id,
          milestone_number: m.milestone_number,
          title: m.title,
          description: m.description,
          due_date: m.due_date,
          status: m.status,
          payment_amount: m.payment_amount,
          payment_status: m.payment_status,
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('milestones') as any).insert(milestonesPayload);
      }
    } catch (err) {
      console.warn('Supabase pilot creation failed, persisting locally:', err);
    }
  }

  // Local storage persistence
  try {
    const current = getAllPilots();
    const updated = [pilotData, ...current.filter(p => p.id !== pilotData.id)];
    localStorage.setItem(LOCAL_STORAGE_PILOTS_KEY, JSON.stringify(updated));
    return { success: true, data: pilotData };
  } catch {
    return { success: false, error: 'Failed to save pilot contract locally.' };
  }
}

export async function submitMilestoneDeliverable(
  pilotId: string,
  milestoneId: string,
  params: {
    deliverableFilename: string;
    submissionNotes: string;
    deliverableUrl?: string;
  }
): Promise<boolean> {
  const pilots = getAllPilots();
  const updatedPilots = pilots.map(p => {
    if (p.id === pilotId) {
      const updatedMs = (p.milestones || []).map(m => {
        if (m.id === milestoneId) {
          return {
            ...m,
            status: 'submitted' as MilestoneStatus,
            deliverable_filename: params.deliverableFilename,
            deliverable_url: params.deliverableUrl || `https://polaris.gov/storage/deliverables/${params.deliverableFilename}`,
            submission_notes: params.submissionNotes,
          };
        }
        return m;
      });
      return { ...p, milestones: updatedMs };
    }
    return p;
  });

  try {
    localStorage.setItem(LOCAL_STORAGE_PILOTS_KEY, JSON.stringify(updatedPilots));
    return true;
  } catch {
    return false;
  }
}

export async function reviewMilestone(
  pilotId: string,
  milestoneId: string,
  action: 'approve' | 'reject',
  feedback: string
): Promise<boolean> {
  const pilots = getAllPilots();
  const updatedPilots = pilots.map(p => {
    if (p.id === pilotId) {
      const updatedMs = (p.milestones || []).map(m => {
        if (m.id === milestoneId) {
          const newStatus: MilestoneStatus = action === 'approve' ? 'approved' : 'in_progress';
          const newPaymentStatus: PaymentStatus = action === 'approve' ? 'paid' : m.payment_status;
          return {
            ...m,
            status: newStatus,
            payment_status: newPaymentStatus,
            feedback,
          };
        }
        return m;
      });

      // Check if all milestones are approved
      const allApproved = updatedMs.every(m => m.status === 'approved' || m.status === 'paid');
      const pilotStatus = allApproved ? 'completed' : p.status;

      return { ...p, milestones: updatedMs, status: pilotStatus };
    }
    return p;
  });

  try {
    localStorage.setItem(LOCAL_STORAGE_PILOTS_KEY, JSON.stringify(updatedPilots));
    return true;
  } catch {
    return false;
  }
}
