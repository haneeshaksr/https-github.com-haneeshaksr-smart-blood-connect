/**
 * Smart Blood Connect - Medically Validated Compatibility Rules
 * 
 * IMPORTANT MEDICAL NOTICE:
 * Blood group compatibility charts provide general theoretical matching.
 * Clinical blood transfusion requires mandatory serological crossmatching,
 * antibody screening, and laboratory verification by certified blood bank personnel.
 */

export interface CompatibilityResult {
  isCompatible: boolean;
  notes: string;
}

// Red Blood Cell (PRBC / Whole Blood) donor to recipient compatibility
export const RBC_COMPATIBILITY: Record<string, string[]> = {
  // Recipient : Allowed Donor Blood Groups
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

// Plasma (FFP) compatibility is reverse of RBC
export const PLASMA_COMPATIBILITY: Record<string, string[]> = {
  // Recipient : Allowed Donor Plasma Groups
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

export function checkBloodCompatibility(
  recipientBloodGroup: string,
  donorBloodGroup: string,
  component: string = 'Whole Blood'
): CompatibilityResult {
  const normRecipient = recipientBloodGroup.trim().toUpperCase();
  const normDonor = donorBloodGroup.trim().toUpperCase();

  const isPlasma = component.toLowerCase().includes('plasma') || component.toLowerCase().includes('ffp');
  const matrix = isPlasma ? PLASMA_COMPATIBILITY : RBC_COMPATIBILITY;

  const compatibleList = matrix[normRecipient] || [];
  const isCompatible = compatibleList.includes(normDonor);

  let notes = '';
  if (isCompatible) {
    if (normDonor === 'O-' && !isPlasma) {
      notes = 'O- is a universal cellular red blood cell donor. Final crossmatch required.';
    } else if (normRecipient === 'AB+' && !isPlasma) {
      notes = 'AB+ is a universal cellular red blood cell recipient. Final crossmatch required.';
    } else if (normDonor === 'AB+' && isPlasma) {
      notes = 'AB+ is a universal fresh frozen plasma donor.';
    } else {
      notes = 'Medically compatible match for this blood component. Mandatory crossmatch required.';
    }
  } else {
    notes = `Incompatible: Recipient (${normRecipient}) cannot safely receive ${component} from Donor (${normDonor}).`;
  }

  return { isCompatible, notes };
}

export const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export type BloodGroup = typeof VALID_BLOOD_GROUPS[number];

export const BLOOD_COMPONENTS = [
  'Whole Blood',
  'Red Blood Cells (PRBC)',
  'Platelets',
  'Fresh Frozen Plasma (FFP)',
  'Cryoprecipitate'
] as const;
export type BloodComponent = typeof BLOOD_COMPONENTS[number];
