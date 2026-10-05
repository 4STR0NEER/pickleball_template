/*
  Template content. Everything a client would change lives here:
  business details, sports, courts, rates, and amenities.
*/
import {
  Car,
  Snowflake,
  UtensilsCrossed,
  ShowerHead,
  Backpack,
  Wifi,
  Droplets,
  Armchair,
} from 'lucide-react'

export const SITE = {
  businessName: 'Business Name',
  headline: 'Courts ready when you are.',
  subheadline:
    'A short description of your venue goes here. Tell players what you offer, where to find you, and why the games here are worth the trip.',
  address: {
    street: 'Street Address',
    area: 'Barangay, City',
    region: 'Cebu, Philippines',
  },
  landmark: 'Near a well-known landmark, like a mall or church',
  phone: '+63 900 000 0000',
  email: 'hello@yourbusiness.ph',
  social: 'facebook.com/yourpage',
  mapsUrl: 'https://maps.google.com',
  hours: {
    open: 6, // 6 AM
    close: 22, // 10 PM
    label: 'Open daily, 6 AM to 10 PM',
  },
  peak: {
    fromHour: 17, // 5 PM onward
    weekends: true,
    label: 'Peak rates apply from 5 PM to closing and all day on weekends.',
  },
  bookingWindowDays: 60,
}

export const SPORTS = [
  {
    id: 'pickleball',
    name: 'Pickleball',
    rate: 450,
    peakRate: 550,
    summary:
      'Tournament-sized courts with proper kitchen lines, cushioned surfacing, and room to move behind the baseline.',
    features: ['Cushioned hard-court surface', 'LED court lighting', 'Paddle and ball rental at the desk'],
    courts: [
      { id: 'pb1', name: 'Court 1', detail: 'Indoor, air-conditioned' },
      { id: 'pb2', name: 'Court 2', detail: 'Indoor, air-conditioned' },
      { id: 'pb3', name: 'Court 3', detail: 'Covered outdoor' },
      { id: 'pb4', name: 'Court 4', detail: 'Covered outdoor' },
    ],
  },
  {
    id: 'badminton',
    name: 'Badminton',
    rate: 350,
    peakRate: 400,
    summary: 'Draft-free indoor courts with high ceilings and anti-glare lighting for clean shuttle tracking.',
    features: ['Synthetic mat flooring', 'Anti-glare lighting', 'Shuttlecocks sold at the counter'],
    courts: [
      { id: 'bd1', name: 'Court A', detail: 'Indoor, air-conditioned' },
      { id: 'bd2', name: 'Court B', detail: 'Indoor, air-conditioned' },
      { id: 'bd3', name: 'Court C', detail: 'Indoor, air-conditioned' },
    ],
  },
  {
    id: 'basketball',
    name: 'Basketball / Volleyball',
    rate: 1200,
    peakRate: 1500,
    summary: 'One full-size multipurpose court that switches between basketball and volleyball setups.',
    features: ['Full-court markings', 'Volleyball net setup on request', 'Scoreboard and bench seating'],
    courts: [{ id: 'bb1', name: 'Main Court', detail: 'Covered, full-size' }],
  },
]

// `board` is the two-word pair shown on the Intermediate scoreboard
export const AMENITIES = [
  { icon: Car, name: 'Parking', board: ['Free', 'Parking'], detail: 'Free parking for up to 30 cars and motorbikes.', status: 'On site' },
  {
    icon: Snowflake,
    name: 'Air-conditioning', board: ['Aircon', 'Courts'],
    detail: 'Indoor pickleball and badminton courts are fully air-conditioned.',
    status: 'On site',
  },
  {
    icon: UtensilsCrossed,
    name: 'Food stalls', board: ['Food', 'Stalls'],
    detail: 'Local eats, snacks, and cold drinks a short walk away.',
    status: 'Nearby',
  },
  { icon: ShowerHead, name: 'Restrooms and showers', board: ['Hot', 'Showers'], detail: 'Clean facilities with changing areas.', status: 'On site' },
  {
    icon: Backpack,
    name: 'Equipment rental', board: ['Equipment', 'Rental'],
    detail: 'Paddles, rackets, and balls available at the front desk.',
    status: 'On site',
  },
  { icon: Wifi, name: 'Free Wi-Fi', board: ['Free', 'Wi-Fi'], detail: 'Stay connected between games.', status: 'On site' },
  { icon: Droplets, name: 'Water refill station', board: ['Water', 'Refills'], detail: 'Bring a bottle and refill for free.', status: 'On site' },
  {
    icon: Armchair,
    name: 'Viewing area', board: ['Viewing', 'Area'],
    detail: 'Shaded benches for friends and family watching.',
    status: 'On site',
  },
]

export const TOTAL_COURTS = SPORTS.reduce((sum, s) => sum + s.courts.length, 0)

/*
  Pro tier venue tour. Match `start`, `rate` and the chapter `from`
  fractions to the client's own footage.
*/
export const TOUR = {
  video: '/pro/venue-tour.mp4',
  videoWebm: '/pro/venue-tour.webm',
  poster: '/pro/venue-poster.jpg',
  // Seconds to skip at the head of the clip (this footage holds still for its first 1.2s)
  start: 1.2,
  // Playback speed for the tour. Lower is slower and more cinematic.
  rate: 0.6,
  // `from` is measured across the played stretch, from `start` to the end
  chapters: [
    { from: 0, label: 'Arrival', title: 'Lit courts, open daily', detail: '8 courts for pickleball, badminton and basketball, 6 AM to 10 PM.' },
    { from: 0.25, label: 'Entry', title: 'Gated walk-in entry', detail: 'A secure gate off the car park, with free parking for 30 cars.' },
    { from: 0.48, label: 'Courts', title: 'Tournament courts', detail: 'Cushioned surfacing, proper kitchen lines and LED court lighting.' },
    { from: 0.74, label: 'Amenities', title: 'Food and shade', detail: 'A snack kiosk and a shaded viewing area for friends and family.' },
  ],
}
