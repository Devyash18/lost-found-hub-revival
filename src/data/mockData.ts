export interface MockProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface MockItem {
  id: string;
  user_id: string;
  type: 'lost' | 'found';
  category: string;
  title: string;
  description: string;
  location: string;
  date_lost_found: string;
  contact_info: string | null;
  reward: string | null;
  image_url: string | null;
  status: 'pending' | 'claimed' | 'returned' | 'expired';
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string; avatar_url: string | null; email?: string; phone?: string | null };
}

export interface MockClaim {
  id: string;
  item_id: string;
  claimer_id: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
  items?: MockItem;
}

export interface MockNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  item_id: string;
  matched_item_id: string;
  read: boolean;
  created_at: string;
}

export interface MockActivity {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  created_at: string;
  metadata: any;
}

export interface MockMessage {
  id: string;
  claim_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  sender?: { full_name: string };
}

export interface MockAppointment {
  id: string;
  claim_id: string;
  scheduled_time: string;
  location: string;
  notes: string | null;
  created_by: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// ---- Mock Users ----
export const mockUsers: MockProfile[] = [
  {
    id: 'user-1',
    full_name: 'Arjun Sharma',
    email: 'arjun@chitkara.edu.in',
    phone: '+91 98765 43210',
    avatar_url: null,
    two_factor_enabled: false,
    created_at: '2024-09-15T10:00:00Z',
    updated_at: '2025-01-10T10:00:00Z',
  },
  {
    id: 'user-2',
    full_name: 'Priya Gupta',
    email: 'priya@chitkara.edu.in',
    phone: '+91 91234 56789',
    avatar_url: null,
    two_factor_enabled: false,
    created_at: '2024-10-01T10:00:00Z',
    updated_at: '2025-02-05T10:00:00Z',
  },
  {
    id: 'user-3',
    full_name: 'Rahul Verma',
    email: 'rahul@chitkara.edu.in',
    phone: null,
    avatar_url: null,
    two_factor_enabled: false,
    created_at: '2024-11-20T10:00:00Z',
    updated_at: '2025-03-01T10:00:00Z',
  },
];

// ---- Mock Items ----
export const mockItems: MockItem[] = [
  {
    id: 'item-1',
    user_id: 'user-1',
    type: 'lost',
    category: 'electronics',
    title: 'Blue iPhone 13',
    description: 'Lost my blue iPhone 13 with a clear case near the library. Has a small crack on the screen corner. Lock screen has a mountain wallpaper.',
    location: 'Main Library, 2nd Floor',
    date_lost_found: '2025-03-01',
    contact_info: 'arjun@chitkara.edu.in',
    reward: '₹2000 reward',
    image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
    status: 'pending',
    created_at: '2025-03-01T14:30:00Z',
    updated_at: '2025-03-01T14:30:00Z',
    profiles: { full_name: 'Arjun Sharma', avatar_url: null },
  },
  {
    id: 'item-2',
    user_id: 'user-2',
    type: 'found',
    category: 'accessories',
    title: 'Black Leather Wallet',
    description: 'Found a black leather wallet near the cafeteria. Contains some cards inside. No cash visible.',
    location: 'Cafeteria Entrance',
    date_lost_found: '2025-03-05',
    contact_info: null,
    reward: null,
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400',
    status: 'pending',
    created_at: '2025-03-05T09:15:00Z',
    updated_at: '2025-03-05T09:15:00Z',
    profiles: { full_name: 'Priya Gupta', avatar_url: null },
  },
  {
    id: 'item-3',
    user_id: 'user-3',
    type: 'lost',
    category: 'keys',
    title: 'Honda Bike Keys with Red Keychain',
    description: 'Lost my Honda Activa keys somewhere between the parking lot and Block A. Has a red keychain with a small teddy bear.',
    location: 'Parking Lot B to Block A',
    date_lost_found: '2025-03-07',
    contact_info: 'rahul@chitkara.edu.in',
    reward: '₹500 reward',
    image_url: null,
    status: 'pending',
    created_at: '2025-03-07T11:00:00Z',
    updated_at: '2025-03-07T11:00:00Z',
    profiles: { full_name: 'Rahul Verma', avatar_url: null },
  },
  {
    id: 'item-4',
    user_id: 'user-1',
    type: 'found',
    category: 'documents',
    title: 'Student ID Card - CSE Department',
    description: 'Found a Chitkara University student ID card near the sports complex. Belongs to CSE department.',
    location: 'Sports Complex',
    date_lost_found: '2025-03-06',
    contact_info: null,
    reward: null,
    image_url: null,
    status: 'pending',
    created_at: '2025-03-06T16:45:00Z',
    updated_at: '2025-03-06T16:45:00Z',
    profiles: { full_name: 'Arjun Sharma', avatar_url: null },
  },
  {
    id: 'item-5',
    user_id: 'user-2',
    type: 'lost',
    category: 'bags',
    title: 'Grey Laptop Bag with Stickers',
    description: 'Lost my grey HP laptop bag with various tech stickers. Contains notebooks and a charger. Last seen in the canteen area.',
    location: 'Canteen Area',
    date_lost_found: '2025-03-08',
    contact_info: 'priya@chitkara.edu.in',
    reward: '₹1000 reward',
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    status: 'pending',
    created_at: '2025-03-08T08:00:00Z',
    updated_at: '2025-03-08T08:00:00Z',
    profiles: { full_name: 'Priya Gupta', avatar_url: null },
  },
  {
    id: 'item-6',
    user_id: 'user-3',
    type: 'found',
    category: 'electronics',
    title: 'White Wireless Earbuds',
    description: 'Found white wireless earbuds (looks like AirPods) in the auditorium after the morning lecture.',
    location: 'Auditorium, Row 5',
    date_lost_found: '2025-03-09',
    contact_info: null,
    reward: null,
    image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400',
    status: 'pending',
    created_at: '2025-03-09T10:30:00Z',
    updated_at: '2025-03-09T10:30:00Z',
    profiles: { full_name: 'Rahul Verma', avatar_url: null },
  },
];

// ---- Mock Claims ----
export const mockClaims: MockClaim[] = [
  {
    id: 'claim-1',
    item_id: 'item-2',
    claimer_id: 'user-1',
    message: 'I think this is my wallet. It has a Chitkara ID and a metro card inside.',
    status: 'pending',
    created_at: '2025-03-06T10:00:00Z',
    updated_at: '2025-03-06T10:00:00Z',
    items: mockItems[1],
  },
];

// ---- Mock Notifications ----
export const mockNotifications: MockNotification[] = [
  {
    id: 'notif-1',
    user_id: 'user-1',
    title: 'Potential Match Found!',
    message: 'White Wireless Earbuds found in Auditorium may match your lost item.',
    item_id: 'item-1',
    matched_item_id: 'item-6',
    read: false,
    created_at: '2025-03-09T11:00:00Z',
  },
];

// ---- Mock Activities ----
export const mockActivities: MockActivity[] = [
  {
    id: 'act-1',
    user_id: 'user-1',
    activity_type: 'item_reported',
    description: 'Reported lost item: Blue iPhone 13',
    created_at: '2025-03-01T14:30:00Z',
    metadata: null,
  },
  {
    id: 'act-2',
    user_id: 'user-1',
    activity_type: 'item_reported',
    description: 'Reported found item: Student ID Card - CSE Department',
    created_at: '2025-03-06T16:45:00Z',
    metadata: null,
  },
  {
    id: 'act-3',
    user_id: 'user-1',
    activity_type: 'claim_made',
    description: 'Claimed item: Black Leather Wallet',
    created_at: '2025-03-06T10:00:00Z',
    metadata: null,
  },
];

// ---- Mock Messages ----
export const mockMessages: MockMessage[] = [
  {
    id: 'msg-1',
    claim_id: 'claim-1',
    sender_id: 'user-1',
    receiver_id: 'user-2',
    content: 'Hi, I believe this is my wallet. Can we meet to verify?',
    created_at: '2025-03-06T10:05:00Z',
    sender: { full_name: 'Arjun Sharma' },
  },
  {
    id: 'msg-2',
    claim_id: 'claim-1',
    sender_id: 'user-2',
    receiver_id: 'user-1',
    content: 'Sure! Can you describe what cards are inside?',
    created_at: '2025-03-06T10:10:00Z',
    sender: { full_name: 'Priya Gupta' },
  },
];

// ---- Mock Appointments ----
export const mockAppointments: MockAppointment[] = [
  {
    id: 'appt-1',
    claim_id: 'claim-1',
    scheduled_time: '2025-03-10T14:00:00Z',
    location: 'Main Library Entrance',
    notes: 'I will be wearing a blue jacket',
    created_by: 'user-1',
    status: 'pending',
    created_at: '2025-03-07T09:00:00Z',
    updated_at: '2025-03-07T09:00:00Z',
  },
];

// Helper to get items with profile data attached
export function getItemsWithProfiles(): MockItem[] {
  return mockItems.map(item => {
    const user = mockUsers.find(u => u.id === item.user_id);
    return {
      ...item,
      profiles: {
        full_name: user?.full_name || 'Unknown',
        avatar_url: user?.avatar_url || null,
        email: user?.email,
        phone: user?.phone,
      },
    };
  });
}
