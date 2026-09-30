export type UserRole = 'department_official' | 'startup' | 'validator' | 'admin';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type ProblemStatementStatus = 'draft' | 'published' | 'matching' | 'closed';

export type MatchStatus = 'new' | 'shortlisted' | 'rejected' | 'invited_to_pilot';

export type PilotStatus = 'draft' | 'active' | 'in_review' | 'completed' | 'terminated';

export type MilestoneStatus = 'pending' | 'in_progress' | 'submitted' | 'approved' | 'paid';

export type PaymentStatus = 'unpaid' | 'escrowed' | 'processing' | 'paid';

export type ValidationDecision = 'approve' | 'reject' | 'request_data';

export interface Profile {
  id: string; // references auth.users
  email: string;
  role: UserRole;
  name: string;
  org_or_department: string;
  verification_status: VerificationStatus;
  email_verified?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ProblemStatement {
  id: string;
  department_id: string; // references profiles.id
  department_name?: string;
  raw_input: string;
  title: string;
  background: string;
  outcome: string;
  metrics: string[];
  category_tags: string[];
  status: ProblemStatementStatus;
  budget_estimate?: string;
  target_timeline?: string;
  created_at: string;
  updated_at?: string;
}

export interface Startup {
  id: string;
  profile_id?: string; // linked user profile if claimed
  name: string;
  description: string;
  sector: string;
  website?: string;
  team_info: string;
  references: string[];
  eligibility_score: number; // 0 to 100
  product_maturity: 'concept' | 'prototype' | 'deployed' | 'scaling';
  tags?: string[];
  created_at: string;
}

export interface EligibilityBreakdown {
  product_maturity_score: number; // max 25
  technical_fit_score: number;    // max 35
  past_pilot_score: number;       // max 25
  references_score: number;       // max 15
  notes: string[];
}

export interface Match {
  id: string;
  problem_statement_id: string;
  startup_id: string;
  relevance_score: number; // 0 to 100
  combined_score?: number;  // 0 to 100 composite ranking
  eligibility_breakdown: EligibilityBreakdown;
  match_explanation: string;
  status: MatchStatus;
  created_at: string;
  // joined fields
  startup?: Startup;
  problem_statement?: ProblemStatement;
}

export interface Pilot {
  id: string;
  problem_statement_id: string;
  startup_id: string;
  department_id: string;
  scope: string;
  timeline: string;
  budget?: number;
  status: PilotStatus;
  created_at: string;
  // joined fields
  problem_statement?: ProblemStatement;
  startup?: Startup;
  milestones?: Milestone[];
}

export interface Milestone {
  id: string;
  pilot_id: string;
  milestone_number: number;
  title: string;
  description: string;
  due_date: string;
  status: MilestoneStatus;
  payment_amount: number;
  payment_status: PaymentStatus;
  deliverable_url?: string;
  deliverable_filename?: string;
  submission_notes?: string;
  feedback?: string;
  created_at: string;
}

export interface ValidationReport {
  id: string;
  pilot_id: string;
  validator_id: string;
  validator_name?: string;
  findings: string;
  metrics_achieved: boolean;
  scale_up_readiness_score: number; // 1 to 10
  decision: ValidationDecision;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; email: string; role: UserRole; name: string; org_or_department: string };
        Update: Partial<Profile>;
      };
      problem_statements: {
        Row: ProblemStatement;
        Insert: Partial<ProblemStatement> & { department_id: string; raw_input: string; title: string; background: string; outcome: string };
        Update: Partial<ProblemStatement>;
      };
      startups: {
        Row: Startup;
        Insert: Partial<Startup> & { name: string; description: string; sector: string; team_info: string };
        Update: Partial<Startup>;
      };
      matches: {
        Row: Match;
        Insert: Partial<Match> & { problem_statement_id: string; startup_id: string; relevance_score: number; match_explanation: string };
        Update: Partial<Match>;
      };
      pilots: {
        Row: Pilot;
        Insert: Partial<Pilot> & { problem_statement_id: string; startup_id: string; department_id: string; scope: string; timeline: string };
        Update: Partial<Pilot>;
      };
      milestones: {
        Row: Milestone;
        Insert: Partial<Milestone> & { pilot_id: string; milestone_number: number; title: string; description: string; due_date: string };
        Update: Partial<Milestone>;
      };
      validation_reports: {
        Row: ValidationReport;
        Insert: Partial<ValidationReport> & { pilot_id: string; validator_id: string; findings: string; scale_up_readiness_score: number; decision: ValidationDecision };
        Update: Partial<ValidationReport>;
      };
    };
  };
}
