import type { ProblemStatement, Startup, Match } from '@/types/database';
import { calculateStartupEligibility } from '@/lib/startups-store';

/**
 * Computes ranked startup matches for a given problem statement.
 * Implements a keyword & tag-overlap scoring function structured so it can
 * seamlessly be swapped for vector embeddings (e.g. pgvector) in the future.
 */
export function computeMatches(
  problem: ProblemStatement,
  startups: Startup[]
): Match[] {
  const problemText = `${problem.title} ${problem.background} ${problem.outcome}`.toLowerCase();
  const problemTags = (problem.category_tags || []).map(t => t.toLowerCase());

  const matches: Match[] = startups.map(startup => {
    const startupTags = (startup.tags || []).map(t => t.toLowerCase());
    const startupText = `${startup.name} ${startup.description} ${startup.sector} ${startup.team_info}`.toLowerCase();

    // 1. Tag Overlap Scoring (Max 45 points)
    let sharedTagCount = 0;
    const matchingTags: string[] = [];

    problemTags.forEach(pTag => {
      const found = startupTags.some(sTag => sTag.includes(pTag) || pTag.includes(sTag));
      if (found) {
        sharedTagCount++;
        matchingTags.push(pTag);
      }
    });

    const tagScore = Math.min(45, sharedTagCount * 15);

    // 2. Keyword & Text Similarity Scoring (Max 35 points)
    const keywords = [
      'water', 'leak', 'pipeline', 'acoustic', 'pipe',
      'traffic', 'signal', 'camera', 'vision', 'vehicle', 'congestion', 'ambulance',
      'land', 'record', 'ocr', 'handwritten', 'cursive', 'digitiz', 'cadastral',
      'hospital', 'triage', 'opd', 'patient', 'queue', 'clinic',
      'road', 'pothole', 'pavement', 'dashcam', 'drone', 'gis',
      'solar', 'microgrid', 'energy', 'telemetry', 'battery',
      'iot', 'edge', 'ai', 'analytics', 'real-time'
    ];

    let keywordScore = 0;
    const matchedKeywords: string[] = [];

    keywords.forEach(kw => {
      if (problemText.includes(kw) && startupText.includes(kw)) {
        keywordScore += 7;
        matchedKeywords.push(kw);
      }
    });

    keywordScore = Math.min(35, keywordScore);

    // 3. Direct Sector Alignment Bonus (Max 20 points)
    let sectorBonus = 0;
    if (
      (problemText.includes('traffic') || problemText.includes('mobility')) &&
      startup.sector.toLowerCase().includes('mobility')
    ) {
      sectorBonus = 20;
    } else if (
      (problemText.includes('water') || problemText.includes('leak')) &&
      startup.sector.toLowerCase().includes('water')
    ) {
      sectorBonus = 20;
    } else if (
      (problemText.includes('land') || problemText.includes('ocr') || problemText.includes('document')) &&
      startup.sector.toLowerCase().includes('document')
    ) {
      sectorBonus = 20;
    } else if (
      (problemText.includes('hospital') || problemText.includes('health') || problemText.includes('opd')) &&
      startup.sector.toLowerCase().includes('health')
    ) {
      sectorBonus = 20;
    } else if (
      (problemText.includes('road') || problemText.includes('pavement')) &&
      startup.sector.toLowerCase().includes('transport')
    ) {
      sectorBonus = 20;
    } else if (
      (problemText.includes('energy') || problemText.includes('solar')) &&
      startup.sector.toLowerCase().includes('energy')
    ) {
      sectorBonus = 20;
    } else {
      sectorBonus = 5;
    }

    // Calculate Final Relevance Score (0 - 100)
    let relevanceScore = tagScore + keywordScore + sectorBonus;
    // Cap between 25 and 96 to provide realistic procurement metrics
    relevanceScore = Math.max(25, Math.min(96, relevanceScore));

    // 4. Calculate Objective Eligibility Score & Breakdown
    const eligibility = calculateStartupEligibility(startup);

    // 5. Calculate Composite Ranking Score
    const combinedScore = Math.round(relevanceScore * 0.55 + eligibility.totalScore * 0.45);

    // 6. Generate Natural Language AI Match Explanation
    let matchExplanation = '';
    if (relevanceScore >= 80) {
      matchExplanation = `High ${relevanceScore}% fit: ${startup.name} provides direct technical specialization in ${startup.sector}. Features strong alignment with problem requirements (${matchingTags.slice(0, 3).join(', ') || 'domain scope'}). Maturity stage is ${startup.product_maturity.toUpperCase()} with ${startup.references.length} verified public pilot reference(s).`;
    } else if (relevanceScore >= 60) {
      matchExplanation = `Moderate ${relevanceScore}% fit: Core competencies in ${startup.sector} offer applicable capabilities, though secondary adaptation may be required for specific operational SLA benchmarks.`;
    } else {
      matchExplanation = `General ${relevanceScore}% fit: Adjacent technology provider in ${startup.sector}. Evaluated as an alternative or exploratory pilot contender.`;
    }

    const matchRecord: Match = {
      id: `match-${problem.id}-${startup.id}`,
      problem_statement_id: problem.id,
      startup_id: startup.id,
      relevance_score: relevanceScore,
      combined_score: combinedScore,
      eligibility_breakdown: eligibility.breakdown,
      match_explanation: matchExplanation,
      status: 'new',
      created_at: new Date().toISOString(),
      startup,
      problem_statement: problem,
    };

    return matchRecord;
  });

  // Sort descending by combined ranking score
  return matches.sort((a, b) => (b.combined_score || 0) - (a.combined_score || 0));
}
