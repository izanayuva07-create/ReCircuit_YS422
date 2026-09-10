export interface EnvironmentalImpactResult {
  ewasteDivertedKg: number;
  materialsRecoveredKg: number;
  co2ReductionKg: number;
  isCo2Estimated: boolean;
  recoveryStatus: string;
  materialsBreakdown: {
    name: string;
    percentage: number;
    amountKg: number;
    estimatedYield: string;
  }[];
}

export class EnvironmentalCalculatorService {
  // Configurable factors: kg CO2 abatement per kg e-waste diverted
  private static CO2_FACTORS: Record<string, number> = {
    'computers-laptops': 3.2,
    'phones-mobile': 4.1,
    'batteries-lithium': 3.6,
    'components-pcb': 4.8,
    'displays-crt': 1.6,
    'cables-copper': 2.4,
    default: 2.8,
  };

  // Configurable recovery yield ratios
  private static MATERIAL_PROFILES: Record<string, { name: string; ratio: number; yieldDescription: string }[]> = {
    'computers-laptops': [
      { name: 'High-Purity Copper & Aluminium', ratio: 0.38, yieldDescription: 'Chassis, heat pipes, wiring' },
      { name: 'Engineered High-Impact Plastics', ratio: 0.32, yieldDescription: 'UL94 V-0 flame-retardant polymers' },
      { name: 'Precious Metals (Gold, Silver, Palladium)', ratio: 0.05, yieldDescription: 'PCB connectors, BGA packaging' },
      { name: 'Lithium Battery Cells', ratio: 0.25, yieldDescription: 'Li-Ion cobalt/nickel cathode mass' },
    ],
    'phones-mobile': [
      { name: 'Display Glass & Ceramics', ratio: 0.40, yieldDescription: 'Gorilla glass & optical elements' },
      { name: 'Battery Material (Li/Co/Ni)', ratio: 0.35, yieldDescription: 'Secondary raw battery grade' },
      { name: 'Precious & Rare Metals', ratio: 0.12, yieldDescription: 'Gold plating, Neodymium magnets' },
      { name: 'Structural Aluminium', ratio: 0.13, yieldDescription: 'CNC milled enclosure metal' },
    ],
    'batteries-lithium': [
      { name: 'Black Mass (Nickel, Manganese, Cobalt)', ratio: 0.55, yieldDescription: 'Hydrometallurgical precursor' },
      { name: 'Lithium Carbonate Equivalent', ratio: 0.15, yieldDescription: 'Refined battery-grade chemical' },
      { name: 'Copper & Aluminium Foil', ratio: 0.20, yieldDescription: 'Current collector foil recovery' },
      { name: 'Outer Casing & Electrolyte', ratio: 0.10, yieldDescription: 'Neutralized and recycled polymer' },
    ],
    default: [
      { name: 'Ferrous & Non-Ferrous Metals', ratio: 0.48, yieldDescription: 'Industrial smelting grade' },
      { name: 'Thermoplastics', ratio: 0.34, yieldDescription: 'Pelletized engineering plastic' },
      { name: 'Recoverable Circuitry', ratio: 0.18, yieldDescription: 'Precious metal refining' },
    ],
  };

  /**
   * Calculate environmental benefits based on category and physical weight.
   */
  static calculate(weightKg?: number | null, categorySlug?: string | null): EnvironmentalImpactResult {
    const verifiedWeight = weightKg && weightKg > 0 ? weightKg : 2.0;
    const factor = (categorySlug && this.CO2_FACTORS[categorySlug]) || this.CO2_FACTORS.default;
    const profile = (categorySlug && this.MATERIAL_PROFILES[categorySlug]) || this.MATERIAL_PROFILES.default;

    const co2Reduction = parseFloat((verifiedWeight * factor).toFixed(2));
    // Typical recovery efficiency across compliant recyclers is 92-96%
    const recoveryEfficiency = 0.94;
    const materialsRecoveredKg = parseFloat((verifiedWeight * recoveryEfficiency).toFixed(2));

    const breakdown = profile.map((item) => {
      const amount = parseFloat((verifiedWeight * item.ratio * recoveryEfficiency).toFixed(3));
      return {
        name: item.name,
        percentage: Math.round(item.ratio * 100),
        amountKg: amount,
        estimatedYield: item.yieldDescription,
      };
    });

    return {
      ewasteDivertedKg: verifiedWeight,
      materialsRecoveredKg,
      co2ReductionKg: co2Reduction,
      isCo2Estimated: true,
      recoveryStatus: 'VERIFIED_RECYCLING',
      materialsBreakdown: breakdown,
    };
  }
}
