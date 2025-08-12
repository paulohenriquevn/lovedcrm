/**
 * Score Breakdown Modal Configuration
 * Configuration data and utilities for score breakdown modal
 */

// Factor configurations with descriptions and recommendations
export const FACTOR_CONFIG: Record<
  string,
  {
    label: string
    description: string
    maxScore: number
    recommendations: Record<string, string>
  }
> = {
  emailAuthority: {
    label: 'Email Authority',
    description: 'Quality and authority of email domain',
    maxScore: 10,
    recommendations: {
      low: 'Verify email domain and consider alternative contact methods',
      medium: 'Email quality is acceptable, monitor deliverability',
      high: 'Excellent email authority, prioritize email communication',
    },
  },
  phoneComplete: {
    label: 'Phone Completeness',
    description: 'Phone number validation and completeness',
    maxScore: 5,
    recommendations: {
      low: 'Collect complete phone number with area code',
      medium: 'Phone number provided, verify format',
      high: 'Complete phone contact available',
    },
  },
  estimatedValue: {
    label: 'Deal Value',
    description: 'Estimated deal size and revenue potential',
    maxScore: 20,
    recommendations: {
      low: 'Explore ways to increase deal value and scope',
      medium: 'Good deal potential, discuss additional services',
      high: 'High-value opportunity, assign to senior team member',
    },
  },
  sourceQuality: {
    label: 'Source Quality',
    description: 'Quality and reputation of lead source',
    maxScore: 15,
    recommendations: {
      low: 'Review lead source quality and qualification criteria',
      medium: 'Decent source quality, standard follow-up process',
      high: 'Premium source, fast-track this lead',
    },
  },
  companySize: {
    label: 'Company Size',
    description: 'Company size indicators and potential',
    maxScore: 25,
    recommendations: {
      low: 'Research company size and growth indicators',
      medium: 'Mid-size company, good potential for services',
      high: 'Large company, significant opportunity potential',
    },
  },
  engagement: {
    label: 'Engagement Level',
    description: 'Interaction history and engagement patterns',
    maxScore: 15,
    recommendations: {
      low: 'Increase engagement with valuable content and touchpoints',
      medium: 'Moderate engagement, maintain regular contact',
      high: 'High engagement, ready for sales conversation',
    },
  },
}

// Generate mock historical data for trend visualization
export const generateHistoricalData = (
  score: number,
  trendDirection?: string
): Array<{
  day: number
  score: number
}> => {
  const data: Array<{ day: number; score: number }> = []
  const baseScore = score
  const days = 30

  for (let i = days; i >= 0; i--) {
    let dayScore = baseScore
    if (trendDirection === 'up') {
      dayScore = baseScore - (i / days) * 20 + Math.random() * 5
    } else if (trendDirection === 'down') {
      dayScore = baseScore + (i / days) * 15 - Math.random() * 5
    } else {
      dayScore = baseScore + (Math.random() - 0.5) * 10
    }

    data.push({
      day: days - i + 1,
      score: Math.max(0, Math.min(100, Math.round(dayScore))),
    })
  }

  return data
}
