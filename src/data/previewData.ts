import { ResumeData, LayoutItem } from '@/types/resume';
import { templates as sampleTemplates } from "@/data/templates";

export const initialLayout: LayoutItem[] = [
  { id: 'summary', name: 'Professional Summary', enabled: true },
  { id: 'experience', name: 'Work Experience', enabled: true },
  { id: 'education', name: 'Education', enabled: true },
  { id: 'skills', name: 'Skills', enabled: true },
  { id: 'customSections', name: 'Custom Sections', enabled: true },
];

const corporatePreviewData = {
  ...sampleTemplates[0].data,
  personalInfo: {
    ...sampleTemplates[0].data.personalInfo,
    name: 'Richard Sanchez',
    photoUrl: 'https://cdn.getmerlin.in/cms/Screenshot_2024_04_05_130256_473f8428ec.png',
  },
  summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
  layout: initialLayout,
  customSections: [
    {
      id: 'corp-preview-lang',
      title: 'Languages',
      content: '- English (Fluent)\n- French (Fluent)\n- German (Basics)\n- Spanish (Intermediate)'
    },
    {
      id: 'corp-preview-ref',
      title: 'Reference',
      content: 'Estelle Darcy\nWardlere Inc. / CTO\nPhone: 123-456-7890\n\nHarper Richard\nWardlere Inc. / CEO\nPhone: 123-456-7890'
    }
  ]
};

const executivePreviewData = {
  ...sampleTemplates[1].data,
  personalInfo: {
    ...sampleTemplates[1].data.personalInfo,
    name: 'Olivia Wilson',
    photoUrl: 'https://cdn.getmerlin.in/cms/Screenshot_2024_04_05_130256_473f8428ec.png',
  },
  layout: initialLayout,
  customSections: [
    {
      id: 'exec-preview-lang',
      title: 'Languages',
      content: 'English\nFrench'
    },
    {
      id: 'exec-preview-ref',
      title: 'References',
      content: 'Estelle Darcy\nWardlere Inc. / CEO\nPhone: 123-456-7890\n\nHarper Russo\nWardlere Inc. / CEO\nPhone: 123-456-7890'
    }
  ]
};

const modernPreviewData = {
  ...sampleTemplates[0].data,
  personalInfo: {
    ...sampleTemplates[0].data.personalInfo,
    name: 'Lorna Alvarado',
    photoUrl: 'https://cdn.getmerlin.in/cms/Screenshot_2024_04_05_130256_473f8428ec.png',
  },
  summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
  layout: initialLayout,
  skills: ['Management Skills', 'Creativity', 'Digital Marketing', 'Negotiation', 'Critical Thinking', 'Leadership'],
  customSections: [
    {
      id: 'modern-preview-lang',
      title: 'Language',
      content: '- English\n- Spain'
    },
    {
      id: 'modern-preview-ref',
      title: 'References',
      content: 'Harumi Kobayashi\nWardlere Inc. / CEO\nPhone: 123-456-7890\nEmail: hello@reallygreatsite.com\n\nBailey Dupont\nWardlere Inc. / CEO\nPhone: 123-456-7890\nEmail: hello@reallygreatsite.com'
    }
  ]
};

const minimalistPreviewData = {
  ...sampleTemplates[0].data,
  personalInfo: {
    ...sampleTemplates[0].data.personalInfo,
    name: 'Sharya Singh',
    photoUrl: 'https://cdn.getmerlin.in/cms/Screenshot_2024_04_05_130256_473f8428ec.png',
  },
  skills: ['Web Design Tools', 'Front-End', 'Web Accessibility', 'Version Control', 'Color Theory', 'SEO Fundamentals', 'UI/UX Design', 'Typography'],
  customSections: [
    {
      id: 'minimalist-preview-ref',
      title: 'References',
      content: 'Niranjan Devi\nCEO of Wardlere Company\nPhone: 123-456-7890\nSocial: @reallygreatsite\n\nAarya Agarwal\nHRD of Wardlere Company\nPhone: 123-456-7890\nSocial: @reallygreatsite'
    }
  ]
};

const crispPreviewData = {
  ...sampleTemplates[0].data,
  personalInfo: {
    name: 'Lorna Alvarado',
    email: 'hello@reallygreatsite.com',
    phone: '+123-456-7890',
    address: '123 Anywhere St., Any City',
    linkedin: '',
    github: 'www.reallygreatsite.com',
  },
  summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
  experience: [
    { ...sampleTemplates[0].data.experience[0], id: 'crisp-exp-1', company: 'Wardlere Inc.', role: 'Marketing Manager', startDate: '2030', endDate: 'Present' },
    { ...sampleTemplates[0].data.experience[1], id: 'crisp-exp-2', company: 'Studio Showde', role: 'Marketing Manager', startDate: '2027', endDate: '2030' }
  ],
  education: [
    { id: 'crisp-edu-1', institution: 'Wardiere University', degree: 'Master of Strategic Marketing', startDate: '2029', endDate: '2030' },
    { id: 'crisp-edu-2', institution: 'Wardiere University', degree: 'Bachelor of Strategic Marketing', startDate: '2025', endDate: '2029' }
  ],
  skills: ['Project Management', 'Public Relations', 'Teamwork', 'Time Management', 'Leadership', 'Effective Communication', 'Critical Thinking'],
  customSections: [
    { id: 'crisp-ref-1', title: 'References', content: 'Harper Russo\nWardlere Inc. / CEO\nPhone: 123-456-7890' },
    { id: 'crisp-lang-1', title: 'Languages', content: '- English\n- Arabic (basic)\n- German (basic)' }
  ],
  layout: initialLayout,
};

const cleanPreviewData = {
  personalInfo: {
    name: 'Riaan Chandran',
    email: 'hello@reallygreatsite.com',
    phone: '123-456-7890',
    address: '123 Anywhere St., Any City',
    linkedin: '',
    github: 'www.reallygreatsite.com',
  },
  summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
  experience: [
    { id: 'clean-exp-1', company: 'Wordiere Inc.', role: 'Product Design Manager', startDate: '2020', endDate: '2023', description: '- working with the wider development team.\n- Manage website design, content, and SEO Marketing.\n- Branding and Logo Design' },
    { id: 'clean-exp-2', company: 'Arowwai Industries', role: 'Product Design Manager', startDate: '2019', endDate: '2020', description: '- working with the wider development team.\n- Manage website design, content, and SEO Marketing.\n- Branding and Logo Design' },
    { id: 'clean-exp-3', company: 'Ginyard International Co.', role: 'Product Design Manager', startDate: '2017', endDate: '2019', description: '- working with the wider development team.\n- Manage website design, content, and SEO Marketing.\n- Branding and Logo Design' },
  ],
  education: [
    { id: 'clean-edu-1', institution: 'Some University', degree: 'Bachelor of Design', startDate: '2005', endDate: '2008' },
    { id: 'clean-edu-2', institution: 'Another University', degree: 'Bachelor of Design', startDate: '2005', endDate: '2008' },
  ],
  skills: ['Management Skills', 'Digital Marketing', 'Negotiation', 'Critical Thinking', 'Communication Skills', 'Digital Marketing', 'Negotiation'],
  customSections: [
    { id: 'clean-lang-1', title: 'Language', content: '- English\n- Spanish\n- French' },
    { id: 'clean-awards-1', title: 'Awards', content: 'Best Marketing (2021)\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.' },
    { id: 'clean-ref-1', title: 'References', content: 'Krisha Babu\nWordiere Inc. / CEO\nPhone: 123-456-7890\nEmail: hello@reallygreatsite.com\n\nSharin Varma\nWordiere Inc. / CTO\nPhone: 123-456-7890\nEmail: hello@reallygreatsite.com' }
  ],
  layout: initialLayout,
};

const contemporaryPreviewData = {
  ...sampleTemplates[0].data,
  personalInfo: {
    ...sampleTemplates[0].data.personalInfo,
    name: 'Anaisha Parvati',
    photoUrl: 'https://cdn.getmerlin.in/cms/Screenshot_2024_04_05_130256_473f8428ec.png',
  },
  skills: ['Content Creation', 'Analytics', 'Ad Campaigns', 'SEO Knowledge', 'Communication', 'Content Strategy', 'Copywriting', 'Collaboration'],
  customSections: [
    {
      id: 'contemporary-preview-ref',
      title: 'References',
      content: 'Krisha Babu\nCEO of Borcelle Company\nPhone: 123-456-7890\nSocial: @reallygreatsite\n\nSharin Varma\nHRD of Borcelle Company\nPhone: 123-456-7890\nSocial: @reallygreatsite'
    }
  ]
};

const elegantPreviewData = {
  personalInfo: { name: 'Drew Feig', email: 'hello@reallygreatsite.com', phone: '+123-456-7890', address: '123 Anywhere St., Any City, ST 12345', linkedin: '', github: '' },
  summary: 'Highly qualified digital marketing strategist with 7+ years of experience in multiple marketing disciplines, search engine marketing (SEM), and event marketing. Proven ability to drive sales and increase brand awareness for small business clients.',
  experience: [
    { id: 'elegant-exp-1', company: 'Propel marketing and design', role: 'Marketing Strategist', startDate: '2021', endDate: '2022', description: '- Propel works with clients to create effective and unique marketing strategies to help raise their online profile and support their business objective' },
    { id: 'elegant-exp-2', company: 'St. Thynk Unlimited', role: 'Marketing Manager', startDate: '2020', endDate: '2021', description: '- Championed marketing efforts for St. Thynk Unlimited\n- Developed and implemented strategic marketing initiatives, targeted to both internal and external markets, while using marketing and public relation techniques' },
    { id: 'elegant-exp-3', company: '', role: 'Lead Program Support Assistant', startDate: '2018', endDate: '2022', description: '- Managed and trained 5 employees while supervising daily tasks and performing project management\n- Ensured accuracy and authenticity of all recorded information' },
    { id: 'elegant-exp-4', company: 'Hannover and Tyke', role: 'Marketing Assistant', startDate: '2016', endDate: '2018', description: '- Developed, produced, and distributed marketing materials for internal and external initiatives for Hannover and Tyke\n- Lead a team of marketing professionals while planning a special event to promote Hannover and Tyke such as Health campaigns, Brochures, Postcards, press releases, etc.' },
  ],
  education: [{ id: 'elegant-edu-1', institution: 'Bachelor of Science University', degree: 'Computer Graphics Technology focuses on interactive Multimedia Development', startDate: '2009', endDate: '2013' }],
  skills: ['Media relation', 'Brand management', 'Direct Marketing', 'Supervising', 'Newsletter', 'Event planning'],
  customSections: [{ id: 'elegant-interest-1', title: 'Interest', content: '- Monitoring stock market.\n- Managing social media presence.\n- Creating graphic design' }],
  layout: initialLayout,
};

const chicPreviewData = {
  personalInfo: { name: 'Estelle Darcy', email: 'hello@reallygreatsite.com', phone: '123-456-7890', address: '123 Anywhere St., Any City', linkedin: '', github: '', photoUrl: 'https://cdn.getmerlin.in/cms/Screenshot_2024_04_05_130256_473f8428ec.png' },
  summary: 'Creative and detail-oriented Content Creator with 3+ years of experience producing engaging content for online platforms. Skilled in writing, editing, and content strategy development.',
  experience: [{ id: 'chic-exp-1', company: 'Ginyard International Co.', role: 'Content Creator', startDate: '2021', endDate: 'Present', description: '- Produced high-quality written and visual content for website, social media, and email marketing campaigns.\n- Collaborated with marketing team to develop content strategies that increased engagement and brand awareness.\n- Utilize analytics tools to track performance metrics, analyze audience insights, and optimize content strategy for maximum reach and impact.' }],
  education: [{ id: 'chic-edu-1', institution: 'Rimberio University', degree: 'Bachelor\'s Degree in Communication', startDate: '', endDate: 'May 2018' }],
  skills: ['Content Writing', 'Editing', 'SEO Optimization', 'Social Media Management', 'Video Production', 'Graphic Design'],
  customSections: [
    { id: 'chic-portfolio-1', title: 'Portfolio', content: 'www.reallygreatsite.com\nLinks to blog posts, articles, videos, or other content created by the candidate.' },
    { id: 'chic-cert-1', title: 'Certifications', content: 'Content Marketing Certification\nArowwai Industries, June 2019' },
    { id: 'chic-lang-1', title: 'Languages', content: '- English (Native)\n- Spanish (Intermediate)' }
  ],
  layout: initialLayout,
};

const impactfulPreviewData = {
  personalInfo: { name: 'Satria Anugrah', email: 'hello@reallygreatsite.com', phone: '123-456-7890', address: '123 Anywhere St., Any City', linkedin: '', github: '', photoUrl: 'https://cdn.getmerlin.in/cms/Screenshot_2024_04_05_130256_473f8428ec.png' },
  summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc a ultricies ex. Integer mattis dui vel pretium euismod.',
  experience: [
    { id: 'impactful-exp-1', company: 'Wardiere Company', role: 'Graphic Software Designer', startDate: '2014', endDate: '2016', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc a ultricies ex.' },
    { id: 'impactful-exp-2', company: 'Larana Company', role: 'Web Content Manager', startDate: '2016', endDate: 'Present', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc a ultricies ex.' },
  ],
  education: [
    { id: 'impactful-edu-1', institution: 'Borcelle University', degree: 'Bachelor of Developer', startDate: '2010', endDate: '2014' },
    { id: 'impactful-edu-2', institution: 'Borcelle University', degree: 'Master of Designer', startDate: '2014', endDate: '2016' },
  ],
  skills: ['Web Design', 'Problem-Solving', 'Project Management Tools', 'Design Thinking', 'Computer Literacy', 'Strong Communication', 'Wireframe Creation', 'Front End Coding', 'Leadership'],
  customSections: [],
  layout: initialLayout,
};

const designerPreviewData = {
  personalInfo: { name: 'Nina Lane', email: 'nina.lane@email.com', phone: '+1 234 567-8900', address: '', linkedin: '', github: 'ninalane.com', photoUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  summary: 'Creative graphic designer with 5+ years’ experience in impactful print and digital visuals. Skilled in brand identity, social media, and packaging design, with Adobe Creative Suite and Figma expertise. Focused on delivering fresh, aesthetic solutions.',
  experience: [
    { id: 'designer-exp-1', company: 'Brightline Agency | New York, NY', role: 'Senior Graphic Designer', startDate: 'June 2020', endDate: 'Present', description: 'Boosted engagement by 30% through brand campaigns and created identity packages for social media and print.' },
    { id: 'designer-exp-2', company: 'Blue Horizon Media | Brooklyn, NY', role: 'Graphic Designer', startDate: 'March 2017', endDate: 'May 2020', description: 'Boosted retention by 25% and developed eco-friendly packaging while mentoring designers.' },
  ],
  education: [
    { id: 'designer-edu-1', institution: 'Parsons School of Design | New York, NY', degree: 'Bachelor of Fine Arts in Graphic Design', startDate: '', endDate: '2017' },
  ],
  skills: ['Photoshop', 'Illustrator', 'Web Design'],
  customSections: [
    { id: 'designer-portfolio-1', title: 'Portfolio', content: 'Social Media Campaign for Eco Wave Brand:\nTransformed their social media presence with cohesive visuals and engaging graphics.\n\nEvent Branding for the annual NYC Art Expo:\nDeveloped event branding from logo to banners, enhancing attendee experience.' },
    { id: 'designer-interests-1', title: 'Interests', content: '- Minimalist Art\n- Urban Photography\n- Art Installations' }
  ],
  layout: initialLayout,
};

const greenfieldPreviewData = {
  personalInfo: { name: 'Elijah Williams', email: 'hello@youngsite.com', phone: '123-456-7890', address: '', linkedin: 'linkedin.com/in/name', github: '', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  summary: '',
  experience: [
    { id: 'gf-exp-1', company: 'Saas Company, LLC', role: 'Account Sales Executive', startDate: 'Jan 2020', endDate: 'Jan 2022', description: 'A global Saas company providing supply chain services across various software industries in the United States.\n- Boosted sales activities by 30% in the west coast region by overseeing the process and operations of closing deals.\n- Maintained a 100% client satisfaction rating and generated 10% growth in annual sales revenue by working closely with international sales teams.' },
    { id: 'gf-exp-2', company: 'Content Company, Inc.', role: 'Field Sales Manager', startDate: 'Jan 2020', endDate: 'Jan 2022', description: 'A global content company providing content and editing services across various publishing companies in the United States.\n- Increased customer loyalty by 40% within six months of managing key accounts on the east coast while serving as a coordinator within the operations team.' },
  ],
  education: [
    { id: 'gf-edu-1', institution: 'Harvard University', degree: 'Bachelor of Science in Business Administration', startDate: '', endDate: 'May 2020' },
    { id: 'gf-edu-2', institution: 'North Shore Community College', degree: 'Associate\'s Degree in Sales and Marketing', startDate: '', endDate: 'May 2018' },
  ],
  skills: ['Account Management', 'Customer Relationship Management Software', 'Strategic and Social Selling', 'Team Leadership', 'Adobe Photoshop', 'Salesforce'],
  customSections: [],
  layout: initialLayout,
};

const corporateBluePreviewData = {
  personalInfo: { name: 'Herman Walton', email: 'example@gmail.com', phone: '(412) 479-6342', address: 'Market Street 12, New York, 1021, The USA', linkedin: '', github: '', photoUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  summary: 'Experienced and driven Financial Analyst with an impressive background of managing multi-million dollar budgets while providing analysis and account support within product development departments. Worked to reduce business expenses and develop logical and advantageous operating plan budgets. Experience creating quarterly accruals based on trends and forecasted expenses.',
  experience: [
    { id: 'cb-exp-1', company: 'GEO Corp.', role: 'Financial Analyst', startDate: 'Jan 2012', endDate: 'Present', description: '- Created budgets and ensured that labor and material costs were decreased by 15 percent.\n- Created financial reports on completed projects, indicating advantageous results.' },
    { id: 'cb-exp-2', company: 'Cisco Enterprises', role: 'Financial Analyst', startDate: 'Feb 2008', endDate: 'Dec 2012', description: '- Provide reports, ad-hoc analysis, annual operations plan budgets, monthly cash forecasts, and revenue forecasts.\n- Analyzed supplier contracts and advised in negotiations bringing budgets down by 6%.' },
  ],
  education: [
    { id: 'cb-edu-1', institution: 'University of Arizona', degree: 'Diploma in Computer Engineering', startDate: 'Aug 2006', endDate: 'Oct 2008' },
    { id: 'cb-edu-2', institution: 'University of Arizona', degree: 'Bachelor in Computer Engineering', startDate: 'Aug 2004', endDate: 'Oct 2006' },
  ],
  skills: ['Solution Strategies', 'Analytical Thinker', 'Innovation', 'Agile Methodologies', 'Effective Team Leader', 'Market Assessment', 'Collaboration', 'Creative Problem Solving'],
  customSections: [{ id: 'cb-add-1', title: 'Additional Information', content: '- Languages: English, French\n- Certificates: Financial Analyst License\n- Awards/Activities: Most Innovate Employer of the Year (2011), Overall Best Employee Division Two (2009)' }],
  layout: initialLayout,
};

const atsFriendlyPreviewData = {
  personalInfo: { name: 'Dana Scully', email: 'danascully@example.com', phone: '+1-202-555-0173', address: 'Washington D.C., United States, USA', linkedin: 'linkedin.com/in/danascully', github: '', photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  summary: 'Experienced ATG Format Specialist with a background in medicine and law enforcement. Skilled in data analysis and implementing record management systems in various professional settings. Strong analytical skills with a keen eye for detail.',
  experience: [
    { id: 'ats-exp-1', company: 'Federal Bureau of Investigation, Washington, D.C.', role: 'Special Agent', startDate: 'Mar 1992', endDate: 'Mar 2002', description: '- Investigated unsolved cases involving paranormal phenomena\n- Utilized ATS for case file management' },
    { id: 'ats-exp-2', company: 'Our Lady of Sorrows Hospital, Washington, D.C.', role: 'Medical Doctor', startDate: 'Jun 1980', endDate: 'Mar 1992', description: '- Specialized in the field of forensic pathology\n- Implemented ATS for patient record management' },
  ],
  education: [
    { id: 'ats-edu-1', institution: 'University of Maryland, College Park, MD', degree: 'Bachelor of Science in Physics', startDate: '', endDate: '1986' },
    { id: 'ats-edu-2', institution: 'Stanford University School of Medicine, Stanford, CA', degree: 'Doctor of Medicine', startDate: '', endDate: '1990' },
  ],
  skills: ['ATS Management', 'Forensic Pathology', 'Investigation', 'Data Analysis'],
  customSections: [
    { id: 'ats-lang-1', title: 'Languages', content: 'English\nGerman\nRussian' },
    { id: 'ats-ref-1', title: 'Reference', content: 'Fox Mulder\nFederal Bureau of Investigation\nP: +1-202-555-0199\nE: foxmulder@example.com' },
    { id: 'ats-hob-1', title: 'Hobbies', content: '- Reading\n- Running\n- Skeet Shooting\n- Bargaining\n- Cooking' },
  ],
  layout: initialLayout,
};

const techModernPreviewData = {
  personalInfo: {
    name: 'Alex Chen',
    email: 'alex.chen@example.com',
    phone: '+1 (555) 123-4567',
    address: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexchen',
    github: 'github.com/alexchen',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=3087&auto=format&fit=crop'
  },
  summary: 'Innovative software engineer with 6+ years of experience in full-stack development. Passionate about creating scalable solutions and leveraging cutting-edge technologies to solve complex problems. Proven track record in leading development teams and delivering high-impact projects.',
  experience: [
    { id: 'tm-exp-1', company: 'TechCorp Solutions', role: 'Senior Software Engineer', startDate: 'Jan 2021', endDate: 'Present', description: '- Led development of microservices architecture serving 2M+ users\n- Implemented CI/CD pipeline reducing deployment time by 60%\n- Mentored team of 5 junior developers' },
    { id: 'tm-exp-2', company: 'StartupHub Inc.', role: 'Full Stack Developer', startDate: 'Mar 2018', endDate: 'Dec 2020', description: '- Built RESTful APIs and responsive web applications\n- Optimized database queries improving performance by 40%\n- Collaborated with UX team on user-centric features' },
  ],
  education: [
    { id: 'tm-edu-1', institution: 'Stanford University', degree: 'B.S. in Computer Science', startDate: '2014', endDate: '2018' },
  ],
  skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Docker', 'AWS', 'PostgreSQL', 'Git', 'Agile/Scrum'],
  customSections: [
    { id: 'tm-cert-1', title: 'Certifications', content: '- AWS Certified Solutions Architect\n- Google Cloud Professional Developer' }
  ],
  layout: initialLayout,
};

const professionalPortfolioPreviewData = {
  personalInfo: {
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@email.com',
    phone: '+1 (555) 987-6543',
    address: 'New York, NY',
    linkedin: 'linkedin.com/in/sarahmitchell',
    github: 'github.com/smitchell'
  },
  summary: 'Strategic marketing professional with 8+ years of experience driving brand growth and customer engagement. Expertise in digital marketing, content strategy, and data-driven campaign optimization. Proven ability to lead cross-functional teams and deliver measurable results.',
  experience: [
    { id: 'pp-exp-1', company: 'Global Brands Inc.', role: 'Marketing Director', startDate: 'Jun 2020', endDate: 'Present', description: '- Spearheaded global marketing campaigns increasing brand awareness by 45%\n- Managed $2M annual marketing budget with 25% ROI improvement\n- Led team of 12 marketing professionals across multiple channels' },
    { id: 'pp-exp-2', company: 'Creative Agency Co.', role: 'Senior Marketing Manager', startDate: 'Feb 2017', endDate: 'May 2020', description: '- Developed integrated marketing strategies for Fortune 500 clients\n- Increased client engagement rates by 60% through targeted campaigns\n- Collaborated with creative teams to produce award-winning content' },
    { id: 'pp-exp-3', company: 'Digital Solutions Ltd.', role: 'Marketing Specialist', startDate: 'Aug 2015', endDate: 'Jan 2017', description: '- Executed social media strategies growing followers by 200%\n- Analyzed campaign metrics to optimize marketing performance\n- Created content calendars and managed brand consistency' },
  ],
  education: [
    { id: 'pp-edu-1', institution: 'New York University', degree: 'MBA in Marketing', startDate: '', endDate: '2015' },
    { id: 'pp-edu-2', institution: 'Boston University', degree: 'B.A. in Communications', startDate: '', endDate: '2013' },
  ],
  skills: ['Digital Marketing', 'Brand Strategy', 'Content Marketing', 'SEO/SEM', 'Analytics', 'Team Leadership', 'Budget Management', 'Adobe Creative Suite'],
  customSections: [
    { id: 'pp-awards-1', title: 'Awards', content: 'Marketing Excellence Award 2022\nBest Digital Campaign 2021' },
    { id: 'pp-lang-1', title: 'Languages', content: '- English (Native)\n- Spanish (Fluent)\n- French (Conversational)' }
  ],
  layout: initialLayout,
};

export const previewDataMap: Record<string, ResumeData> = {
  classic: { ...sampleTemplates[0].data, layout: initialLayout, id: 'preview-classic', title: 'Classic Template', templateId: 'classic', lastModified: Date.now() },
  creative: { ...sampleTemplates[2].data, layout: initialLayout, id: 'preview-creative', title: 'Creative Template', templateId: 'creative', lastModified: Date.now() },
  corporate: { ...corporatePreviewData, id: 'preview-corporate', title: 'Corporate Template', templateId: 'corporate', lastModified: Date.now() },
  executive: { ...executivePreviewData, id: 'preview-executive', title: 'Executive Template', templateId: 'executive', lastModified: Date.now() },
  modern: { ...modernPreviewData, id: 'preview-modern', title: 'Modern Template', templateId: 'modern', lastModified: Date.now() },
  minimalist: { ...minimalistPreviewData, id: 'preview-minimalist', title: 'Minimalist Template', templateId: 'minimalist', lastModified: Date.now() },
  crisp: { ...crispPreviewData, id: 'preview-crisp', title: 'Crisp Template', templateId: 'crisp', lastModified: Date.now() },
  clean: { ...cleanPreviewData, id: 'preview-clean', title: 'Clean Template', templateId: 'clean', lastModified: Date.now() },
  contemporary: { ...contemporaryPreviewData, id: 'preview-contemporary', title: 'Contemporary Template', templateId: 'contemporary', lastModified: Date.now() },
  elegant: { ...elegantPreviewData, id: 'preview-elegant', title: 'Elegant Template', templateId: 'elegant', lastModified: Date.now() },
  chic: { ...chicPreviewData, id: 'preview-chic', title: 'Chic Template', templateId: 'chic', lastModified: Date.now() },
  impactful: { ...impactfulPreviewData, id: 'preview-impactful', title: 'Impactful Template', templateId: 'impactful', lastModified: Date.now() },
  designer: { ...designerPreviewData, id: 'preview-designer', title: 'Designer Template', templateId: 'designer', lastModified: Date.now() },
  greenfield: { ...greenfieldPreviewData, id: 'preview-greenfield', title: 'Greenfield Template', templateId: 'greenfield', lastModified: Date.now() },
  'corporate-blue': { ...corporateBluePreviewData, id: 'preview-corporate-blue', title: 'Corporate Blue Template', templateId: 'corporate-blue', lastModified: Date.now() },
  'ats-friendly': { ...atsFriendlyPreviewData, id: 'preview-ats-friendly', title: 'ATS Friendly Template', templateId: 'ats-friendly', lastModified: Date.now() },
  'tech-modern': { ...techModernPreviewData, id: 'preview-tech-modern', title: 'Tech Modern Template', templateId: 'tech-modern', lastModified: Date.now() },
  'professional-portfolio': { ...professionalPortfolioPreviewData, id: 'preview-professional-portfolio', title: 'Professional Portfolio Template', templateId: 'professional-portfolio', lastModified: Date.now() },
};