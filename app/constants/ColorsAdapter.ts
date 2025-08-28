/**
 * ColorsAdapter.ts - Adapter file to help migrate from old Colors format to new
 * 
 * This file provides backwards compatibility so components don't break during the transition
 * to the new color system.
 */

import { Colors } from './Colors';

// Create compatibility layer for old color references
const CompatColors = {
  ...Colors,

  // Backwards compatible properties for direct access
  primary: {
    ...Colors.primary,
    default: Colors.primary.main, // Map default to main
  },
  
  // Top-level properties accessed directly
  background: Colors.light.background,
  surface: Colors.light.paper,
  divider: Colors.light.divider,
  
  // Text colors
  text: {
    primary: Colors.light.text.primary,
    secondary: Colors.light.text.secondary,
    tertiary: Colors.light.text.tertiary,
    disabled: Colors.light.text.disabled,
    hint: Colors.light.text.hint,
  },
  
  // Card colors
  card: {
    light: Colors.light.card.light,
    default: Colors.light.card.default,
    dark: Colors.light.card.background,
  },
  
  // Button colors
  button: {
    light: Colors.light.button.light,
    default: Colors.light.button.default,
    dark: Colors.light.button.dark,
  },
  
  // Status colors with default properties
  status: {
    success: {
      ...Colors.status.success,
      default: Colors.status.success.main,
      text: Colors.common.black
    },
    error: {
      ...Colors.status.error,
      default: Colors.status.error.main,
      text: Colors.common.black
    },
    warning: {
      ...Colors.status.warning,
      default: Colors.status.warning.main,
      text: Colors.common.black
    },
    info: {
      ...Colors.status.info,
      default: Colors.status.info.main,
      text: Colors.common.black
    },
    pending: {
      ...Colors.status.pending,
      default: Colors.status.pending.main,
      text: Colors.status.pending.text,
    },
  },
};

// Export as default and named export
export { CompatColors as Colors };
export default CompatColors; 