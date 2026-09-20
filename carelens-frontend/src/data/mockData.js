/**
 * DEMO DATA ONLY.
 *
 * Every value below is fictional and belongs to a fictional hospital
 * ("Gopal Hospital"). None of it represents a real patient, a real hospital,
 * or a real charge. It exists so the UI can be developed and demonstrated
 * before the Express backend is connected.
 *
 * The shapes here are the contract the real API is expected to satisfy.
 * When the backend arrives, `services/api.js` returns the same shapes and
 * nothing in `components/` or `pages/` needs to change.
 */

export const DEMO_MODE = true;

export const mockRecentAnalyses = [
  {
    id: 'an_1042',
    hospital: 'Gopal Hospital',
    billReference: 'GH/IP/2026/04417',
    admittedOn: '2026-03-12',
    dischargedOn: '2026-03-15',
    total: 42850,
    issueCount: 2,
    status: 'review',
  },
  {
    id: 'an_1038',
    hospital: 'Meridian Care Hospital',
    billReference: 'MC/OP/2026/00982',
    admittedOn: '2026-02-27',
    dischargedOn: '2026-02-27',
    total: 6120,
    issueCount: 0,
    status: 'verified',
  },
  {
    id: 'an_1031',
    hospital: 'Sample Insurance Claim',
    billReference: 'CLM/2026/77310',
    admittedOn: '2026-01-19',
    dischargedOn: '2026-01-22',
    total: 88400,
    issueCount: 1,
    status: 'review',
  },
];

export const mockAnalysis = {
  id: 'an_1042',
  status: 'complete', // queued | extracting | retrieving | explaining | complete | failed
  hospital: 'Gopal Hospital',
  knowledgeBase: 'Gopal Hospital — Demo Knowledge Base',
  billReference: 'GH/IP/2026/04417',
  admittedOn: '2026-03-12',
  dischargedOn: '2026-03-15',
  analysedOn: '2026-03-18',
  payer: 'Self-paying',

  summary: {
    total: 42850,
    verifiedAmount: 26350,
    underReviewAmount: 16500,
    chargeCount: 14,
    issueCount: 2,
  },

  categories: [
    { id: 'room', label: 'Room charges', amount: 16500, chargeCount: 1, issueCount: 1 },
    { id: 'diagnostics', label: 'Diagnostics', amount: 4310, chargeCount: 5, issueCount: 0 },
    { id: 'medicines', label: 'Medicines', amount: 7640, chargeCount: 3, issueCount: 0 },
    { id: 'professional', label: 'Professional fees', amount: 9000, chargeCount: 2, issueCount: 1 },
    { id: 'procedures', label: 'Procedures', amount: 3800, chargeCount: 2, issueCount: 0 },
    { id: 'other', label: 'Other', amount: 1600, chargeCount: 1, issueCount: 0 },
  ],

  charges: [
    {
      id: 'ch_01',
      description: 'Private room — daily charge',
      category: 'Room charges',
      quantity: 3,
      unit: 'days',
      rate: 5500,
      total: 16500,
      status: 'review',
      discrepancyId: 'dc_01',
    },
    {
      id: 'ch_02',
      description: 'Consultant visit — Grade A',
      category: 'Professional fees',
      quantity: 4,
      unit: 'visits',
      rate: 1500,
      total: 6000,
      status: 'review',
      discrepancyId: 'dc_02',
    },
    {
      id: 'ch_03',
      description: 'Anaesthetist fee',
      category: 'Professional fees',
      quantity: 1,
      unit: 'procedure',
      rate: 3000,
      total: 3000,
      status: 'verified',
    },
    {
      id: 'ch_04',
      description: 'Complete blood count',
      category: 'Diagnostics',
      quantity: 2,
      unit: 'tests',
      rate: 450,
      total: 900,
      status: 'verified',
    },
    {
      id: 'ch_05',
      description: 'Chest radiograph, PA view',
      category: 'Diagnostics',
      quantity: 1,
      unit: 'study',
      rate: 600,
      total: 600,
      status: 'verified',
    },
    {
      id: 'ch_06',
      description: 'Renal function profile',
      category: 'Diagnostics',
      quantity: 1,
      unit: 'panel',
      rate: 1250,
      total: 1250,
      status: 'verified',
    },
    {
      id: 'ch_07',
      description: 'Serum electrolytes',
      category: 'Diagnostics',
      quantity: 2,
      unit: 'tests',
      rate: 580,
      total: 1160,
      status: 'verified',
    },
    {
      id: 'ch_08',
      description: 'Ultrasound abdomen',
      category: 'Diagnostics',
      quantity: 1,
      unit: 'study',
      rate: 400,
      total: 400,
      status: 'verified',
    },
    {
      id: 'ch_09',
      description: 'Inpatient pharmacy — issued items',
      category: 'Medicines',
      quantity: 1,
      unit: 'statement',
      rate: 5120,
      total: 5120,
      status: 'information',
      note: 'Itemised pharmacy statement not included in the uploaded document.',
    },
    {
      id: 'ch_10',
      description: 'Intravenous fluids',
      category: 'Medicines',
      quantity: 6,
      unit: 'units',
      rate: 210,
      total: 1260,
      status: 'verified',
    },
    {
      id: 'ch_11',
      description: 'Injectable antibiotic',
      category: 'Medicines',
      quantity: 4,
      unit: 'vials',
      rate: 315,
      total: 1260,
      status: 'verified',
    },
    {
      id: 'ch_12',
      description: 'Minor procedure — wound dressing',
      category: 'Procedures',
      quantity: 2,
      unit: 'sessions',
      rate: 650,
      total: 1300,
      status: 'verified',
    },
    {
      id: 'ch_13',
      description: 'Day-care procedure charge',
      category: 'Procedures',
      quantity: 1,
      unit: 'procedure',
      rate: 2500,
      total: 2500,
      status: 'verified',
    },
    {
      id: 'ch_14',
      description: 'Registration and admission',
      category: 'Other',
      quantity: 1,
      unit: 'episode',
      rate: 1600,
      total: 1600,
      status: 'verified',
    },
  ],

  discrepancies: [
    {
      id: 'dc_01',
      chargeId: 'ch_01',
      title: 'Private room charge',
      severity: 'review',
      billedLabel: 'The bill lists',
      billedValue: '₹5,500 per day',
      referenceLabel: 'The available tariff lists',
      referenceValue: '₹5,000 per day',
      differenceLabel: 'Potential difference',
      differenceValue: '₹500 per day',
      totalDifference: 1500,
      reason:
        'The available tariff lists the standard private room rate at ₹5,000 per day. This difference may require clarification if no separate applicable charge explains it.',
      evidenceId: 'ev_01',
    },
    {
      id: 'dc_02',
      chargeId: 'ch_02',
      title: 'Consultant visit count',
      severity: 'review',
      billedLabel: 'The bill lists',
      billedValue: '4 consultant visits',
      referenceLabel: 'The recorded stay covers',
      referenceValue: '3 days',
      differenceLabel: 'Visits beyond days of stay',
      differenceValue: '1 visit',
      totalDifference: 1500,
      reason:
        'Four consultant visits are billed across a three-day stay. A second attendance on one day may be clinically documented. Based on available documentation this could not be confirmed, so it may require clarification.',
      evidenceId: 'ev_02',
    },
  ],

  evidence: {
    ev_01: {
      id: 'ev_01',
      sourceDocument: 'Gopal Hospital Master Tariff and Rate Schedule 2026',
      documentType: 'Master Tariff',
      page: 3,
      section: 'Inpatient room and accommodation charges',
      excerpt:
        'Private room — single occupancy with attached sanitation and one attendant bed — per day — ₹5,000. An attendant bed beyond the one included is listed separately at ₹500 per day.',
      retrievedOn: '2026-03-18',
      confidence: 'High',
    },
    ev_02: {
      id: 'ev_02',
      sourceDocument: 'Gopal Hospital Doctor and Professional Fees Policy',
      documentType: 'Policy',
      page: 5,
      section: 'Daily visit charges',
      excerpt:
        'One visit fee per consultant per day, unless a second attendance on the same day was clinically required and is separately documented with its own note and a recorded reason.',
      retrievedOn: '2026-03-18',
      confidence: 'Medium',
    },
  },
};

export const mockSuggestedQuestions = [
  'Why was this charge flagged?',
  'What is the standard room rate?',
  'Which charges are included in my package?',
  'Can I request an explanation of this charge?',
];

export const mockConversation = [
  {
    id: 'm_01',
    role: 'user',
    content: 'Why was my room charge flagged?',
  },
  {
    id: 'm_02',
    role: 'assistant',
    content:
      'Your bill lists the private room at ₹5,500 per day. The available Gopal Hospital tariff lists the standard private room rate as ₹5,000 per day. The ₹500 difference may require clarification if there is no separate applicable charge.',
    citations: [{ source: 'Gopal Hospital Master Tariff', page: 3, evidenceId: 'ev_01' }],
  },
  {
    id: 'm_03',
    role: 'user',
    content: 'Can the hospital charge extra for an attendant bed?',
  },
  {
    id: 'm_04',
    role: 'assistant',
    content:
      'According to the available tariff, an attendant bed is listed separately at ₹500 per day. Whether that charge applies to your bill depends on the services and documentation associated with your admission.',
    citations: [{ source: 'Gopal Hospital Master Tariff', page: 3, evidenceId: 'ev_01' }],
  },
];

/** Canned replies used only while DEMO_MODE is on. */
export const mockAssistantReplies = [
  {
    content:
      'Based on available documentation, the standard private room rate for Gopal Hospital is listed at ₹5,000 per day. Your bill lists ₹5,500 per day across three days. You can ask the hospital billing counter which tariff entry the higher rate was charged under.',
    citations: [{ source: 'Gopal Hospital Master Tariff', page: 3, evidenceId: 'ev_01' }],
  },
  {
    content:
      'The uploaded bill does not include an itemised pharmacy statement, so the individual medicines could not be checked against available documentation. You can request the itemised pharmacy list from the hospital.',
    citations: [{ source: 'Gopal Hospital Billing and Charges Policy', page: 8, evidenceId: null }],
  },
  {
    content:
      'That detail is not covered by the documents available to CareLens for this bill. Reviewing it with your hospital or insurer is the reliable next step.',
    citations: [],
  },
];
