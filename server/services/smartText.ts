/**
 * server/services/smartText.ts
 *
 * Keyword-based text analysis for auto-suggestions.
 * No external AI API — pure dictionary matching.
 */

import { KEYWORDS } from '../data/keywords.js';
import type { UrgencyLevel, ContributionType, SDGNumber } from '../../shared/types.js';

// ---------------------------------------------------------------------------
// Category detection
// ---------------------------------------------------------------------------

export function detectCategory(text: string): string | null {
  const lower = text.toLowerCase();
  let bestCategory: string | null = null;
  let maxScore = 0;

  for (const [category, keywords] of Object.entries(KEYWORDS.categories)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        score += kw.includes(' ') ? 3 : 1;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }
  return bestCategory;
}

// ---------------------------------------------------------------------------
// Urgency detection
// ---------------------------------------------------------------------------

export function detectUrgency(text: string): UrgencyLevel {
  const lower = text.toLowerCase();
  if (KEYWORDS.urgency.critical.some((kw: string) => lower.includes(kw))) return 'critical';
  if (KEYWORDS.urgency.high.some((kw: string) => lower.includes(kw))) return 'high';
  if (KEYWORDS.urgency.low.some((kw: string) => lower.includes(kw))) return 'low';
  return 'normal';
}

// ---------------------------------------------------------------------------
// Contribution type detection
// ---------------------------------------------------------------------------

export function detectContributionType(text: string): ContributionType {
  const lower = text.toLowerCase();
  const wantsTime = KEYWORDS.contribution.time.some((kw: string) => lower.includes(kw));
  const wantsGoods = KEYWORDS.contribution.goods.some((kw: string) => lower.includes(kw));
  if (wantsTime && wantsGoods) return 'both';
  if (wantsGoods) return 'goods';
  return 'time';
}

// ---------------------------------------------------------------------------
// SDG tag suggestions
// ---------------------------------------------------------------------------

export function suggestSDGTags(text: string): SDGNumber[] {
  const lower = text.toLowerCase();
  const suggested: SDGNumber[] = [];
  for (const [sdgStr, keywords] of Object.entries(KEYWORDS.sdg)) {
    if ((keywords as string[]).some((kw: string) => lower.includes(kw))) {
      suggested.push(Number(sdgStr) as SDGNumber);
    }
  }
  return [...new Set(suggested)].slice(0, 5);
}

// ---------------------------------------------------------------------------
// Skills suggestion
// ---------------------------------------------------------------------------

export function suggestSkills(text: string, category: string | null): string[] {
  const skills = new Set<string>();
  const lower = text.toLowerCase();

  // Category-specific skills
  if (category && KEYWORDS.skills[category]) {
    (KEYWORDS.skills[category] as string[]).forEach(s => skills.add(s));
  }

  // Generic keyword matches
  for (const [skill, triggers] of Object.entries(KEYWORDS.skillTriggers)) {
    if ((triggers as string[]).some((kw: string) => lower.includes(kw))) {
      skills.add(skill);
    }
  }

  return Array.from(skills).slice(0, 8);
}

// ---------------------------------------------------------------------------
// Full suggestion bundle (for requirement creation assistant)
// ---------------------------------------------------------------------------

export interface TextSuggestions {
  category: string | null;
  urgency: UrgencyLevel;
  contributionType: ContributionType;
  sdgTags: SDGNumber[];
  skills: string[];
}

export function analyzeText(text: string): TextSuggestions {
  const category = detectCategory(text);
  return {
    category,
    urgency: detectUrgency(text),
    contributionType: detectContributionType(text),
    sdgTags: suggestSDGTags(text),
    skills: suggestSkills(text, category),
  };
}
