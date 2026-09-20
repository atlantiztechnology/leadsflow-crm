import type { Contact } from '../types/campaign';

const AVATAR_COLORS = [
  '#4F46E5', '#7C3AED', '#DB2777', '#DC2626', '#EA580C',
  '#D97706', '#65A30D', '#16A34A', '#0D9488', '#0284C7',
  '#2563EB', '#9333EA',
];

function color(i: number): string {
  return AVATAR_COLORS[i % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/);
  if (!parts[0]) return 'WA';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

export const EXTRACTED_LEADS: Contact[] = [
  { id: 'lead_1', name: 'New Look Salon', initials: 'NL', avatarColor: color(0), company: 'Beauty salon (Chennai)', phone: '+91 74090 96454', status: 'New' },
  { id: 'lead_2', name: 'Sweety Beauty Parlour', initials: 'SB', avatarColor: color(1), company: 'Beauty salon (Chennai)', phone: '+91 98404 07939', status: 'New' },
  { id: 'lead_3', name: 'Hotel Lakshmi Alluriah', initials: 'HL', avatarColor: color(2), company: 'Andhra restaurant (Chennai)', phone: '+91 86086 04923', status: 'New' },
  { id: 'lead_4', name: 'Kaksh by Kavita', initials: 'KK', avatarColor: color(3), company: 'Designer clothing store (Chennai)', phone: '+91 98406 76686', status: 'New' },
  { id: 'lead_5', name: 'Glam Look Unisex Salon', initials: 'GL', avatarColor: color(4), company: 'Beauty salon (Coimbatore)', phone: '+91 85085 56550', status: 'New' },
  { id: 'lead_6', name: 'OLYMPIA FITNESS A/C UNISEX', initials: 'OF', avatarColor: color(5), company: 'Fitness center (Madurai)', phone: '+91 80720 32397', status: 'New' },
  { id: 'lead_7', name: 'STUDIO M Salon & Spa', initials: 'SM', avatarColor: color(6), company: 'Hairdresser (Madurai)', phone: '+91 97896 06334', status: 'New' },
  { id: 'lead_8', name: 'Sparrow Unisex Salon and Spa', initials: 'SU', avatarColor: color(7), company: 'Beauty salon (Madurai)', phone: '+91 7397 762 762', status: 'New' },
  { id: 'lead_9', name: "Cheap and Best Men's Salon", initials: 'CB', avatarColor: color(8), company: 'Beauty salon (Madurai)', phone: '+91 89399 60055', status: 'New' },
  { id: 'lead_10', name: 'ACE FAMILY SALON & BRIDAL', initials: 'AF', avatarColor: color(9), company: 'Beauty salon (Madurai)', phone: '+91 75300 00190', status: 'New' },
  { id: 'lead_11', name: "Ms Hair Studio. man's salon", initials: 'MH', avatarColor: color(10), company: 'Beauty salon (Chennai)', phone: '+91 80156 04186', status: 'New' },
  { id: 'lead_12', name: 'FutureLook Academy & Salon', initials: 'FA', avatarColor: color(11), company: 'Beauty salon (Chennai)', phone: '+91 86800 90150', status: 'New' },
  { id: 'lead_13', name: 'After hours - pure veg restaurant', initials: 'AH', avatarColor: color(0), company: 'Vegetarian restaurant (Chennai)', phone: '+91 93452 38712', status: 'New' },
  { id: 'lead_14', name: 'HI-FI FITNESS', initials: 'HF', avatarColor: color(1), company: 'Fitness center (Chennai)', phone: '+91 80561 71722', status: 'New' },
  { id: 'lead_15', name: 'Infinity Fitness Unisex Gym', initials: 'IF', avatarColor: color(2), company: 'Gym (Chennai)', phone: '+91 93421 00104', status: 'New' },
  { id: 'lead_16', name: 'ELEVE STUDIO', initials: 'ES', avatarColor: color(3), company: 'Fitness center (Chennai)', phone: '+91 72003 90099', status: 'New' },
  { id: 'lead_17', name: 'Mr Mike Health and Fitness Centre', initials: 'MM', avatarColor: color(4), company: 'Fitness center (Chennai)', phone: '+91 97106 27348', status: 'New' },
  { id: 'lead_18', name: 'Max gym', initials: 'MG', avatarColor: color(5), company: 'Gym (Chennai)', phone: '+91 98419 52446', status: 'New' },
  { id: 'lead_19', name: 'Amafhh Solutions', initials: 'AS', avatarColor: color(6), company: 'Interior designer (Chennai)', phone: '+91 86101 11413', status: 'New' },
  { id: 'lead_20', name: 'Victory tuition center', initials: 'VT', avatarColor: color(7), company: 'Educational institution (Chennai)', phone: '+91 78714 97876', status: 'New' },
  { id: 'lead_21', name: 'JS Educational Tuition Centre', initials: 'JS', avatarColor: color(8), company: 'Education center (Chennai)', phone: '+91 93846 57583', status: 'New' },
  { id: 'lead_22', name: 'Shikshaa Coaching Centre', initials: 'SC', avatarColor: color(9), company: 'Coaching center (Chennai)', phone: '+91 98411 01823', status: 'New' },
  { id: 'lead_23', name: 'Eventraa Event planners', initials: 'EE', avatarColor: color(10), company: 'Event management company (Coimbatore)', phone: '+91 90030 23855', status: 'New' },
  { id: 'lead_24', name: "CUT & EDGE (MEN'S SALON)", initials: 'CE', avatarColor: color(11), company: 'Hair salon (Coimbatore)', phone: '+91 97860 86231', status: 'New' },
  { id: 'lead_25', name: '2Fold Luxury Unisex Salon', initials: 'TL', avatarColor: color(0), company: 'Beauty salon (Coimbatore)', phone: '+91 84387 31392', status: 'New' },
  { id: 'lead_26', name: 'TOTAL FITNESS Unisex Gym', initials: 'TF', avatarColor: color(1), company: 'Fitness center (Coimbatore)', phone: '+91 88704 96686', status: 'New' },
  { id: 'lead_27', name: 'DREAM BIG UNISEX GYM', initials: 'DB', avatarColor: color(2), company: 'Fitness center (Coimbatore)', phone: '+91 80729 86829', status: 'New' },
  { id: 'lead_28', name: 'We Crunch', initials: 'WC', avatarColor: color(3), company: 'Restaurant (Madurai)', phone: '+91 86107 19203', status: 'New' },
  { id: 'lead_29', name: 'Sri Meenakshi Fashions', initials: 'SM', avatarColor: color(4), company: 'Clothing store (Madurai)', phone: '+91 93445 57601', status: 'New' },
  { id: 'lead_30', name: 'Iniyaval tailoring & boutique', initials: 'IT', avatarColor: color(5), company: 'Clothing store (Madurai)', phone: '+91 93618 77787', status: 'New' },
  { id: 'lead_31', name: 'Power Fitness & Gym', initials: 'PF', avatarColor: color(6), company: 'Fitness center (Madurai)', phone: '+91 97881 47676', status: 'New' },
  { id: 'lead_32', name: 'F24 UNISEX FITNESS STUDIO', initials: 'FU', avatarColor: color(7), company: 'Fitness center (Madurai)', phone: '+91 96777 72994', status: 'New' },
  { id: 'lead_33', name: 'Trigger fitness club', initials: 'TC', avatarColor: color(8), company: 'Gym (Madurai)', phone: '+91 97877 77867', status: 'New' },
  { id: 'lead_34', name: 'Ya Studio', initials: 'YS', avatarColor: color(9), company: 'Photography studio (Madurai)', phone: '+91 98949 12170', status: 'New' },
  { id: 'lead_35', name: 'Prasad studio photography', initials: 'PS', avatarColor: color(10), company: 'Photography studio (Madurai)', phone: '+91 96266 54311', status: 'New' },
  { id: 'lead_36', name: 'THE PICTURE HUT', initials: 'TP', avatarColor: color(11), company: 'Photography service (Madurai)', phone: '+91 95974 92472', status: 'New' },
  { id: 'lead_37', name: "Sowcarpet Natural Women's Salon", initials: 'SN', avatarColor: color(0), company: 'Beauty salon (Chennai)', phone: '+91 90809 18694', status: 'New' },
  { id: 'lead_38', name: 'Mannadi restaurant minar hotel', initials: 'MR', avatarColor: color(1), company: 'Non vegetarian restaurant (Chennai)', phone: '+91 90876 57732', status: 'New' },
  { id: 'lead_39', name: 'New PRAKASH Bhavan', initials: 'NP', avatarColor: color(2), company: 'South Indian restaurant (Chennai)', phone: '+91 44 2538 5343', status: 'New' },
  { id: 'lead_40', name: 'SLAM Lifestyle and Fitness Studio', initials: 'SL', avatarColor: color(3), company: 'Fitness center (Chennai)', phone: '+91 93601 22007', status: 'New' },
  { id: 'lead_41', name: 'CUT ZONE Gents Beauty Saloon', initials: 'CZ', avatarColor: color(4), company: 'Beauty salon (Chennai)', phone: '+91 90922 78474', status: 'New' },
  { id: 'lead_42', name: 'SR Biryani', initials: 'SB', avatarColor: color(5), company: 'Biryani restaurant (Chennai)', phone: '+91 91763 43676', status: 'New' },
  { id: 'lead_43', name: 'Igloo - South Indian Restaurant', initials: 'IS', avatarColor: color(6), company: 'Vegetarian restaurant (Chennai)', phone: '+91 90033 81372', status: 'New' },
  { id: 'lead_44', name: 'Sara Interiorz', initials: 'SI', avatarColor: color(7), company: 'Interior designer (Chennai)', phone: '+91 99629 30304', status: 'New' },
  { id: 'lead_45', name: 'NAVIYA INTERIOR WOOD WORK', initials: 'NI', avatarColor: color(8), company: 'Interior designer (Chennai)', phone: '+91 96364 18563', status: 'New' },
  { id: 'lead_46', name: 'MSA DESIGNS', initials: 'MD', avatarColor: color(9), company: 'Interior designer (Chennai)', phone: '+91 98400 27389', status: 'New' },
  { id: 'lead_47', name: 'Sekar Foto', initials: 'SF', avatarColor: color(10), company: 'Photographer (Chennai)', phone: '+91 96771 08887', status: 'New' },
  { id: 'lead_48', name: 'CM Interior Designer Coimbatore', initials: 'CM', avatarColor: color(11), company: 'Interior designer (Coimbatore)', phone: '+91 87784 61655', status: 'New' },
  { id: 'lead_49', name: 'Ishan Interiors & Builders', initials: 'II', avatarColor: color(0), company: 'Interior designer (Coimbatore)', phone: '+91 99434 36399', status: 'New' },
  { id: 'lead_50', name: 'River Interior Design', initials: 'RI', avatarColor: color(1), company: 'Interior designer (Coimbatore)', phone: '+91 79043 37156', status: 'New' },
];

export const MOCK_CONTACTS: Contact[] = EXTRACTED_LEADS;
export { getInitials };
