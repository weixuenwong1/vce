export const membershipPlans = {
  'self-study': {
    id: 'self-study',
    eyebrow: 'Independent study',
    name: 'Chuba Self Study',
    shortName: 'Self Study',
    description: 'Complete resources for students who want to study independently.',
    monthlyPrice: 19,
    annualPrice: 149,
    features: [
      'All resources for your chosen VCE science subject',
      'Access to thousands of practice questions and worked solutions',
      'Access to every topic summary and practice SAC written by tutors who achieved raw 50 study scores',
    ],
  },
  supported: {
    id: 'supported',
    eyebrow: 'Guided study',
    name: 'Chuba Supported',
    shortName: 'Supported',
    description: 'Complete resources with personal help from Chuba tutors.',
    monthlyPrice: 34,
    annualPrice: 279,
    features: [
      'Everything included in Chuba Self Study',
      'Unlimited support from Chuba tutors',
      'Detailed written guidance tailored to your questions',
      'A two-business-day response target',
    ],
  },
};

export const membershipSubjects = [
  { id: 'physics', name: 'Physics' },
  { id: 'chemistry', name: 'Chemistry' },
  { id: 'biology', name: 'Biology' },
];

export const getMembershipPrice = (plan, billingCycle) => (
  billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice
);

export const getAnnualSaving = (plan) => (plan.monthlyPrice * 12) - plan.annualPrice;
