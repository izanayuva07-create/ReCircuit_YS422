import type { SafetyCard } from '../types';

// ============================================================
// Re-Circuit — Safety Content Placeholder Data
// Replace with API-driven / multilingual content later
// ============================================================

export const safetyCards: SafetyCard[] = [
  {
    id: 'safety-1',
    category: 'Batteries',
    title: 'Battery Handling Safety',
    body: 'Lithium-ion batteries can cause fires if damaged or improperly stored. Never puncture, crush, or expose to extreme heat.',
    tips: [
      'Do not throw batteries in regular trash',
      'Keep batteries away from heat and direct sunlight',
      'If a battery is swollen, do not use or transport it alone',
      'Hand over to certified collectors only',
    ],
    icon: 'Battery',
    audioUrl: undefined,
  },
  {
    id: 'safety-2',
    category: 'CRT / Display Devices',
    title: 'CRT Monitor & TV Safety',
    body: 'CRT devices contain lead and other toxic materials. They must be handled carefully to avoid breakage and exposure.',
    tips: [
      'Do not break or crush CRT screens',
      'Wear gloves when handling old CRT monitors',
      'Never burn CRT waste',
      'Only hand to authorized e-waste handlers',
    ],
    icon: 'Monitor',
    audioUrl: undefined,
  },
  {
    id: 'safety-3',
    category: 'Damaged Electronics',
    title: 'Handling Damaged Electronics',
    body: 'Damaged electronics may have exposed circuits, sharp edges, or leaking chemicals. Proper precautions are necessary.',
    tips: [
      'Wear gloves and eye protection',
      'Do not touch exposed circuit boards with bare hands',
      'Store in sealed bags or containers before pickup',
      'Inform the collector about the damage',
    ],
    icon: 'AlertTriangle',
    audioUrl: undefined,
  },
  {
    id: 'safety-4',
    category: 'Cables & Wires',
    title: 'Cable & Wire Safety',
    body: 'Old cables may have degraded insulation exposing live wires. Copper can be recovered safely through proper channels.',
    tips: [
      'Do not burn cables to extract copper — it releases toxic fumes',
      'Bundle cables neatly before handing over',
      'Separate cables from other waste for easy sorting',
      'Check for frayed or exposed wires before storing',
    ],
    icon: 'Plug',
    audioUrl: undefined,
  },
  {
    id: 'safety-5',
    category: 'PCBs',
    title: 'Printed Circuit Board (PCB) Safety',
    body: 'PCBs contain valuable metals but also hazardous substances like lead solder. Never attempt informal processing.',
    tips: [
      'Do not solder or melt PCBs informally',
      'Handle with gloves — avoid direct skin contact',
      'Acid leaching of PCBs is illegal and dangerous',
      'Only certified recyclers should process PCBs',
    ],
    icon: 'Cpu',
    audioUrl: undefined,
  },
  {
    id: 'safety-6',
    category: 'Storage',
    title: 'Safe E-Waste Storage',
    body: 'Proper storage prevents hazards and makes collection easier. Store e-waste in a dry, ventilated area away from children.',
    tips: [
      'Keep in a cool, dry and ventilated space',
      'Do not store next to flammable materials',
      'Label boxes with contents if possible',
      'Avoid stacking heavy items on top of screens',
    ],
    icon: 'Archive',
    audioUrl: undefined,
  },
  {
    id: 'safety-7',
    category: 'Transportation',
    title: 'Safe Transportation',
    body: 'When moving e-waste, ensure items are secure and batteries are isolated to prevent fires or spills during transit.',
    tips: [
      'Wrap fragile items to prevent breakage',
      'Isolate batteries from other materials',
      'Do not overfill collection bags',
      'Use proper labeling for vehicle loads',
    ],
    icon: 'Truck',
    audioUrl: undefined,
  },
];
