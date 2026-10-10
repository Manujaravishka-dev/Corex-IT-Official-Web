export type Project = {
  id: string;
  slug: string;
  title: string;
  category: string;
  type: string;
  industry: string;
  image: string;
  images: string[];
  year: string;
  description: string;
  overview: string;
  features: string[];
  technologies: string[];
  challenge?: string;
  solution?: string;
  status?: string;
};

export const projects: Project[] = [
  {
    id: "nexus",
    slug: "nexus-analytics",
    title: "Nexus Analytics",
    category: "Web Application",
    type: "Web Application",
    industry: "Finance",
    year: "2024",
    image: "",
    images: [],
    description:
      "Real-time analytics platform for enterprise data — interactive dashboards, drill-downs and sub-40ms queries for finance teams.",
    overview:
      "Nexus Analytics is a web-based analytics platform designed to help finance teams visualize complex data streams. The product focuses on performance, clarity and reliability — delivering interactive dashboards, detailed drill-downs and fast query handling for high-volume enterprise datasets. Built as a responsive web application, it emphasizes clean data presentation and secure access.",
    features: [
      "Interactive dashboards with real-time updates",
      "Drill-down data exploration",
      "Role-based access control",
      "Secure data handling",
      "Responsive web interface",
    ],
    technologies: ["React", "Next.js", "Node.js", "PostgreSQL", "D3.js"],
    challenge:
      "Finance teams needed a way to explore large, fast-changing datasets without waiting for slow reports or fragmented tools.",
    solution:
      "We designed a high-performance web architecture with optimized queries, component-based dashboards and a secure API layer to deliver sub-second exploration at scale.",
    status: "Conceptual Showcase",
  },
  {
    id: "marketplace",
    slug: "marketplace-pro",
    title: "MarketPlace Pro",
    category: "E-Commerce Platform",
    type: "E-Commerce Platform",
    industry: "Retail",
    year: "2024",
    image: "",
    images: [],
    description:
      "Full-featured marketplace with vendor management, payments, inventory and real-time order tracking at scale.",
    overview:
      "MarketPlace Pro is an e-commerce marketplace concept that brings together vendor management, payment processing, inventory tracking and order management in a single platform. The focus is on reliability for high-traffic retail scenarios and a streamlined experience for both vendors and customers.",
    features: [
      "Vendor management",
      "Payment processing",
      "Inventory tracking",
      "Real-time order management",
      "Search and filtering",
    ],
    technologies: ["React", "Next.js", "MongoDB", "Stripe", "Node.js"],
    challenge:
      "Marketplaces require coordination across vendors, inventory and payments while remaining fast and consistent under load.",
    solution:
      "We structured a modular commerce architecture with clear separation of catalog, orders and payments, backed by a scalable API and responsive storefront.",
    status: "Conceptual Showcase",
  },
  {
    id: "taskflow",
    slug: "taskflow",
    title: "TaskFlow",
    category: "Mobile Application",
    type: "Mobile Application",
    industry: "Productivity",
    year: "2023",
    image: "",
    images: [],
    description:
      "Cross-platform productivity app with sync, drag-and-drop workflows and intelligent notifications.",
    overview:
      "TaskFlow is a mobile productivity concept for managing tasks across devices. It emphasizes seamless sync, intuitive drag-and-drop workflows and timely notifications to help individuals and teams stay organized.",
    features: [
      "Cross-device sync",
      "Drag-and-drop workflows",
      "Push notifications",
      "Offline support",
      "Secure authentication",
    ],
    technologies: ["React Native", "Firebase", "TypeScript", "Node.js"],
    challenge:
      "Productivity tools need to stay consistent across devices while remaining simple and fast to use.",
    solution:
      "We built a cross-platform mobile foundation with real-time sync and a focus on interaction clarity and reliability.",
    status: "Conceptual Showcase",
  },
  {
    id: "health",
    slug: "careportal",
    title: "CarePortal",
    category: "Healthcare Platform",
    type: "Healthcare Platform",
    industry: "Healthcare",
    year: "2023",
    image: "",
    images: [],
    description:
      "Patient management with scheduling, medical records, telehealth and HIPAA-compliant data handling.",
    overview:
      "CarePortal is a healthcare platform concept covering patient management, appointment scheduling, medical records and telehealth. The design prioritizes compliance, clarity and dependable handling of sensitive data in a clinical context.",
    features: [
      "Appointment scheduling",
      "Medical records management",
      "Telehealth support",
      "Secure data handling",
      "Role-based access",
    ],
    technologies: [".NET", "Next.js", "SQL Server", "Azure"],
    challenge:
      "Healthcare systems must balance usability with strict requirements for privacy and data integrity.",
    solution:
      "We outlined a compliant architecture with clear data boundaries, secure access and an interface focused on clinical workflows.",
    status: "Conceptual Showcase",
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getRelatedProjects(currentSlug: string, limit = 2) {
  return projects.filter((p) => p.slug !== currentSlug).slice(0, limit);
}

export const projectCategories = [
  "All Projects",
  "Web Application",
  "Mobile Application",
  "E-Commerce Platform",
  "Healthcare Platform",
] as const;
