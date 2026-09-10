import type { AwarenessCard } from '../types';
import heroImage from '../assets/hero-circular-economy.jpg';
import batteryImage from '../assets/battery-safety.jpg';
import recoveryImage from '../assets/material-recovery.jpg';
import facilityImage from '../assets/circular-facility.jpg';
import devicesImage from '../assets/responsible-devices.jpg';

export const awarenessDisclaimer = 'Illustrative awareness content and presentation metrics for the Re-Circuit demo; not a live government data feed.';

export const awarenessCards: AwarenessCard[] = [
  { id: 'aw-1', category: 'What is E-Waste?', title: 'Electronics after their first life', body: 'E-waste includes discarded electrical or electronic products—from phones and computers to batteries, cables and appliances. Repair, reuse and formal material recovery can keep much of it in circulation.', icon: 'Monitor', color: '#0b6b45' },
  { id: 'aw-2', category: 'Environmental Impact', title: 'Why formal recycling matters', body: 'Unsafe dumping or burning can release hazardous substances into soil, air and water. Authorized processing separates risky fractions while recovering useful metals and plastics.', icon: 'Leaf', color: '#138a55' },
  { id: 'aw-3', category: 'Battery Safety', title: 'Isolate damaged batteries', body: 'Never place swollen, punctured or overheating batteries in household bins. Keep them away from heat and metal objects, then arrange collection through a trained handler.', icon: 'Battery', color: '#b56d11' },
  { id: 'aw-4', category: 'Data Privacy', title: 'Protect data before hand-off', body: 'Back up what you need, sign out of accounts, remove memory cards and complete a factory reset before releasing a phone or computer for recycling.', icon: 'ShieldCheck', color: '#3378b5' },
  { id: 'aw-5', category: 'Health Impact', title: 'Safer systems protect people', body: 'Open burning and informal acid recovery can expose workers and nearby communities to dangerous fumes and residues. Traceable collection helps route materials to safer facilities.', icon: 'HeartPulse', color: '#c74c4c' },
  { id: 'aw-6', category: 'Value Recovery', title: 'Old devices still hold value', body: 'Circuit boards, cables and motors contain copper and other useful materials. Careful sorting improves recovery and reduces demand for virgin resources.', icon: 'Coins', color: '#a87812' },
  { id: 'aw-7', category: 'Circular Economy', title: 'Keep products and materials moving', body: 'A circular system prioritizes longer use, repair and refurbishment before recycling. When a product reaches end of life, its materials become inputs for the next cycle.', icon: 'Globe', color: '#0f766e' },
  { id: 'aw-8', category: 'Responsible Recycling', title: 'Choose an authorized route', body: 'Verified collection, documented hand-offs and recycler confirmation make it easier to know where electronics went and how they were handled.', icon: 'Recycle', color: '#0b6b45' },
];

export const landingCarouselSlides = [
  { id: 'slide-1', title: 'Electronic waste deserves a better ending.', subtitle: 'A traceable hand-off turns unwanted devices from a disposal problem into recoverable resources.', category: 'E-Waste Awareness', image: devicesImage, imageAlt: 'End-of-life phones and electronics organized for responsible collection', ctaLabel: 'Understand e-waste', ctaHref: '/awareness' },
  { id: 'slide-2', title: 'What leaves our drawers should not enter our soil.', subtitle: 'Formal collection protects communities by keeping hazardous fractions away from open dumping and burning.', category: 'Environmental Impact', image: heroImage, imageAlt: 'Technicians sorting electronics inside an organized recovery facility', ctaLabel: 'Explore the impact', ctaHref: '/awareness' },
  { id: 'slide-3', title: 'Small battery. Serious responsibility.', subtitle: 'Damaged lithium batteries need isolation, trained handling and an appropriate recycling route.', category: 'Battery Safety', image: batteryImage, imageAlt: 'Technician safely sorting lithium batteries into protected trays', ctaLabel: 'Read the safety guide', ctaHref: '/safety' },
  { id: 'slide-4', title: 'Recover materials, not just devices.', subtitle: 'Careful dismantling can return copper, metals, circuit boards and polymers to productive use.', category: 'Value Recovery', image: recoveryImage, imageAlt: 'Recovered circuit boards, copper and electronic materials in a clean lab', ctaLabel: 'See why value matters', ctaHref: '/awareness' },
  { id: 'slide-5', title: 'Responsibility is a chain of verified hand-offs.', subtitle: 'Sources, collectors and authorized recyclers each make the next step visible and accountable.', category: 'Responsible Recycling', image: facilityImage, imageAlt: 'Team working at an organized electronics sorting facility', ctaLabel: 'See how it works', ctaHref: '/#how-it-works' },
  { id: 'slide-6', title: 'The end of one product can begin another.', subtitle: 'Circular systems preserve useful products first, then safely recover materials at end of life.', category: 'Circular Economy', image: circularImageFallback(facilityImage), imageAlt: 'Circular electronics sorting workflow at a modern facility', ctaLabel: 'Join the ecosystem', ctaHref: '/select-role' },
];

function circularImageFallback(image: string): string {
  return image;
}

export const landingStats = [
  { label: 'Devices routed in demo', value: 12480, display: '12.4K', unit: 'items', icon: 'Smartphone' },
  { label: 'Illustrative recovery rate', value: 87, display: '87', unit: '%', icon: 'Recycle' },
  { label: 'Material traced in demo', value: 18.6, display: '18.6', unit: 'tonnes', icon: 'Scale' },
  { label: 'Verified demo hand-offs', value: 3240, display: '3,240', unit: 'events', icon: 'Route' },
];
