/**
 * Colors.ts - Comprehensive color system for Expo mobile app
 * 
 * This file defines the color palette for the app in both light and dark modes,
 * using the green color scheme as the primary brand color along with supporting
 * gray shades for UI elements.
 */

// Primary green color palette
const greenColors = {
  lighter: "#C8FAD6",
  light: "#5BE49B",
  main: "#0cad17",
  dark: "#007867",
  darker: "#004B50",
};

// Gray scale color palette
const grayColors = {
  "100": "#F9FAFB",
  "200": "#F4F6F8",
  "300": "#DFE3E8",
  "400": "#C4CDD5",
  "500": "#919EAB",
  "600": "#637381",
  "700": "#454F5B",
  "800": "#1C252E",
  "900": "#141A21",
};

// Status colors for feedback
const statusColors = {
  info: {
    lighter: "#CAFDF5",
    light: "#61F3F3",
    main: "#00B8D9",
    dark: "#006C9C",
    darker: "#003768",
  },
  success: {
    lighter: "#D8FBDE",
    light: "#86E8AB",
    main: "#36B37E",
    dark: "#1B806A",
    darker: "#0A5554",
  },
  warning: {
    lighter: "#FFF9DD",
    light: "#FFE16A",
    main: "#FFAB00",
    dark: "#B76E00",
    darker: "#7A4100",
  },
  error: {
    lighter: "#FFE9D5",
    light: "#FFAC82",
    main: "#FF5630",
    dark: "#B71D18",
    darker: "#7A0916",
  },
  pending: {
    lighter: "#E6F7FF",
    light: "#91D5FF",
    main: "#1890FF",
    dark: "#0C53B7",
    text: "#FFFFFF",
  },
};

// Common color values that don't change between themes
const common = {
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
};

// Helper to create alpha colors (transparency)
const createAlpha = (color: string, opacity: number): string => {
  // This is a simple implementation that works for hex colors
  // For production, you might want a more robust solution
  if (color.startsWith('#') && (color.length === 7 || color.length === 9)) {
    const hexOpacity = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return `${color.substring(0, 7)}${hexOpacity}`;
  }
  return color;
};

export const Colors = {
  // Main theme colors
  primary: greenColors,
  
  // Gray scale
  gray: grayColors,
  
  // Status colors
  status: statusColors,
  
  // Light theme specific colors
  light: {
    mode: 'light',
    text: {
      primary: grayColors["800"],
      secondary: grayColors["600"],
      disabled: grayColors["500"],
      hint: grayColors["400"],
      tertiary: grayColors["500"],
    },
    background: common.white,
    paper: grayColors["100"],
    neutral: grayColors["200"],
    action: {
      active: grayColors["600"],
      hover: createAlpha(grayColors["500"], 0.08),
      selected: createAlpha(grayColors["500"], 0.16),
      disabled: grayColors["400"],
      disabledBackground: grayColors["300"],
      focus: createAlpha(grayColors["500"], 0.24),
    },
    divider: grayColors["300"],
    border: grayColors["300"],
    
    // UI element colors
    card: {
      background: common.white,
      border: grayColors["300"],
      light: common.white,
      default: common.white,
    },
    button: {
      primary: {
        background: greenColors.main,
        hover: greenColors.dark,
        text: common.white,
      },
      secondary: {
        background: grayColors["200"],
        hover: grayColors["300"],
        text: grayColors["800"],
      },
      outlined: {
        border: greenColors.main,
        text: greenColors.main,
        hover: createAlpha(greenColors.main, 0.08),
      },
      disabled: {
        background: grayColors["300"],
        text: grayColors["500"],
      },
      default: greenColors.main,
      light: greenColors.light,
      dark: greenColors.dark,
    },
    input: {
      background: common.white,
      border: grayColors["400"],
      placeholder: grayColors["500"],
      focus: greenColors.main,
    },
    switch: {
      track: {
        on: createAlpha(greenColors.main, 0.48),
        off: grayColors["400"],
      },
      thumb: {
        on: greenColors.main,
        off: common.white,
      },
    },
    tabs: {
      indicator: greenColors.main,
      active: greenColors.main,
      inactive: grayColors["600"],
    },
    icon: {
      primary: grayColors["700"],
      secondary: grayColors["600"],
      active: greenColors.main,
      inactive: grayColors["400"],
    },
    shadow: createAlpha(grayColors["900"], 0.2),
    
    // Navigation specific
    navigation: {
      background: common.white,
      border: grayColors["300"],
      tabIconDefault: grayColors["600"],
      tabIconSelected: greenColors.main,
      header: {
        background: common.white,
        text: grayColors["800"],
        border: grayColors["300"],
      },
    }
  },
  
  // Dark theme specific colors
  dark: {
    mode: 'dark',
    text: {
      primary: common.white,
      secondary: grayColors["400"],
      disabled: grayColors["600"],
      hint: grayColors["500"],
      tertiary: grayColors["500"],
    },
    background: grayColors["900"],
    paper: grayColors["800"],
    neutral: grayColors["700"],
    action: {
      active: grayColors["300"],
      hover: createAlpha(grayColors["300"], 0.08),
      selected: createAlpha(grayColors["300"], 0.16),
      disabled: grayColors["600"],
      disabledBackground: grayColors["700"],
      focus: createAlpha(grayColors["300"], 0.24),
    },
    divider: grayColors["700"],
    border: grayColors["700"],
    
    // UI element colors
    card: {
      background: grayColors["800"],
      border: grayColors["700"],
      light: grayColors["800"],
      default: grayColors["800"],
    },
    button: {
      primary: {
        background: greenColors.main,
        hover: greenColors.light,
        text: common.white,
      },
      secondary: {
        background: grayColors["700"],
        hover: grayColors["600"],
        text: common.white,
      },
      outlined: {
        border: greenColors.light,
        text: greenColors.light,
        hover: createAlpha(greenColors.light, 0.08),
      },
      disabled: {
        background: grayColors["700"],
        text: grayColors["500"],
      },
      default: greenColors.main,
      light: greenColors.light,
      dark: greenColors.dark,
    },
    input: {
      background: grayColors["800"],
      border: grayColors["600"],
      placeholder: grayColors["500"],
      focus: greenColors.light,
    },
    switch: {
      track: {
        on: createAlpha(greenColors.light, 0.48),
        off: grayColors["600"],
      },
      thumb: {
        on: greenColors.light,
        off: grayColors["400"],
      },
    },
    tabs: {
      indicator: greenColors.light,
      active: greenColors.light,
      inactive: grayColors["400"],
    },
    icon: {
      primary: grayColors["300"],
      secondary: grayColors["400"],
      active: greenColors.light,
      inactive: grayColors["600"],
    },
    shadow: createAlpha(common.black, 0.3),
    
    // Navigation specific
    navigation: {
      background: grayColors["900"],
      border: grayColors["700"],
      tabIconDefault: grayColors["400"],
      tabIconSelected: greenColors.light,
      header: {
        background: grayColors["900"],
        text: common.white,
        border: grayColors["700"],
      },
    }
  },
  
  // Common colors that don't change with theme
  common,
  
  // Convenience function to get theme-specific colors
  getThemeColors: (isDarkMode: boolean) => {
    return isDarkMode ? Colors.dark : Colors.light;
  }
};

// Type definitions for better TypeScript support
export type ColorMode = 'light' | 'dark';
export type ColorKeys = keyof typeof Colors;
export type PrimaryColorKeys = keyof typeof greenColors;
export type GrayColorKeys = keyof typeof grayColors;
export type StatusType = 'info' | 'success' | 'warning' | 'error';

// Utility functions
export const alpha = createAlpha;

export default Colors; 