export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  role: 'admin' | 'user';
}

export interface TenderItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  attributes: Record<string, string>;
}

export interface Tender {
  id: string;
  name: string;
  description: string;
  deadline: string;
  createdBy: string;
  status: 'draft' | 'published' | 'closed';
  visibility: 'public' | 'private';
  invitedUsers?: string[];
  items: TenderItem[];
  fileProcessing?: {
    parsing: 'pending' | 'progress' | 'completed';
    signature: 'pending' | 'progress' | 'completed';
    extraction: 'pending' | 'progress' | 'completed';
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
  id: string;
  tenderIds: string;
  name: string;
  description: string;
  submittedBy: string;
  company: string;
  status: 'draft' | 'submitted' | 'accepted' | 'rejected';
  items: ProposalItem[];
  totalCost: number;
  fileProcessing?: {
    parsing: 'pending' | 'progress' | 'completed';
    signature: 'pending' | 'progress' | 'completed';
    matching: 'pending' | 'progress' | 'completed';
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
  { id: '1', email: 'admin@tender.com', name: 'John Admin', company: 'TenderCorp', role: 'admin' },
  { id: '2', email: 'supplier1@company.com', name: 'Alice Smith', company: 'Tech Solutions Ltd', role: 'user' },
  { id: '3', email: 'supplier2@company.com', name: 'Bob Johnson', company: 'Office Supplies Inc', role: 'user' },
  { id: '4', email: 'supplier3@company.com', name: 'Carol Williams', company: 'Digital Systems Co', role: 'user' },
];

// Mock Tenders
export const mockTenders: Tender[] = [
  {
    id: '1',
    name: 'Office Equipment Procurement 2024',
    description: 'Annual procurement of office equipment including laptops, projectors, and furniture',
    deadline: '2024-03-15',
    createdBy: '1',
    status: 'published',
    visibility: 'public',
    items: [
      {
        id: '1',
        name: 'Laptop',
        description: 'High-performance business laptop',
        quantity: 50,
        attributes: { brand: 'Dell or Lenovo', ram: '16GB', storage: '512GB SSD', screen: '14-15 inch' }
      },
      {
        id: '2',
        name: 'Projector',
        description: 'Conference room projector',
        quantity: 10,
        attributes: { brightness: '3000+ lumens', resolution: '1080p', connectivity: 'HDMI, USB' }
      },
      {
        id: '3',
        name: 'Office Chair',
        description: 'Ergonomic office chair',
        quantity: 100,
        attributes: { type: 'Ergonomic', material: 'Mesh or Fabric', adjustable: 'Height, Arms' }
      }
    ],
    fileProcessing: {
      parsing: 'completed',
      signature: 'completed',
      extraction: 'completed'
    },
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Software Licenses Renewal',
    description: 'Enterprise software licensing for productivity tools',
    deadline: '2024-02-28',
    createdBy: '1',
    status: 'published',
    visibility: 'private',
    invitedUsers: ['2', '4'],
    items: [
      {
        id: '4',
        name: 'Project Management Software',
        description: 'Cloud-based project management platform',
        quantity: 200,
        attributes: { users: '200', features: 'Gantt, Time tracking, Reports', cloud: 'Yes' }
      }
    ],
    fileProcessing: {
      parsing: 'completed',
      signature: 'completed',
      extraction: 'completed'
    },
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    name: 'IT Infrastructure Upgrade',
    description: 'Complete overhaul of company IT infrastructure including servers, networking equipment, and security systems',
    deadline: '2024-04-20',
    createdBy: '1',
    status: 'published',
    visibility: 'public',
    items: [
      {
        id: '5',
        name: 'Server Hardware',
        description: 'High-performance rack servers',
        quantity: 5,
        attributes: { cpu: 'Intel Xeon', ram: '64GB', storage: '2TB NVMe', redundancy: 'Hot-swappable' }
      },
      {
        id: '6',
        name: 'Network Switches',
        description: 'Managed gigabit switches',
        quantity: 10,
        attributes: { ports: '24-48', speed: '1Gbps', management: 'Web-based', poe: 'PoE+' }
      }
    ],
    fileProcessing: {
      parsing: 'completed',
      signature: 'completed',
      extraction: 'completed'
    },
    createdAt: '2024-01-20'
  },
  {
    id: '4',
    name: 'Marketing Materials Design',
    description: 'Creative design services for brochures, banners, and digital marketing materials',
    deadline: '2024-03-01',
    createdBy: '1',
    status: 'draft',
    visibility: 'private',
    invitedUsers: ['2', '3'],
    items: [
      {
        id: '7',
        name: 'Brochure Design',
        description: 'Tri-fold brochure design and printing',
        quantity: 1000,
        attributes: { size: 'A4', colors: 'Full color', paper: 'Glossy', sides: 'Double-sided' }
      }
    ],
    fileProcessing: {
      parsing: 'pending',
      signature: 'pending',
      extraction: 'pending'
    },
    createdAt: '2024-01-25'
  },
  {
    id: '5',
    name: 'Catering Services Contract',
    description: 'Annual catering services for corporate events and meetings',
    deadline: '2024-01-15',
    createdBy: '1',
    status: 'closed',
    visibility: 'public',
    items: [
      {
        id: '8',
        name: 'Event Catering',
        description: 'Full-service catering for corporate events',
        quantity: 50,
        attributes: { service: 'Full-service', cuisine: 'International', dietary: 'All restrictions', staff: 'Included' }
      }
    ],
    fileProcessing: {
      parsing: 'completed',
      signature: 'completed',
      extraction: 'completed'
    },
    createdAt: '2023-12-01'
  },
  {
    id: '6',
    name: 'Security System Installation',
    description: 'Installation and maintenance of comprehensive security systems',
    deadline: '2024-05-10',
    createdBy: '1',
    status: 'published',
    visibility: 'public',
    items: [
      {
        id: '9',
        name: 'CCTV Cameras',
        description: 'High-definition security cameras',
        quantity: 25,
        attributes: { resolution: '4K', night_vision: 'Yes', weather_proof: 'IP67', storage: 'Cloud + Local' }
      },
      {
        id: '10',
        name: 'Access Control System',
        description: 'Card-based access control system',
        quantity: 15,
        attributes: { type: 'Card reader', integration: 'RFID', software: 'Included', backup: 'Battery' }
      }
    ],
    fileProcessing: {
      parsing: 'completed',
      signature: 'completed',
      extraction: 'completed'
    },
    createdAt: '2024-02-01'
  },
  {
    id: '7',
    name: 'Fleet Vehicle Procurement',
    description: 'Purchase of company vehicles for sales and delivery teams',
    deadline: '2024-06-15',
    createdBy: '1',
    status: 'published',
    visibility: 'private',
    invitedUsers: ['2', '3', '4'],
    items: [
      {
        id: '11',
        name: 'Delivery Vans',
        description: 'Commercial delivery vehicles',
        quantity: 8,
        attributes: { type: 'Van', fuel: 'Diesel', capacity: '3.5 tons', warranty: '3 years' }
      },
      {
        id: '12',
        name: 'Sales Cars',
        description: 'Executive cars for sales team',
        quantity: 12,
        attributes: { type: 'Sedan', fuel: 'Hybrid', features: 'GPS, AC, Leather', warranty: '5 years' }
      }
    ],
    fileProcessing: {
      parsing: 'progress',
      signature: 'completed',
      extraction: 'pending'
    },
    createdAt: '2024-02-10'
  },
  {
    id: '8',
    name: 'Training and Development Program',
    description: 'Comprehensive employee training and skill development programs',
    deadline: '2024-04-30',
    createdBy: '1',
    status: 'draft',
    visibility: 'public',
    items: [
      {
        id: '13',
        name: 'Leadership Training',
        description: 'Management and leadership development courses',
        quantity: 50,
        attributes: { duration: '3 months', format: 'Hybrid', certification: 'Yes', materials: 'Included' }
      }
    ],
    fileProcessing: {
      parsing: 'pending',
      signature: 'pending',
      extraction: 'pending'
    },
    createdAt: '2024-02-15'
  }
];

// Mock Proposals
export const mockProposals: Proposal[] = [
  {
    id: '1',
    tenderIds: '1',
    name: 'Complete Office Solution',
    description: 'Comprehensive proposal for all office equipment needs',
    submittedBy: '2',
    company: 'Tech Solutions Ltd',
    status: 'submitted',
    items: [
      {
        id: '1',
        name: 'Dell XPS 15',
        description: 'Premium business laptop with excellent performance',
        cost: 1200,
        quantity: 50,
        matchedTenderId: '1',
        matchPercentage: 95,
        attributes: { brand: 'Dell', ram: '16GB', storage: '512GB SSD', screen: '15 inch' }
      },
      {
        id: '2',
        name: 'Epson PowerLite Pro',
        description: 'High-brightness conference projector',
        cost: 800,
        quantity: 10,
        matchedTenderId: '2',
        matchPercentage: 92,
        attributes: { brightness: '3500 lumens', resolution: '1080p', connectivity: 'HDMI, USB, WiFi' }
      },
      {
        id: '3',
        name: 'Herman Miller Aeron',
        description: 'Premium ergonomic office chair',
        cost: 450,
        quantity: 100,
        matchedTenderId: '3',
        matchPercentage: 98,
        attributes: { type: 'Ergonomic', material: 'Mesh', adjustable: 'Height, Arms, Tilt' }
      }
    ],
    totalCost: 155000,
    fileProcessing: {
      parsing: 'completed',
      signature: 'completed',
      matching: 'completed'
    },
    submittedAt: '2024-01-20'
  },
  {
    id: '2',
    tenderIds: '1',
    name: 'Budget Office Equipment',
    description: 'Cost-effective solution for office equipment',
    submittedBy: '3',
    company: 'Office Supplies Inc',
    status: 'submitted',
    items: [
      {
        id: '4',
        name: 'Lenovo ThinkPad E15',
        description: 'Reliable business laptop at competitive price',
        cost: 900,
        quantity: 50,
        matchedTenderId: '1',
        matchPercentage: 85,
        attributes: { brand: 'Lenovo', ram: '8GB', storage: '256GB SSD', screen: '15 inch' }
      },
      {
        id: '5',
        name: 'BenQ MH535FHD',
        description: 'Full HD business projector',
        cost: 600,
        quantity: 10,
        matchedTenderId: '2',
        matchPercentage: 88,
        attributes: { brightness: '3600 lumens', resolution: '1080p', connectivity: 'HDMI, VGA' }
      },
      {
        id: '6',
        name: 'Steelcase Series 1',
        description: 'Affordable ergonomic chair',
        cost: 280,
        quantity: 100,
        matchedTenderId: '3',
        matchPercentage: 82,
        attributes: { type: 'Ergonomic', material: 'Fabric', adjustable: 'Height, Arms' }
      }
    ],
    totalCost: 99000,
    fileProcessing: {
      parsing: 'completed',
      signature: 'completed',
      matching: 'completed'
    },
    submittedAt: '2024-01-22'
  }
];

// Mock Analysis Results
export const mockAnalysisResults: AnalysisResult[] = [
  {
    tenderId: '1',
    tenderItemId: '1',
    proposals: [
      {
        proposalId: '1',
        company: 'Tech Solutions Ltd',
        proposalItem: mockProposals[0].items[0],
        matchPercentage: 95,
        cost: 1200,
        reason: 'Excellent specs match, premium brand, slightly over budget but high quality'
      },
      {
        proposalId: '2',
        company: 'Office Supplies Inc',
        proposalItem: mockProposals[1].items[0],
        matchPercentage: 85,
        cost: 900,
        reason: 'Good specs match, budget-friendly option, lower RAM but meets minimum requirements'
      }
    ]
  },
  {
    tenderId: '1',
    tenderItemId: '2',
    proposals: [
      {
        proposalId: '1',
        company: 'Tech Solutions Ltd',
        proposalItem: mockProposals[0].items[1],
        matchPercentage: 92,
        cost: 800,
        reason: 'High brightness exceeds requirements, includes WiFi connectivity'
      },
      {
        proposalId: '2',
        company: 'Office Supplies Inc',
        proposalItem: mockProposals[1].items[1],
        matchPercentage: 88,
        cost: 600,
        reason: 'Meets all requirements, good value for money'
      }
    ]
  }
];

// Current user state
export let currentUser: User | null = null;

export const setCurrentUser = (user: User | null) => {
  currentUser = user;
};

export const getCurrentUser = () => currentUser;

// Mock authentication
export const authenticateUser = (email: string, password: string): User | null => {
  const user = mockUsers.find(u => u.email === email);
  if (user && password === 'password') {
    setCurrentUser(user);
    return user;
  }
  return null;
};

export const logoutUser = () => {
  setCurrentUser(null);
};