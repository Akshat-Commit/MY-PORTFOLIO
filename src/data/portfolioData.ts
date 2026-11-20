export interface SkillItem {
  name: string;
  note: string;
  anchor?: boolean;
}

export interface SkillGroup {
  id: string;
  title: string;
  defaultNote: string;
  items: SkillItem[];
}

export interface ArchitectureStage {
  label: string;
  detail: string;
}

export interface ProjectCaseStudy {
  id: string;
  title: string;
  shortTitle: string;
  category: string;
  period: string;
  tagline: string;
  summary: string;
  challenge: string;
  delivery: string;
  impact: string;
  stack: string[];
  githubUrl: string;
  visualAccent: 'opendesk' | 'resona' | 'gmail' | 'hackwave';
  architectureTitle: string;
  architectureStages: ArchitectureStage[];
  fallbackChain?: string[];
}

export interface JourneyStop {
  id: string;
  period: string;
  badge?: string;
  isCurrent?: boolean;
  role: string;
  organization: string;
  location: string;
  summary: string;
}

export const PORTFOLIO_ASSETS = {
  character: '/src/assets/images/akshat_character_1795085505861.jpg',
  crowdSheet: '/src/assets/images/crowd_sheet_one_1795085502877.jpg',
  heroPortrait: '/assets/aistudio/Joyful_Monochrome_Studio_Portrait_f05c4ca5.png',
  opendeskVisual: '/src/assets/images/project_opendesk_visual_1795085503160.jpg',
  resumePdf: '/assets/aistudio/Akshat_Jain_Resume_2_7057d70e.pdf',
} as const;

export const PROFILE = {
  firstName: 'Akshat',
  fullName: 'Akshat Jain',
  role: 'Software Engineer · Backend & Multi-Agent AI',
  location: 'Indore, MP, India',
  email: 'aj452794@gmail.com',
  phone: '+91 6263635364',
  github: 'https://github.com/Akshat-Commit',
  linkedin: 'https://www.linkedin.com/in/akshatjaindevs',
  year: '2026',
  availability: 'Seeking Backend & Full-Stack Software Engineering Roles',
  bioLead:
    "Final-year Computer Science student at Medicaps University building reliable Java backend systems and multi-agent AI tools that actually ship.",
  bioBody:
    "My work sits at the intersection of enterprise backend craft—Spring Boot, Hibernate, FastAPI, and relational databases—and practical LLM orchestration. From remotely controlling a Windows desktop through a three-agent Telegram pipeline to winning HackWave 2.0 with a coordinated multi-agent system, I care about architecture that degrades gracefully and stays fast under real constraints.",
};

export const SKILL_GROUPS: SkillGroup[] = [
  {
    id: 'ai-ml',
    title: 'AI & Multi-Agent LLMs',
    defaultNote:
      'Hover any capability to see where I have applied it across multi-agent systems, RAG pipelines, and generative AI.',
    items: [
      {
        name: 'Multi-Agent Systems',
        anchor: true,
        note: 'Architected 3-agent pipelines (Parser -> Executor -> Formatter) for OpenDesk AI and the 1st-place HackWave 2.0 system.',
      },
      {
        name: 'Claude',
        note: 'Primary reasoning tier in OpenDesk AI’s multi-model fallback chain for structured desktop command planning.',
      },
      {
        name: 'Gemini',
        note: 'Secondary low-latency fallback and multimodal reasoning model integrated into agentic workflows.',
      },
      {
        name: 'Generative AI',
        note: 'Oracle Cloud Generative AI certified—shipping practical LLM workflows, voice synthesis, and automated drafting.',
      },
      {
        name: 'LLMs',
        anchor: true,
        note: 'Orchestrating cloud and local language models with resilient fallback chains and structured tool calling.',
      },
      {
        name: 'RAG',
        note: 'Retrieval-augmented generation pipelines pairing semantic context retrieval with grounded LLM reasoning.',
      },
      {
        name: 'Prompt Engineering',
        note: 'Deterministic structured outputs, tool schemas, and guardrails for safe OS-level command execution.',
      },
      {
        name: 'NLP',
        note: 'Semantic file search, intent parsing, and retrieval-grounded response generation.',
      },
    ],
  },
  {
    id: 'languages-backend',
    title: 'Languages & Frameworks',
    defaultNote:
      'Strong foundation in Java enterprise ecosystems, Python API frameworks, and clean RESTful service boundaries.',
    items: [
      {
        name: 'Java',
        anchor: true,
        note: 'Core backend language across enterprise J2EE internship experience, Spring Boot APIs, and ORM persistence.',
      },
      {
        name: 'Spring Boot',
        note: 'Production REST APIs, CORS-hardened AI inference bridges, and microservice architecture.',
      },
      {
        name: 'Python',
        note: 'Primary language for OpenDesk AI, FastAPI voice-cloning services, and multi-agent orchestration.',
      },
      {
        name: 'FastAPI',
        note: 'Async Python backend powering Resona AI voice profile management and audio streaming playback.',
      },
      {
        name: 'Hibernate & JPA',
        anchor: true,
        note: 'Relational entity modeling, HQL querying, and transactional persistence in enterprise Java apps.',
      },
      {
        name: 'Spring Framework',
        note: 'Dependency injection, MVC controllers, and layered enterprise service composition.',
      },
      {
        name: 'Microservices',
        note: 'Modular service decomposition and resilient fallback patterns across distributed APIs.',
      },
      {
        name: 'REST APIs',
        note: 'Contract-driven endpoints verified with Postman API Testing suites and strict error handling.',
      },
      {
        name: 'Django',
        anchor: true,
        note: 'Rapid full-stack web backends and admin tooling with structured database migrations.',
      },
      {
        name: 'J2EE / Servlets',
        note: 'Enterprise Java internship exposure spanning Servlets, JSP, and web service lifecycle internals.',
      },
      {
        name: 'C',
        note: 'Low-level memory fundamentals, data structures, and systems coursework at Medicaps University.',
      },
    ],
  },
  {
    id: 'frontend-data-tools',
    title: 'Database & Tools',
    defaultNote:
      'Solid SQL schema design, edge cloud deployment, and disciplined API & workflow automation tooling.',
    items: [
      {
        name: 'Cloudflare',
        anchor: true,
        note: 'Edge deployment, DNS routing, and low-latency security layers for production web services.',
      },
      {
        name: 'PostgreSQL',
        note: 'Production relational modeling, indexing, and structured query tuning.',
      },
      {
        name: 'MySQL & SQLite',
        note: 'Used across Spring Boot services, lightweight local state, and Hibernate/HQL workloads.',
      },
      {
        name: 'UiPath Studio',
        anchor: true,
        note: 'Designed AI-integrated RPA payroll pipelines (CSV parsing, PDF/Word output, automated email delivery).',
      },
      {
        name: 'Git & GitHub',
        anchor: true,
        note: 'Open-source releases, clean branching workflows, and collaborative hackathon delivery.',
      },
      {
        name: 'Postman & Maven',
        note: 'Certified Postman API testing workflows paired with Maven builds for Java services.',
      },
      {
        name: 'Vercel & Cursor',
        note: 'Fast iterative deployment and modern AI-assisted engineering workflows.',
      },
    ],
  },
];

export const PROJECTS: ProjectCaseStudy[] = [
  {
    id: 'opendesk-ai',
    title: 'OpenDesk AI',
    shortTitle: 'OpenDesk AI',
    category: 'Multi-Agent OS Control · Open Source',
    period: '2026 – Present',
    tagline: 'Remote Windows PC control from Telegram through a resilient 3-agent LLM pipeline.',
    summary:
      'An open-source Python tool that turns Telegram into an intelligent remote desk for Windows—supporting semantic file lookup, on-demand screenshots, and live process management without brittle shell scripts.',
    challenge:
      'Remote desktop assistants fail when single-prompt LLMs hallucinate unsafe OS commands or stall when one model provider hits rate limits or goes offline.',
    delivery:
      'Separated responsibility across a deterministic three-agent pipeline—Command Parser, Executor, and Formatter—backed by an automatic Claude -> Gemini -> Ollama fallback chain so tasks complete even during API outages.',
    impact:
      'Delivers natural-language semantic file search, instant desktop screenshot capture, and guarded remote process control directly inside any Telegram chat.',
    stack: ['Python', 'Claude', 'Gemini', 'Ollama', 'Telegram Bot API', 'Multi-Agent LLMs'],
    githubUrl: 'https://github.com/Akshat-Commit',
    visualAccent: 'opendesk',
    architectureTitle: 'Three-Agent Execution & Fallback Pipeline',
    architectureStages: [
      {
        label: '01. Telegram Ingress',
        detail: 'Authenticated user command arrives via Telegram Bot API with session context.',
      },
      {
        label: '02. Command Parser Agent',
        detail: 'Classifies intent (file search, screenshot, process control) into a typed action plan.',
      },
      {
        label: '03. Executor Agent',
        detail: 'Runs validated Windows OS operations, semantic directory search, or frame capture safely.',
      },
      {
        label: '04. Formatter Agent',
        detail: 'Compresses raw stdout, paths, or images into concise Telegram-ready replies.',
      },
    ],
    fallbackChain: ['Claude (Primary)', 'Gemini (Fallback)', 'Ollama (Local Offline)'],
  },
  {
    id: 'resona-ai',
    title: 'Resona AI',
    shortTitle: 'Resona AI',
    category: 'Full-Stack Voice Cloning · Open Source',
    period: '2026 – Present',
    tagline: 'Clone any voice from a short audio sample with real-time playback and profile management.',
    summary:
      'A full-stack open-source voice cloning studio built with FastAPI, React, TypeScript, and Coqui XTTS-v2—turning short reference recordings into reusable voice profiles.',
    challenge:
      'Open-source neural TTS engines often live behind raw notebooks and CLI scripts, making iterative voice testing and profile reuse slow and error-prone.',
    delivery:
      'Architected a clean FastAPI backend handling reference audio ingestion, Coqui XTTS-v2 inference, and persistent voice profile storage paired with a responsive React/TypeScript studio UI for immediate playback.',
    impact:
      'Enables sub-minute voice profile creation and real-time audio synthesis locally with full control over reference samples and generated clips.',
    stack: ['FastAPI', 'React', 'TypeScript', 'Coqui XTTS-v2', 'Python'],
    githubUrl: 'https://github.com/Akshat-Commit',
    visualAccent: 'resona',
    architectureTitle: 'Voice Profile & Real-Time Synthesis Flow',
    architectureStages: [
      {
        label: '01. Sample Upload',
        detail: 'React/TypeScript client validates and uploads a short reference audio clip.',
      },
      {
        label: '02. Profile Registry',
        detail: 'FastAPI normalizes audio metadata and registers reusable speaker embeddings.',
      },
      {
        label: '03. XTTS-v2 Engine',
        detail: 'Coqui XTTS-v2 synthesizes target prompt text conditioned on the chosen speaker profile.',
      },
      {
        label: '04. Live Playback',
        detail: 'Streams generated waveform back to the browser for instant auditioning and export.',
      },
    ],
  },
  {
    id: 'gmail-ai-extension',
    title: 'Gmail AI Chrome Extension',
    shortTitle: 'Gmail AI',
    category: 'Spring Boot + Local LLM · Chrome Extension',
    period: '2025',
    tagline: 'Native AI email drafting injected directly into Gmail compose—powered by local Llama 3.',
    summary:
      'A Chrome extension that injects a contextual AI email-generation button straight into Gmail’s compose toolbar, backed by a Spring Boot server running locally hosted Llama 3 via Ollama.',
    challenge:
      'Gmail’s SPA DOM mutates unpredictably across threads and pop-out compose windows, while routing private emails through third-party APIs raises privacy concerns.',
    delivery:
      'Built resilient MutationObserver-based DOM detection to mount the trigger cleanly inside every compose window, communicating with a Spring Boot REST backend with production-grade CORS handling and local Ollama inference.',
    impact:
      'Zero-cost, privacy-preserving email generation inside Gmail with enterprise Java backend discipline.',
    stack: ['Spring Boot', 'Llama 3', 'Ollama', 'JavaScript', 'Chrome Extensions API'],
    githubUrl: 'https://github.com/Akshat-Commit',
    visualAccent: 'gmail',
    architectureTitle: 'Dynamic DOM Injection & Spring Boot Bridge',
    architectureStages: [
      {
        label: '01. DOM Observer',
        detail: 'Content script detects newly opened or docked Gmail compose containers dynamically.',
      },
      {
        label: '02. Context Capture',
        detail: 'Reads subject line, draft seed, and tone intent when the injected button is clicked.',
      },
      {
        label: '03. Spring Boot API',
        detail: 'Validates origin via strict CORS rules and dispatches structured prompt to Ollama.',
      },
      {
        label: '04. Compose Injection',
        detail: 'Local Llama 3 draft returns and populates Gmail’s editable body preserving formatting.',
      },
    ],
  },
  {
    id: 'hackwave-multi-agent',
    title: 'HackWave 2.0 Multi-Agent Engine',
    shortTitle: 'HackWave 2.0',
    category: '1st Place Winner · Multi-Agent AI',
    period: '2025',
    tagline: 'Award-winning multi-agent architecture with specialized retrieval, reasoning, and synthesis agents.',
    summary:
      'Secured 1st place at HackWave 2.0 Hackathon (Chameli Devi Institute of Technology, Indore) by designing and live-demoing a coordinated multi-agent AI architecture.',
    challenge:
      'Monolithic LLM calls struggled to stay accurate when queries demanded both factual grounding and multi-step logical synthesis under tight hackathon demo conditions.',
    delivery:
      'Designed a clean coordinator pattern routing tasks across three dedicated agents—Information Retrieval, Reasoning, and Response Generation—with transparent intermediate state inspection during the live judge demo.',
    impact:
      'Won 1st Place overall out of competing university teams after a live end-to-end architectural walkthrough.',
    stack: ['Multi-Agent AI', 'Python', 'Prompt Engineering', 'NLP', 'System Architecture'],
    githubUrl: 'https://github.com/Akshat-Commit',
    visualAccent: 'hackwave',
    architectureTitle: 'Coordinated Three-Role Agent Topology',
    architectureStages: [
      {
        label: '01. Coordinator',
        detail: 'Decomposes incoming query and tracks shared scratchpad state across steps.',
      },
      {
        label: '02. Retrieval Agent',
        detail: 'Fetches relevant source context and filters noise before reasoning starts.',
      },
      {
        label: '03. Reasoning Agent',
        detail: 'Evaluates retrieved facts, checks contradictions, and builds a structured argument.',
      },
      {
        label: '04. Response Agent',
        detail: 'Synthesizes clear, verifiable user-facing output ready for live inspection.',
      },
    ],
  },
];

export const JOURNEY_STOPS: JourneyStop[] = [
  {
    id: 'uipath',
    badge: 'Latest',
    isCurrent: true,
    period: 'July 2026',
    role: 'Specialized AI Associate Training',
    organization: 'UiPath Academy',
    location: 'AI-Integrated RPA & Automation',
    summary:
      'Completed Specialized AI Associate training and built hands-on automation workflows including end-to-end payroll processing (CSV parsing, salary calculation, PDF/Word generation, automated email delivery) in UiPath Studio.',
  },
  {
    id: 'open-source-ai',
    badge: 'Ongoing',
    period: '2025 – Present',
    role: 'AI & Backend Systems Builder',
    organization: 'Open-Source Projects',
    location: 'Indore, India',
    summary:
      'Building multi-agent LLM and full-stack tools including OpenDesk AI (3-agent Telegram PC control), Resona AI (Coqui XTTS-v2 voice cloning), and the Spring Boot + Llama 3 Gmail Chrome Extension.',
  },
  {
    id: 'hackwave',
    period: '2025 – 2026',
    role: 'Winner — HackWave 2.0 Hackathon',
    organization: 'Chameli Devi Institute of Technology',
    location: '1st Place · OCI GenAI & Postman Certified',
    summary:
      'Secured 1st place designing and live-demoing a coordinated multi-agent AI system for retrieval, reasoning, and synthesis. Earned Oracle Cloud Generative AI Professional and Postman API Testing certifications.',
  },
  {
    id: 'medicaps',
    period: 'Aug 2023 – May 2027',
    role: 'B.Tech in Computer Science & Engineering',
    organization: 'Medicaps University',
    location: 'Indore, India · CGPA 6.76',
    summary:
      'Final-year Computer Science student with enterprise Java internship exposure (J2EE, Spring Boot, Hibernate) and strong foundations in backend architecture, SQL databases, and applied AI.',
  },
];

export const ASK_AI_SUGGESTIONS = [
  "Summarize Akshat's backend & Java experience",
  'How does OpenDesk AI’s 3-agent pipeline work?',
  'What did Akshat build to win HackWave 2.0?',
  'Why hire Akshat for a Full-Stack / AI role?',
];
