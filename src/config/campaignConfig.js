/**
 * ============================================================================
 *  CAMPAIGN CONFIGURATION  -  THE ONE FILE YOU EDIT TO CHANGE THE WEBSITE
 * ============================================================================
 *  Everything public about the campaign lives here: name, photos, contact
 *  details, manifestos, social links, team and feature switches.
 *
 *  NEVER put passwords, API keys or private credentials in this file.
 *  It is bundled into the public website.
 * ============================================================================
 */

const campaignConfig = {
  // ------------------------------------------------------------------ CANDIDATE
  candidate: {
    // TODO(you): replace with your preferred public campaign name.
    name: '[Your Campaign Name]',
    // Short version used in tight spaces (navbar, WhatsApp share text).
    shortName: 'Congress Rep Campaign',
    // Keep the position editable until the university confirms the official title.
    position: 'Faculty of Commerce Congress Representative',
    university: 'Egerton University',
    faculty: 'Faculty of Commerce',
    course: 'Bachelor of Commerce (BCom)',
    slogan: 'Your Voice. Your Faculty. Your Future.',
    intro:
      'I am a Bachelor of Commerce student at Egerton University, aspiring to serve as Congress representative for the Faculty of Commerce. My campaign focuses on student representation, academic support, career development, entrepreneurship, transparent leadership, and meaningful communication. I believe every Commerce student deserves to be heard, informed, and represented.',
    vision:
      "To build a more connected, informed, opportunity-driven, and accountable Faculty of Commerce where every student's voice matters.",
    mission:
      'To represent student concerns responsibly, promote academic and career development, encourage entrepreneurship, and strengthen communication between Commerce students and the relevant university leadership.',
    // Leadership values: edit freely. These are values, not claimed achievements.
    values: [
      { title: 'Listen first', text: 'Every student concern deserves a respectful hearing.' },
      { title: 'Be honest', text: 'Say what can be done, and say plainly what cannot.' },
      { title: 'Stay accountable', text: 'Report back on what was raised and what happened next.' },
      { title: 'Include everyone', text: 'Represent students of every background, year and interest.' },
    ],
    // Add real, verifiable facts here when you are ready (leave empty to hide the section).
    // Example: { label: 'Year of study', value: 'Year 3' }
    facts: [],
  },

  // -------------------------------------------------------------------- PHOTOS
  // Files live in /public/images. To change a photo, replace the file (keep the
  // name) or change the path below. Keep images under ~300 KB for fast loading.
  images: {
    hero: '/images/candidate-hero.webp',
    heroAlt: 'Portrait of the candidate in a white shirt and tie',
    about: '/images/candidate-campus.webp',
    aboutAlt: 'The candidate standing on the Egerton University campus lawn',
    gallery: '/images/candidate-portrait.webp',
    galleryAlt: 'Studio portrait of the candidate',
  },

  // ------------------------------------------------------------------- CONTACT
  contact: {
    email: 'casifunamike@gmail.com',
    // Local Kenyan format is fine. The site converts it to 254743929633 for wa.me links.
    whatsappNumber: '0743929633',
    // Used when the number above has no country code (Kenya = 254).
    defaultCountryCode: '254',
  },

  // ------------------------------------------------------------ SOCIAL ACCOUNTS
  // Leave url as '' until you have a REAL account. Empty ones are hidden.
  socials: [
    { id: 'facebook', label: 'Facebook', url: '' },
    { id: 'instagram', label: 'Instagram', url: '' },
    { id: 'tiktok', label: 'TikTok', url: '' },
    { id: 'youtube', label: 'YouTube', url: '' },
    { id: 'x', label: 'X', url: '' },
    { id: 'telegram', label: 'Telegram', url: '' },
  ],

  // ------------------------------------------------------------- FEATURE SWITCHES
  features: {
    campaignTeamPage: true, // show "Campaign Team" in the menu and the /team page
    manifestoPdf: true, // show the PDF download button (file is generated at build time)
  },

  // ------------------------------------------------------------------ BACKEND
  // The public Google Apps Script web-app URL. Set it in .env / Vercel as
  // VITE_APPS_SCRIPT_URL (preferred) or paste it as the fallback string below.
  backend: {
    appsScriptUrl: import.meta.env?.VITE_APPS_SCRIPT_URL || '',
  },

  // --------------------------------------------------------------- CAMPAIGN TEAM
  // Leave `members` empty to show a volunteer invitation instead of people.
  // Example member:
  // { name: 'Full Name', role: 'Campaign Manager', bio: 'One honest sentence.', photo: '/images/team-1.webp' }
  team: {
    members: [],
  },

  // -------------------------------------------------------------------- PRIVACY
  privacy: {
    retention: 'until the campaign and any follow-up report-back period end, then deleted or anonymised (within 12 months at most)',
    lastUpdated: '20 October 2026',
  },

  // ------------------------------------------------------------ PRIORITY CARDS
  priorities: [
    { icon: 'users', title: 'Student representation', text: 'Carry your concerns to the right university and faculty leadership, responsibly.' },
    { icon: 'book', title: 'Academic support', text: 'Better communication on resources, revision opportunities and where to get help.' },
    { icon: 'briefcase', title: 'Career development', text: 'Career talks, guidance and opportunities relevant to Commerce students.' },
    { icon: 'lightbulb', title: 'Entrepreneurship', text: 'Back student-led business ideas, innovation and creativity.' },
    { icon: 'eye', title: 'Transparent leadership', text: 'Honest updates on what was raised, what was done and what is still pending.' },
    { icon: 'megaphone', title: 'Student communication', text: 'Verified faculty information shared through channels you actually use.' },
  ],

  // --------------------------------------------------------------- MANIFESTOS
  // Edit any title or text. Keep `icon` as one of the names used in
  // src/components/ManifestoCard.jsx. These are commitments and advocacy
  // priorities, NOT guaranteed results.
  manifestos: [
    { id: 1, icon: 'users', title: 'Student Representation and Accountability', text: "Represent students' concerns responsibly and communicate them to the relevant university and faculty leadership. Provide updates on concerns raised and the progress made." },
    { id: 2, icon: 'calendar', title: 'Regular Student Consultations', text: 'Encourage regular opportunities for Commerce students to share ideas, concerns, and priorities through meetings, surveys, and digital feedback channels.' },
    { id: 3, icon: 'eye', title: 'Transparent Leadership', text: 'Communicate campaign activities, student concerns raised, and progress updates honestly. Do not make promises that cannot be fulfilled.' },
    { id: 4, icon: 'book', title: 'Academic Support', text: 'Advocate for better communication about academic resources, revision opportunities, relevant academic information, and appropriate channels for academic assistance.' },
    { id: 5, icon: 'megaphone', title: 'Better Communication', text: 'Promote timely sharing of verified and relevant faculty information through accessible communication channels.' },
    { id: 6, icon: 'briefcase', title: 'Career Development', text: 'Encourage access to career guidance, professional development information, career talks, and opportunities relevant to Commerce students.' },
    { id: 7, icon: 'building', title: 'Internship and Industrial Attachment Opportunities', text: 'Help students discover relevant internship, industrial attachment, and practical learning opportunities by sharing verified information from legitimate sources.' },
    { id: 8, icon: 'lightbulb', title: 'Entrepreneurship and Innovation', text: 'Encourage entrepreneurship, business creativity, innovation, and student-led business initiatives.' },
    { id: 9, icon: 'piggy', title: 'Financial Literacy', text: 'Promote awareness of budgeting, saving, responsible borrowing, investment fundamentals, and personal financial management.' },
    { id: 10, icon: 'heart', title: 'Student Welfare', text: 'Listen to student welfare concerns and direct them to appropriate university offices or established support channels.' },
    { id: 11, icon: 'handshake', title: 'Inclusive Representation', text: 'Encourage respectful participation and fair representation of students with different experiences, backgrounds, interests, and needs.' },
    { id: 12, icon: 'phone', title: 'Digital Student Engagement', text: 'Use appropriate digital channels to collect feedback, communicate verified information, and make campaign engagement easier.' },
    { id: 13, icon: 'message', title: 'Responsible Student Feedback', text: 'Create accessible ways for students to share suggestions, report concerns, and propose practical improvements.' },
    { id: 14, icon: 'network', title: 'Professional Networking and Faculty Events', text: 'Encourage relevant professional discussions, networking activities, career talks, and student engagement events where feasible and appropriately approved.' },
    { id: 15, icon: 'store', title: 'Student Business and Talent Showcase', text: 'Encourage opportunities for Commerce students to showcase businesses, projects, talents, and innovative ideas.' },
    { id: 16, icon: 'scale', title: 'Fairness and Responsible Leadership', text: 'Promote fairness, respectful conduct, responsible decision-making, and accountability in student representation.' },
    { id: 17, icon: 'info', title: 'Access to Relevant Information', text: 'Encourage clear communication about relevant academic, career, event, and student support opportunities.' },
    { id: 18, icon: 'link', title: 'Collaboration Across Student Groups', text: 'Encourage cooperation among student groups and relevant faculty stakeholders to address shared priorities.' },
    { id: 19, icon: 'clipboard', title: 'Regular Progress Reports', text: 'Provide periodic updates on issues raised, actions taken, progress achieved, and challenges that still need attention.' },
    { id: 20, icon: 'door', title: 'An Open-Door Leadership Approach', text: 'Encourage accessible communication, respectful dialogue, and practical follow-up on student concerns.' },
  ],

  // ------------------------------------------------- FORM CHOICES (shown in forms)
  forms: {
    years: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Postgraduate', 'Other'],
    contactMethods: ['WhatsApp', 'Phone call', 'SMS', 'Email', 'Please do not contact me'],
    interests: [
      'Academic support',
      'Career opportunities',
      'Entrepreneurship',
      'Student welfare',
      'Events and networking',
      'Communication',
      'Volunteering',
      'Sharing ideas',
    ],
    referralSources: ['WhatsApp', 'Facebook', 'Instagram', 'TikTok', 'X', 'Telegram', 'YouTube', 'Friend', 'Poster', 'Class or lecture', 'Other'],
    feedbackCategories: ['Academic support', 'Career development', 'Student welfare', 'Communication', 'Entrepreneurship', 'Faculty engagement', 'Other concerns'],
  },
};

export default campaignConfig;
