import { Colors as AppColors } from '../constants/ColorsAdapter';

// Re-export Colors from constants to maintain backward compatibility
export const Colors = AppColors;

// Define spacing scale
export const Spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export default {
  Colors,
  Spacing,
}; 