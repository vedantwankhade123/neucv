import { ResumeData, LayoutItem } from '@/types/resume';
import { v4 as uuidv4 } from 'uuid';

export interface Template {
  name: string;
  data: ResumeData;
}

const defaultLayout: LayoutItem[] = [
  { id: 'summary', name: 'Professional Summary', enabled: true },
  { id: 'experience', name: 'Work Experience', enabled: true },
  { id: 'education', name: 'Education', enabled: true },
  { id: 'skills', name: 'Skills', enabled: true },
  { id: 'customSections', name: 'Custom Sections', enabled: true },
];

export const templates: Template[] = [
  {
    name: 'Software Engineer',
    data: {
      personalInfo: {
        name: 'Alex Doe',
        email: 'alex.doe@email.com',
        phone: '555-123-4567',
        address: '456 Tech Ave, Silicon Valley, CA',
        linkedin: 'https://linkedin.com/in/alexdoe',
        github: 'https://github.com/alexdoe',
      },
      summary: 'Highly motivated and results-oriented software engineer with 5+ years of experience in developing and scaling web applications. Seeking to leverage my skills in TypeScript, React, and distributed systems to contribute to a challenging new role.',
      experience: [
        {
          id: uuidv4(),
          company: 'Innovate Inc.',
          role: 'Senior Software Engineer',
          startDate: 'Jun 2021',
          endDate: 'Present',
          description: '- Led the development of a new microservices architecture, improving system scalability by 40%.\n- Mentored junior engineers and conducted code reviews to maintain code quality.\n- Optimized application performance, reducing API response times by 200ms.',
        },
        {
          id: uuidv4(),
          company: 'Code Solutions',
          role: 'Software Engineer',
          startDate: 'Jul 2018',
          endDate: 'May 2021',
          description: '- Developed and maintained features for a large-scale e-commerce platform using React and Node.js.\n- Collaborated with product managers to define feature requirements.\n- Wrote unit and integration tests to ensure software reliability.',
        },
      ],
      education: [
        {
          id: uuidv4(),
          institution: 'State University',
          degree: 'B.S. in Computer Science',
          startDate: 'Sep 2014',
          endDate: 'May 2018',
        },
      ],
      skills: ['TypeScript', 'React', 'Node.js', 'GraphQL', 'Docker', 'AWS', 'PostgreSQL'],
      customSections: [
        {
          id: uuidv4(),
          title: 'Projects',
          content: '- Resume Builder: A web application to create and customize professional resumes. Built with React, TypeScript, and Tailwind CSS.\n- E-commerce Store API: A RESTful API for an online store with features like product management, user authentication, and order processing.'
        }
      ],
      layout: defaultLayout,
    },
  },
  {
    name: 'Project Manager',
    data: {
      personalInfo: {
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        phone: '555-987-6543',
        address: '789 Business Blvd, New York, NY',
        linkedin: 'https://linkedin.com/in/janesmithpm',
        github: '',
      },
      summary: 'Detail-oriented Project Manager with a proven track record of success in managing complex projects from inception to completion. Adept at leading cross-functional teams and implementing Agile methodologies to drive efficiency and productivity.',
      experience: [
        {
          id: uuidv4(),
          company: 'Global Corp',
          role: 'Senior Project Manager',
          startDate: 'Mar 2019',
          endDate: 'Present',
          description: '- Managed a portfolio of 5+ projects simultaneously with budgets up to $2M.\n- Coordinated cross-functional teams of developers, designers, and QA testers.\n- Implemented Agile methodologies, resulting in a 25% increase in team productivity.',
        },
        {
          id: uuidv4(),
          company: 'Biz Solutions',
          role: 'Project Coordinator',
          startDate: 'Jun 2016',
          endDate: 'Feb 2019',
          description: '- Assisted in planning and executing project timelines and deliverables.\n- Facilitated communication between stakeholders and the project team.\n- Prepared project status reports and documentation.',
        },
      ],
      education: [
        {
          id: uuidv4(),
          institution: 'Business College',
          degree: 'MBA in Project Management',
          startDate: 'Aug 2014',
          endDate: 'May 2016',
        },
      ],
      skills: ['Agile Methodologies', 'Scrum', 'JIRA', 'Risk Management', 'Budgeting', 'Stakeholder Communication'],
      customSections: [],
      layout: defaultLayout,
    },
  },
  {
    name: 'Graphic Designer',
    data: {
      personalInfo: {
        name: 'Sam Wilson',
        email: 'sam.wilson@email.com',
        phone: '555-555-5555',
        address: '101 Art St, Creative City, CA',
        linkedin: 'https://linkedin.com/in/samwilsonart',
        github: '',
      },
      summary: 'Creative and passionate Graphic Designer with extensive experience in branding, UI/UX, and print design. Proficient in Adobe Creative Suite and committed to delivering high-quality, visually compelling work.',
      experience: [
        {
          id: uuidv4(),
          company: 'Creative Agency',
          role: 'Lead Graphic Designer',
          startDate: 'Jan 2020',
          endDate: 'Present',
          description: '- Led design projects from concept to completion for major clients in the tech and retail sectors.\n- Developed brand identities, including logos, color palettes, and typography.\n- Mentored a team of junior designers and provided creative direction.',
        },
        {
          id: uuidv4(),
          company: 'Design Studio',
          role: 'Graphic Designer',
          startDate: 'May 2017',
          endDate: 'Dec 2019',
          description: '- Created marketing materials, including brochures, social media graphics, and web banners.\n- Collaborated with marketing teams to create visually compelling campaigns.\n- Worked with Adobe Creative Suite (Photoshop, Illustrator, InDesign).',
        },
      ],
      education: [
        {
          id: uuidv4(),
          institution: 'Art & Design University',
          degree: 'B.F.A. in Graphic Design',
          startDate: 'Sep 2013',
          endDate: 'May 2017',
        },
      ],
      skills: ['Adobe Photoshop', 'Adobe Illustrator', 'Adobe InDesign', 'UI/UX Design', 'Branding', 'Typography', 'Figma'],
      customSections: [],
      layout: defaultLayout,
    },
  },
];