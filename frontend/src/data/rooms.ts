export interface Room {
  id: string;
  name: string;
  type: 'Standard' | 'Deluxe' | 'Suite' | 'Presidential';
  description: string;
  price: number; // per night
  capacity: number;
  amenities: string[];
  available: boolean;
}

export const ROOMS: Room[] = [
  {
    id: 'STD-01',
    name: 'Standard Room',
    type: 'Standard',
    description: 'Comfortable room with city view, queen bed, and modern amenities.',
    price: 120,
    capacity: 2,
    amenities: ['Free WiFi', 'AC', 'TV', 'En-suite Bathroom'],
    available: true,
  },
  {
    id: 'STD-02',
    name: 'Standard Twin',
    type: 'Standard',
    description: 'Spacious room with two single beds, ideal for colleagues or friends.',
    price: 130,
    capacity: 2,
    amenities: ['Free WiFi', 'AC', 'TV', 'En-suite Bathroom'],
    available: true,
  },
  {
    id: 'DLX-01',
    name: 'Deluxe Room',
    type: 'Deluxe',
    description: 'Elegant room with king bed, garden view, and premium furnishings.',
    price: 200,
    capacity: 2,
    amenities: ['Free WiFi', 'AC', 'Smart TV', 'Mini Bar', 'Bathtub', 'Room Service'],
    available: true,
  },
  {
    id: 'DLX-02',
    name: 'Deluxe Family Room',
    type: 'Deluxe',
    description: 'Generous space for families with a king bed and two singles.',
    price: 250,
    capacity: 4,
    amenities: ['Free WiFi', 'AC', 'Smart TV', 'Mini Bar', 'Room Service'],
    available: true,
  },
  {
    id: 'STE-01',
    name: 'Junior Suite',
    type: 'Suite',
    description: 'Separate living area with panoramic city views and luxury bath.',
    price: 380,
    capacity: 2,
    amenities: ['Free WiFi', 'AC', 'Smart TV', 'Mini Bar', 'Jacuzzi', 'Lounge Area', 'Room Service', 'Complimentary Breakfast'],
    available: true,
  },
  {
    id: 'STE-02',
    name: 'Executive Suite',
    type: 'Suite',
    description: 'Spacious suite with private dining area and butler service.',
    price: 550,
    capacity: 3,
    amenities: ['Free WiFi', 'AC', 'Smart TV', 'Mini Bar', 'Jacuzzi', 'Private Dining', 'Butler Service', 'Complimentary Breakfast'],
    available: true,
  },
  {
    id: 'PRE-01',
    name: 'Presidential Suite',
    type: 'Presidential',
    description: 'The pinnacle of luxury — two bedrooms, private terrace, and dedicated staff.',
    price: 1200,
    capacity: 4,
    amenities: ['Free WiFi', 'AC', 'Smart TV', 'Full Bar', 'Jacuzzi', 'Private Terrace', 'Butler Service', 'All Meals Included', 'Airport Transfer'],
    available: true,
  },
];
