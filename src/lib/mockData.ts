export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  role: "admin" | "user";
}

export interface TenderItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit?: string;
  estimatedCost?: number;
  specifications?: string;
  attributes: Record<string, string>;
}

export interface Tender {
  id: string;
  name: string;
  title?: string;
  description: string;
  deadline: string;
  createdBy: string;
  status: "draft" | "published" | "closed";
  visibility: "public" | "private";
  invitedUsers?: string[];
  items: TenderItem[];
  budget?: number;
  organization?: string;
  contactEmail?: string;
  contactPhone?: string;
  location?: string;
  fileProcessing?: {
    parsing: "pending" | "progress" | "completed";
    signature: "pending" | "progress" | "completed";
    extraction: "pending" | "progress" | "completed";
  };
  createdAt: string;
}

export interface ProposalItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  quantity: number;
  matchedTenderId?: string;
  matchPercentage?: number;
  attributes: Record<string, string>;
}

export interface Proposal {
  companyName?: string;
  id: string;
  tenderIds: string;
  name: string;
  description: string;
  submittedBy: string;
  company: string;
  status: "draft" | "submitted" | "accepted" | "rejected";
  items: ProposalItem[];
  totalCost: number;
  fileProcessing?: {
    parsing: "pending" | "progress" | "completed";
    signature: "pending" | "progress" | "completed";
    matching: "pending" | "progress" | "completed";
  };
  submittedAt: string;
}

export interface AnalysisResult {
  tenderId: string;
  tenderItemId: string;
  proposals: {
    proposalId: string;
    company: string;
    proposalItem: ProposalItem;
    matchPercentage: number;
    cost: number;
    reason: string;
  }[];
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@tender.com",
    name: "John Admin",
    company: "TenderCorp",
    role: "admin",
  },
  {
    id: "2",
    email: "supplier1@company.com",
    name: "Alice Smith",
    company: "Tech Solutions Ltd",
    role: "user",
  },
  {
    id: "3",
    email: "supplier2@company.com",
    name: "Bob Johnson",
    company: "Office Supplies Inc",
    role: "user",
  },
  {
    id: "4",
    email: "supplier3@company.com",
    name: "Carol Williams",
    company: "Digital Systems Co",
    role: "user",
  },
];

// Mock Tenders
export const mockTenders: Tender[] = [
  {
    id: "1",
    name: "Office Equipment Procurement 2024",
    title: "Office Equipment Procurement 2024",
    description:
      "Annual procurement of office equipment including laptops, projectors, and furniture",
    deadline: "2025-08-15",
    createdBy: "1",
    status: "published",
    visibility: "public",
    budget: 150000,
    organization: "Tech Solutions Inc",
    contactEmail: "procurement@techsolutions.com",
    contactPhone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    items: [
      {
        id: "1",
        name: "Laptop",
        description: "High-performance business laptop",
        quantity: 50,
        unit: "pcs",
        estimatedCost: 1200,
        specifications:
          "Intel i7 processor, 16GB RAM, 512GB SSD, 14-15 inch display",
        attributes: {
          brand: "Dell or Lenovo",
          ram: "16GB",
          storage: "512GB SSD",
          screen: "14-15 inch",
        },
      },
      {
        id: "2",
        name: "Projector",
        description: "Conference room projector",
        quantity: 10,
        unit: "pcs",
        estimatedCost: 800,
        specifications:
          "3000+ lumens brightness, 1080p resolution, HDMI connectivity",
        attributes: {
          brightness: "3000+ lumens",
          resolution: "1080p",
          connectivity: "HDMI, USB",
        },
      },
      {
        id: "3",
        name: "Office Chair",
        description: "Ergonomic office chair",
        quantity: 100,
        attributes: {
          type: "Ergonomic",
          material: "Mesh or Fabric",
          adjustable: "Height, Arms",
        },
      },
    ],
    fileProcessing: {
      parsing: "completed",
      signature: "completed",
      extraction: "completed",
    },
    createdAt: "2025-01-15",
  },
  {
    id: "2",
    name: "Software Licenses Renewal",
    description: "Enterprise software licensing for productivity tools",
    deadline: "2025-02-28",
    createdBy: "1",
    status: "published",
    visibility: "private",
    invitedUsers: ["2", "4"],
    items: [
      {
        id: "4",
        name: "Project Management Software",
        description: "Cloud-based project management platform",
        quantity: 200,
        attributes: {
          users: "200",
          features: "Gantt, Time tracking, Reports",
          cloud: "Yes",
        },
      },
    ],
    fileProcessing: {
      parsing: "completed",
      signature: "completed",
      extraction: "completed",
    },
    createdAt: "2025-01-10",
  },
  {
    id: "3",
    name: "IT Infrastructure Upgrade",
    description:
      "Complete overhaul of company IT infrastructure including servers, networking equipment, and security systems",
    deadline: "2025-04-20",
    createdBy: "1",
    status: "published",
    visibility: "public",
    items: [
      {
        id: "5",
        name: "Server Hardware",
        description: "High-performance rack servers",
        quantity: 5,
        attributes: {
          cpu: "Intel Xeon",
          ram: "64GB",
          storage: "2TB NVMe",
          redundancy: "Hot-swappable",
        },
      },
      {
        id: "6",
        name: "Network Switches",
        description: "Managed gigabit switches",
        quantity: 10,
        attributes: {
          ports: "24-48",
          speed: "1Gbps",
          management: "Web-based",
          poe: "PoE+",
        },
      },
    ],
    fileProcessing: {
      parsing: "completed",
      signature: "completed",
      extraction: "completed",
    },
    createdAt: "2024-01-20",
  },
  {
    id: "4",
    name: "Marketing Materials Design",
    description:
      "Creative design services for brochures, banners, and digital marketing materials",
    deadline: "2024-03-01",
    createdBy: "1",
    status: "draft",
    visibility: "private",
    invitedUsers: ["2", "3"],
    items: [
      {
        id: "7",
        name: "Brochure Design",
        description: "Tri-fold brochure design and printing",
        quantity: 1000,
        attributes: {
          size: "A4",
          colors: "Full color",
          paper: "Glossy",
          sides: "Double-sided",
        },
      },
    ],
    fileProcessing: {
      parsing: "pending",
      signature: "pending",
      extraction: "pending",
    },
    createdAt: "2024-01-25",
  },
  {
    id: "5",
    name: "Catering Services Contract",
    description: "Annual catering services for corporate events and meetings",
    deadline: "2024-01-15",
    createdBy: "1",
    status: "closed",
    visibility: "public",
    items: [
      {
        id: "8",
        name: "Event Catering",
        description: "Full-service catering for corporate events",
        quantity: 50,
        attributes: {
          service: "Full-service",
          cuisine: "International",
          dietary: "All restrictions",
          staff: "Included",
        },
      },
    ],
    fileProcessing: {
      parsing: "completed",
      signature: "completed",
      extraction: "completed",
    },
    createdAt: "2023-12-01",
  },
  {
    id: "6",
    name: "Security System Installation",
    description:
      "Installation and maintenance of comprehensive security systems",
    deadline: "2024-05-10",
    createdBy: "1",
    status: "published",
    visibility: "public",
    items: [
      {
        id: "9",
        name: "CCTV Cameras",
        description: "High-definition security cameras",
        quantity: 25,
        attributes: {
          resolution: "4K",
          night_vision: "Yes",
          weather_proof: "IP67",
          storage: "Cloud + Local",
        },
      },
      {
        id: "10",
        name: "Access Control System",
        description: "Card-based access control system",
        quantity: 15,
        attributes: {
          type: "Card reader",
          integration: "RFID",
          software: "Included",
          backup: "Battery",
        },
      },
    ],
    fileProcessing: {
      parsing: "completed",
      signature: "completed",
      extraction: "completed",
    },
    createdAt: "2024-02-01",
  },
  {
    id: "7",
    name: "Fleet Vehicle Procurement",
    description: "Purchase of company vehicles for sales and delivery teams",
    deadline: "2024-06-15",
    createdBy: "1",
    status: "published",
    visibility: "private",
    invitedUsers: ["2", "3", "4"],
    items: [
      {
        id: "11",
        name: "Delivery Vans",
        description: "Commercial delivery vehicles",
        quantity: 8,
        attributes: {
          type: "Van",
          fuel: "Diesel",
          capacity: "3.5 tons",
          warranty: "3 years",
        },
      },
      {
        id: "12",
        name: "Sales Cars",
        description: "Executive cars for sales team",
        quantity: 12,
        attributes: {
          type: "Sedan",
          fuel: "Hybrid",
          features: "GPS, AC, Leather",
          warranty: "5 years",
        },
      },
    ],
    fileProcessing: {
      parsing: "progress",
      signature: "completed",
      extraction: "pending",
    },
    createdAt: "2024-02-10",
  },
  {
    id: "8",
    name: "Training and Development Program",
    description:
      "Comprehensive employee training and skill development programs",
    deadline: "2025-08-30",
    createdBy: "1",
    status: "draft",
    visibility: "public",
    items: [
      {
        id: "13",
        name: "Leadership Training",
        description: "Management and leadership development courses",
        quantity: 50,
        attributes: {
          duration: "3 months",
          format: "Hybrid",
          certification: "Yes",
          materials: "Included",
        },
      },
    ],
    fileProcessing: {
      parsing: "pending",
      signature: "pending",
      extraction: "pending",
    },
    createdAt: "2024-02-15",
  },
  {
    id: "9",
    name: "Cloud Infrastructure Migration",
    description:
      "Migration of legacy systems to cloud infrastructure with enhanced security and scalability",
    deadline: "2024-07-30",
    createdBy: "1",
    status: "published",
    visibility: "public",
    items: [
      {
        id: "14",
        name: "Cloud Migration Services",
        description: "Complete migration of existing systems to cloud",
        quantity: 1,
        attributes: {
          platform: "AWS/Azure",
          timeline: "6 months",
          support: "24/7",
          backup: "Automated",
        },
      },
      {
        id: "15",
        name: "Security Assessment",
        description: "Comprehensive security audit and implementation",
        quantity: 1,
        attributes: {
          compliance: "ISO 27001",
          penetration_testing: "Yes",
          monitoring: "Real-time",
        },
      },
    ],
    fileProcessing: {
      parsing: "completed",
      signature: "completed",
      extraction: "completed",
    },
    createdAt: "2024-02-20",
  },
  {
    id: "10",
    name: "Digital Marketing Campaign 2024",
    description:
      "Comprehensive digital marketing strategy and execution for brand awareness",
    deadline: "2024-04-15",
    createdBy: "1",
    status: "draft",
    visibility: "private",
    invitedUsers: ["2", "3"],
    items: [
      {
        id: "16",
        name: "Social Media Management",
        description: "Complete social media strategy and content creation",
        quantity: 12,
        attributes: {
          platforms: "Facebook, Instagram, LinkedIn",
          posts_per_week: "5",
          analytics: "Monthly reports",
        },
      },
      {
        id: "17",
        name: "SEO Optimization",
        description: "Search engine optimization and content marketing",
        quantity: 1,
        attributes: {
          keywords: "50+",
          content: "Blog posts, landing pages",
          reporting: "Weekly",
        },
      },
    ],
    fileProcessing: {
      parsing: "pending",
      signature: "pending",
      extraction: "pending",
    },
    createdAt: "2024-02-25",
  },
  {
    id: "11",
    name: "Office Renovation Project",
    description:
      "Complete renovation of headquarters including interior design and furniture",
    deadline: "2024-01-10",
    createdBy: "1",
    status: "closed",
    visibility: "public",
    items: [
      {
        id: "18",
        name: "Interior Design Services",
        description: "Complete interior design and space planning",
        quantity: 1,
        attributes: {
          area: "5000 sq ft",
          style: "Modern",
          timeline: "3 months",
          warranty: "2 years",
        },
      },
      {
        id: "19",
        name: "Office Furniture",
        description: "Modern office furniture and fixtures",
        quantity: 150,
        attributes: {
          type: "Modular",
          material: "Eco-friendly",
          assembly: "Included",
          maintenance: "1 year",
        },
      },
    ],
    fileProcessing: {
      parsing: "completed",
      signature: "completed",
      extraction: "completed",
    },
    createdAt: "2023-11-15",
  },
  {
    id: "12",
    name: "Mobile App Development",
    description:
      "Development of cross-platform mobile application for customer engagement",
    deadline: "2024-08-20",
    createdBy: "1",
    status: "published",
    visibility: "private",
    invitedUsers: ["2", "4"],
    items: [
      {
        id: "20",
        name: "Mobile App Development",
        description: "Cross-platform mobile application",
        quantity: 1,
        attributes: {
          platforms: "iOS, Android",
          features: "Push notifications, Analytics",
          timeline: "6 months",
        },
      },
      {
        id: "21",
        name: "Backend API Development",
        description: "RESTful API and database design",
        quantity: 1,
        attributes: {
          technology: "Node.js/Python",
          database: "PostgreSQL",
          hosting: "Cloud",
          documentation: "Complete",
        },
      },
    ],
    fileProcessing: {
      parsing: "progress",
      signature: "completed",
      extraction: "progress",
    },
    createdAt: "2024-03-01",
  },
  {
    id: "13",
    name: "Annual Audit Services",
    description:
      "Comprehensive financial and compliance audit for fiscal year 2024",
    deadline: "2024-12-31",
    createdBy: "1",
    status: "published",
    visibility: "public",
    items: [
      {
        id: "22",
        name: "Financial Audit",
        description: "Complete financial audit and reporting",
        quantity: 1,
        attributes: {
          scope: "Full audit",
          standards: "GAAP",
          timeline: "3 months",
          certification: "CPA required",
        },
      },
      {
        id: "23",
        name: "Compliance Review",
        description: "Regulatory compliance assessment",
        quantity: 1,
        attributes: {
          regulations: "SOX, GDPR",
          documentation: "Complete",
          recommendations: "Detailed report",
        },
      },
    ],
    fileProcessing: {
      parsing: "completed",
      signature: "completed",
      extraction: "completed",
    },
    createdAt: "2024-03-05",
  },
  {
    id: "14",
    name: "Employee Wellness Program",
    description:
      "Comprehensive wellness program including fitness, mental health, and nutrition services",
    deadline: "2024-06-01",
    createdBy: "1",
    status: "draft",
    visibility: "public",
    items: [
      {
        id: "24",
        name: "Fitness Program",
        description: "On-site fitness classes and gym membership",
        quantity: 200,
        attributes: {
          classes: "Yoga, Pilates, Cardio",
          schedule: "Daily",
          trainer: "Certified",
          equipment: "Provided",
        },
      },
      {
        id: "25",
        name: "Mental Health Support",
        description: "Counseling and mental health services",
        quantity: 1,
        attributes: {
          counselors: "Licensed",
          availability: "24/7",
          sessions: "Individual/Group",
          confidentiality: "Guaranteed",
        },
      },
    ],
    fileProcessing: {
      parsing: "pending",
      signature: "pending",
      extraction: "pending",
    },
    createdAt: "2024-03-10",
  },
  {
    id: "15",
    name: "Data Center Upgrade",
    description:
      "Modernization of data center infrastructure with latest technology and security measures",
    deadline: "2024-09-15",
    createdBy: "1",
    status: "published",
    visibility: "private",
    invitedUsers: ["2", "3", "4"],
    items: [
      {
        id: "26",
        name: "Server Hardware Upgrade",
        description: "Latest generation servers and storage systems",
        quantity: 20,
        attributes: {
          cpu: "Latest Intel Xeon",
          ram: "128GB",
          storage: "10TB NVMe",
          redundancy: "N+1",
        },
      },
      {
        id: "27",
        name: "Network Infrastructure",
        description: "High-speed networking and security equipment",
        quantity: 1,
        attributes: {
          speed: "100Gbps",
          security: "Next-gen firewall",
          monitoring: "AI-powered",
          uptime: "99.99%",
        },
      },
    ],
    fileProcessing: {
      parsing: "completed",
      signature: "progress",
      extraction: "completed",
    },
    createdAt: "2024-03-12",
  },
  {
    id: "16",
    name: "Green Energy Initiative",
    description:
      "Implementation of renewable energy solutions including solar panels and energy storage",
    deadline: "2024-10-30",
    createdBy: "1",
    status: "published",
    visibility: "public",
    items: [
      {
        id: "28",
        name: "Solar Panel Installation",
        description: "Commercial solar panel system installation",
        quantity: 500,
        attributes: {
          capacity: "1MW",
          efficiency: "22%",
          warranty: "25 years",
          monitoring: "Real-time",
        },
      },
      {
        id: "29",
        name: "Energy Storage System",
        description: "Battery storage system for energy management",
        quantity: 1,
        attributes: {
          capacity: "500kWh",
          technology: "Lithium-ion",
          lifecycle: "10+ years",
          management: "Smart grid",
        },
      },
    ],
    fileProcessing: {
      parsing: "completed",
      signature: "completed",
      extraction: "completed",
    },
    createdAt: "2024-03-15",
  },
];

// Mock Proposals
export const mockProposals: Proposal[] = [
  {
    id: "1",
    tenderIds: "1",
    name: "Complete Office Solution",
    description: "Comprehensive proposal for all office equipment needs",
    submittedBy: "2",
    company: "Tech Solutions Ltd",
    status: "submitted",
    items: [
      {
        id: "1",
        name: "Dell XPS 15",
        description: "Premium business laptop with excellent performance",
        cost: 1200,
        quantity: 50,
        matchedTenderId: "1",
        matchPercentage: 95,
        attributes: {
          brand: "Dell",
          ram: "16GB",
          storage: "512GB SSD",
          screen: "15 inch",
        },
      },
      {
        id: "2",
        name: "Epson PowerLite Pro",
        description: "High-brightness conference projector",
        cost: 800,
        quantity: 10,
        matchedTenderId: "2",
        matchPercentage: 92,
        attributes: {
          brightness: "3500 lumens",
          resolution: "1080p",
          connectivity: "HDMI, USB, WiFi",
        },
      },
      {
        id: "3",
        name: "Herman Miller Aeron",
        description: "Premium ergonomic office chair",
        cost: 450,
        quantity: 100,
        matchedTenderId: "3",
        matchPercentage: 98,
        attributes: {
          type: "Ergonomic",
          material: "Mesh",
          adjustable: "Height, Arms, Tilt",
        },
      },
    ],
    totalCost: 155000,
    fileProcessing: {
      parsing: "completed",
      signature: "completed",
      matching: "completed",
    },
    submittedAt: "2024-01-20",
    companyName: "",
  },
  {
    id: "2",
    tenderIds: "1",
    name: "Budget Office Equipment",
    description: "Cost-effective solution for office equipment",
    submittedBy: "3",
    company: "Office Supplies Inc",
    status: "submitted",
    companyName: "",
    items: [
      {
        id: "4",
        name: "Lenovo ThinkPad E15",
        description: "Reliable business laptop at competitive price",
        cost: 900,
        quantity: 50,
        matchedTenderId: "1",
        matchPercentage: 85,
        attributes: {
          brand: "Lenovo",
          ram: "8GB",
          storage: "256GB SSD",
          screen: "15 inch",
        },
      },
      {
        id: "5",
        name: "BenQ MH535FHD",
        description: "Full HD business projector",
        cost: 600,
        quantity: 10,
        matchedTenderId: "2",
        matchPercentage: 88,
        attributes: {
          brightness: "3600 lumens",
          resolution: "1080p",
          connectivity: "HDMI, VGA",
        },
      },
      {
        id: "6",
        name: "Steelcase Series 1",
        description: "Affordable ergonomic chair",
        cost: 280,
        quantity: 100,
        matchedTenderId: "3",
        matchPercentage: 82,
        attributes: {
          type: "Ergonomic",
          material: "Fabric",
          adjustable: "Height, Arms",
        },
      },
    ],
    totalCost: 99000,
    fileProcessing: {
      parsing: "completed",
      signature: "completed",
      matching: "completed",
    },
    submittedAt: "2024-01-22",
  },
  {
    id: "3",
    tenderIds: "1",
    name: "Premium Enterprise Solution",
    description:
      "High-end proposal for enterprise-grade office equipment with advanced features",
    submittedBy: "1", // Admin user
    company: "TenderCorp",
    status: "submitted",
    items: [
      {
        id: "7",
        name: "MacBook Pro 16-inch",
        description: "Top-tier laptop for professional work with M2 Pro chip",
        cost: 2500,
        quantity: 50,
        matchedTenderId: "1",
        matchPercentage: 98,
        attributes: {
          brand: "Apple",
          ram: "32GB",
          storage: "1TB SSD",
          screen: "16 inch Retina",
          processor: "M2 Pro",
        },
      },
      {
        id: "8",
        name: "Sony VPL-FHZ75",
        description: "Professional laser projector with 4K support",
        cost: 1500,
        quantity: 10,
        matchedTenderId: "2",
        matchPercentage: 96,
        attributes: {
          brightness: "6500 lumens",
          resolution: "4K",
          connectivity: "HDMI, USB-C, WiFi, Bluetooth",
          technology: "Laser",
        },
      },
      {
        id: "9",
        name: "Herman Miller Embody",
        description: "Premium ergonomic chair with advanced postural support",
        cost: 1200,
        quantity: 100,
        matchedTenderId: "3",
        matchPercentage: 99,
        attributes: {
          type: "Premium Ergonomic",
          material: "Pixelated Support",
          adjustable: "Height, Arms, Tilt, Lumbar",
          warranty: "12 years",
        },
      },
    ],
    totalCost: 260000,
    fileProcessing: {
      parsing: "completed",
      signature: "completed",
      matching: "completed",
    },
    submittedAt: "2024-01-25",
  },
];

// Mock Analysis Results
export const mockAnalysisResults: AnalysisResult[] = [
  {
    tenderId: "1",
    tenderItemId: "1",
    proposals: [
      {
        proposalId: "1",
        company: "Tech Solutions Ltd",
        proposalItem: mockProposals[0].items[0],
        matchPercentage: 95,
        cost: 1200,
        reason:
          "Excellent specs match, premium brand, slightly over budget but high quality",
      },
      {
        proposalId: "2",
        company: "Office Supplies Inc",
        proposalItem: mockProposals[1].items[0],
        matchPercentage: 85,
        cost: 900,
        reason:
          "Good specs match, budget-friendly option, lower RAM but meets minimum requirements",
      },
    ],
  },
  {
    tenderId: "1",
    tenderItemId: "2",
    proposals: [
      {
        proposalId: "1",
        company: "Tech Solutions Ltd",
        proposalItem: mockProposals[0].items[1],
        matchPercentage: 92,
        cost: 800,
        reason:
          "High brightness exceeds requirements, includes WiFi connectivity",
      },
      {
        proposalId: "2",
        company: "Office Supplies Inc",
        proposalItem: mockProposals[1].items[1],
        matchPercentage: 88,
        cost: 600,
        reason: "Meets all requirements, good value for money",
      },
    ],
  },
];

// Current user state
export let currentUser: User | null = null;

export const setCurrentUser = (user: User | null) => {
  currentUser = user;
};

export const getCurrentUser = () => currentUser;

// Mock authentication
export const authenticateUser = (
  email: string,
  password: string
): User | null => {
  const user = mockUsers.find((u) => u.email === email);
  if (user && password === "password") {
    setCurrentUser(user);
    return user;
  }
  return null;
};

export const logoutUser = () => {
  setCurrentUser(null);
};
