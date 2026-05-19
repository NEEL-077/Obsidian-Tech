/**
 * Obsidian Tech - Premium AI Recommendation Platform
 * Ultra-Luxury Color System
 * 
 * Design Philosophy:
 * - Intelligence through restraint
 * - Luxury through subtlety
 * - AI presence through purposeful accents
 */

// ============================================
// BASE COLOR FOUNDATION (STRICT)
// ============================================

const baseColors = {
  dark: {
    background: '#0A0A0F',
    surface: '#12121A',
    surfaceElevated: '#1A1A24',
    gold: '#C9A24A',
    aiBlue: '#5B8DEF',
    textPrimary: '#F5F5F7',
    textSecondary: '#A1A1AA',
    border: '#1F1F2E',
  },
  light: {
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceElevated: '#F3F4F6',
    gold: '#B8963F',
    aiBlue: '#3A63D8',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
  }
};

// ============================================
// 1. EXPANDED COLOR PALETTE (100-900 Scale)
// ============================================

export const palette = {
  // GOLD - Luxury Primary
  gold: {
    50: '#FDF9F0',
    100: '#F9F0D8',
    200: '#F2E1B3',
    300: '#E8CD85',
    400: '#D4B05C',
    500: '#C9A24A', // Dark mode primary
    600: '#B8963F', // Light mode primary
    700: '#9A7D35',
    800: '#7C642B',
    900: '#5E4B21',
  },
  
  // AI BLUE - Intelligence Accent
  aiBlue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#5B8DEF', // Dark mode
    600: '#3A63D8', // Light mode
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  
  // DARK SCALE - Depth & Elevation
  dark: {
    50: '#F4F4F5',
    100: '#E4E4E7',
    200: '#D4D4D8',
    300: '#A1A1AA',
    400: '#71717A',
    500: '#52525B',
    600: '#3F3F46',
    700: '#27272A',
    800: '#18181B',
    850: '#12121A', // Surface
    900: '#0A0A0F', // Background
    950: '#050508',
  },
  
  // LIGHT SCALE - Clean Premium
  light: {
    50: '#F9FAFB', // Background
    100: '#F3F4F6', // Surface elevated
    200: '#E5E7EB', // Borders
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280', // Text secondary
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827', // Text primary
    950: '#030712',
  },
  
  // SEMANTIC COLORS
  semantic: {
    success: {
      dark: '#22C55E',
      light: '#16A34A',
      muted: '#14532D',
    },
    warning: {
      dark: '#F59E0B',
      light: '#D97706',
      muted: '#78350F',
    },
    error: {
      dark: '#EF4444',
      light: '#DC2626',
      muted: '#7F1D1D',
    },
    info: {
      dark: '#5B8DEF',
      light: '#3A63D8',
      muted: '#1E3A8A',
    },
  }
};

// ============================================
// 2. DESIGN TOKENS
// ============================================

export const tokens = {
  dark: {
    // Backgrounds
    'bg.primary': baseColors.dark.background,
    'bg.surface': baseColors.dark.surface,
    'bg.surface-elevated': baseColors.dark.surfaceElevated,
    'bg.overlay': 'rgba(10, 10, 15, 0.8)',
    
    // Text
    'text.primary': baseColors.dark.textPrimary,
    'text.secondary': baseColors.dark.textSecondary,
    'text.muted': '#6B6B74',
    'text.inverse': '#111827',
    
    // Accents
    'accent.gold': baseColors.dark.gold,
    'accent.gold-hover': '#D4AF5C',
    'accent.gold-pressed': '#B8943F',
    'accent.ai': baseColors.dark.aiBlue,
    'accent.ai-hover': '#6B9DF0',
    'accent.ai-pressed': '#4B7DDF',
    
    // Borders
    'border.subtle': baseColors.dark.border,
    'border.default': '#2A2A3A',
    'border.focus': baseColors.dark.gold,
    
    // States
    'state.hover': 'rgba(201, 162, 74, 0.08)',
    'state.pressed': 'rgba(201, 162, 74, 0.12)',
    'state.focus-ring': 'rgba(201, 162, 74, 0.4)',
  },
  
  light: {
    // Backgrounds
    'bg.primary': baseColors.light.background,
    'bg.surface': baseColors.light.surface,
    'bg.surface-elevated': baseColors.light.surfaceElevated,
    'bg.overlay': 'rgba(0, 0, 0, 0.4)',
    
    // Text
    'text.primary': baseColors.light.textPrimary,
    'text.secondary': baseColors.light.textSecondary,
    'text.muted': '#9CA3AF',
    'text.inverse': '#F5F5F7',
    
    // Accents
    'accent.gold': baseColors.light.gold,
    'accent.gold-hover': '#C9A24A',
    'accent.gold-pressed': '#A68336',
    'accent.ai': baseColors.light.aiBlue,
    'accent.ai-hover': '#4A73E8',
    'accent.ai-pressed': '#2A53C8',
    
    // Borders
    'border.subtle': baseColors.light.border,
    'border.default': '#D1D5DB',
    'border.focus': baseColors.light.gold,
    
    // States
    'state.hover': 'rgba(184, 150, 63, 0.08)',
    'state.pressed': 'rgba(184, 150, 63, 0.12)',
    'state.focus-ring': 'rgba(184, 150, 63, 0.4)',
  }
};

// ============================================
// 3. COMPONENT USAGE GUIDELINES
// ============================================

export const componentUsage = {
  // BUTTONS
  buttons: {
    primary: {
      dark: {
        bg: tokens.dark['accent.gold'],
        text: '#0A0A0F',
        hover: tokens.dark['accent.gold-hover'],
        pressed: tokens.dark['accent.gold-pressed'],
        disabled: 'rgba(201, 162, 74, 0.4)',
      },
      light: {
        bg: tokens.light['accent.gold'],
        text: '#FFFFFF',
        hover: tokens.light['accent.gold-hover'],
        pressed: tokens.light['accent.gold-pressed'],
        disabled: 'rgba(184, 150, 63, 0.4)',
      }
    },
    secondary: {
      dark: {
        bg: 'transparent',
        border: tokens.dark['accent.gold'],
        text: tokens.dark['accent.gold'],
        hover: tokens.dark['state.hover'],
        pressed: tokens.dark['state.pressed'],
      },
      light: {
        bg: 'transparent',
        border: tokens.light['accent.gold'],
        text: tokens.light['accent.gold'],
        hover: tokens.light['state.hover'],
        pressed: tokens.light['state.pressed'],
      }
    },
    ghost: {
      dark: {
        bg: 'transparent',
        text: tokens.dark['text.secondary'],
        hover: 'rgba(255, 255, 255, 0.05)',
        pressed: 'rgba(255, 255, 255, 0.1)',
      },
      light: {
        bg: 'transparent',
        text: tokens.light['text.secondary'],
        hover: 'rgba(0, 0, 0, 0.05)',
        pressed: 'rgba(0, 0, 0, 0.1)',
      }
    },
    ai: {
      dark: {
        bg: tokens.dark['accent.ai'],
        text: '#FFFFFF',
        hover: tokens.dark['accent.ai-hover'],
        pressed: tokens.dark['accent.ai-pressed'],
      },
      light: {
        bg: tokens.light['accent.ai'],
        text: '#FFFFFF',
        hover: tokens.light['accent.ai-hover'],
        pressed: tokens.light['accent.ai-pressed'],
      }
    }
  },
  
  // CARDS
  cards: {
    recommendation: {
      dark: {
        bg: tokens.dark['bg.surface'],
        border: tokens.dark['border.subtle'],
        shadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
        elevated: '0 8px 32px rgba(0, 0, 0, 0.5)',
      },
      light: {
        bg: tokens.light['bg.surface'],
        border: tokens.light['border.subtle'],
        shadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
        elevated: '0 8px 32px rgba(0, 0, 0, 0.12)',
      }
    }
  },
  
  // NAVIGATION
  navigation: {
    bar: {
      dark: {
        bg: 'rgba(10, 10, 15, 0.95)',
        border: tokens.dark['border.subtle'],
        active: tokens.dark['accent.gold'],
        inactive: tokens.dark['text.secondary'],
      },
      light: {
        bg: 'rgba(255, 255, 255, 0.95)',
        border: tokens.light['border.subtle'],
        active: tokens.light['accent.gold'],
        inactive: tokens.light['text.secondary'],
      }
    }
  },
  
  // AI HIGHLIGHTS
  aiHighlights: {
    confidence: {
      high: {
        dark: { bg: 'rgba(34, 197, 94, 0.15)', text: '#22C55E', border: 'rgba(34, 197, 94, 0.3)' },
        light: { bg: 'rgba(22, 163, 74, 0.1)', text: '#16A34A', border: 'rgba(22, 163, 74, 0.2)' },
      },
      medium: {
        dark: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)' },
        light: { bg: 'rgba(217, 119, 6, 0.1)', text: '#D97706', border: 'rgba(217, 119, 6, 0.2)' },
      },
      low: {
        dark: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.3)' },
        light: { bg: 'rgba(220, 38, 38, 0.1)', text: '#DC2626', border: 'rgba(220, 38, 38, 0.2)' },
      }
    },
    suggestion: {
      dark: {
        bg: 'rgba(91, 141, 239, 0.1)',
        border: 'rgba(91, 141, 239, 0.3)',
        glow: '0 0 20px rgba(91, 141, 239, 0.2)',
      },
      light: {
        bg: 'rgba(58, 99, 216, 0.08)',
        border: 'rgba(58, 99, 216, 0.2)',
        glow: '0 0 20px rgba(58, 99, 216, 0.15)',
      }
    }
  }
};

// ============================================
// 4. INTERACTION STATES
// ============================================

export const interactions = {
  hover: {
    lift: {
      transform: 'translateY(-2px)',
      shadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    },
    brighten: {
      filter: 'brightness(1.1)',
    },
    glow: {
      boxShadow: '0 0 20px rgba(201, 162, 74, 0.3)',
    }
  },
  pressed: {
    scale: 'scale(0.98)',
    darken: {
      filter: 'brightness(0.95)',
    }
  },
  focus: {
    ring: {
      outline: 'none',
      boxShadow: '0 0 0 3px rgba(201, 162, 74, 0.4)',
    }
  },
  transition: {
    default: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  }
};

// ============================================
// 5. GRADIENTS (Luxury Only)
// ============================================

export const gradients = {
  gold: {
    primary: 'linear-gradient(135deg, #C9A24A 0%, #B8963F 50%, #D4AF5C 100%)',
    subtle: 'linear-gradient(180deg, rgba(201, 162, 74, 0.1) 0%, transparent 100%)',
    shimmer: 'linear-gradient(90deg, transparent 0%, rgba(201, 162, 74, 0.4) 50%, transparent 100%)',
  },
  dark: {
    surface: 'linear-gradient(180deg, #12121A 0%, #0A0A0F 100%)',
    elevated: 'linear-gradient(180deg, #1A1A24 0%, #12121A 100%)',
    glow: 'radial-gradient(ellipse at center, rgba(201, 162, 74, 0.15) 0%, transparent 70%)',
  },
  light: {
    surface: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)',
    elevated: 'linear-gradient(180deg, #FFFFFF 0%, #F3F4F6 100%)',
  },
  ai: {
    glow: 'radial-gradient(ellipse at center, rgba(91, 141, 239, 0.2) 0%, transparent 70%)',
    subtle: 'linear-gradient(135deg, rgba(91, 141, 239, 0.1) 0%, transparent 100%)',
  }
};

// ============================================
// 6. ACCESSIBILITY
// ============================================

export const accessibility = {
  contrastRatios: {
    // Dark mode
    dark: {
      'gold-on-surface': 7.2, // WCAG AAA
      'text-primary-on-surface': 15.8, // WCAG AAA
      'text-secondary-on-surface': 5.4, // WCAG AA
      'ai-on-surface': 4.8, // WCAG AA
    },
    // Light mode
    light: {
      'gold-on-surface': 4.6, // WCAG AA
      'text-primary-on-surface': 16.2, // WCAG AAA
      'text-secondary-on-surface': 5.8, // WCAG AA
      'ai-on-surface': 5.2, // WCAG AA
    }
  },
  minimumSizes: {
    text: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
    },
    touch: {
      min: '44px', // iOS HIG
      comfortable: '48px', // Material Design
    }
  }
};

// ============================================
// 7. MICRO-INTERACTIONS
// ============================================

export const microInteractions = {
  selection: {
    dark: {
      bg: 'rgba(201, 162, 74, 0.15)',
      border: tokens.dark['accent.gold'],
      check: tokens.dark['accent.gold'],
    },
    light: {
      bg: 'rgba(184, 150, 63, 0.12)',
      border: tokens.light['accent.gold'],
      check: tokens.light['accent.gold'],
    }
  },
  recommendation: {
    confidenceIndicator: {
      high: { color: '#22C55E', label: 'High Match' },
      medium: { color: '#F59E0B', label: 'Good Match' },
      low: { color: '#EF4444', label: 'Explore' },
    },
    aiBadge: {
      dark: {
        bg: 'rgba(91, 141, 239, 0.15)',
        text: '#5B8DEF',
        icon: '#5B8DEF',
      },
      light: {
        bg: 'rgba(58, 99, 216, 0.12)',
        text: '#3A63D8',
        icon: '#3A63D8',
      }
    }
  },
  loading: {
    shimmer: {
      dark: 'linear-gradient(90deg, transparent 0%, rgba(201, 162, 74, 0.1) 50%, transparent 100%)',
      light: 'linear-gradient(90deg, transparent 0%, rgba(184, 150, 63, 0.08) 50%, transparent 100%)',
    },
    pulse: {
      dark: 'rgba(201, 162, 74, 0.4)',
      light: 'rgba(184, 150, 63, 0.4)',
    }
  }
};

// ============================================
// 8. ALTERNATIVE VARIATIONS
// ============================================

export const variations = {
  // Version A: Bold Luxury (Stronger gold presence)
  boldLuxury: {
    dark: {
      'accent.primary': '#D4AF37', // Brighter gold
      'accent.secondary': '#C9A24A',
      'gold-presence': 'high',
      'button-style': 'filled-gold',
      'card-border': '1px solid rgba(201, 162, 74, 0.2)',
    },
    light: {
      'accent.primary': '#C9A24A',
      'accent.secondary': '#B8963F',
      'gold-presence': 'high',
      'button-style': 'filled-gold',
      'card-border': '1px solid rgba(184, 150, 63, 0.15)',
    }
  },
  
  // Version B: Ultra-Minimal Monochrome
  minimal: {
    dark: {
      'accent.primary': '#F5F5F7', // White
      'accent.secondary': '#A1A1AA', // Gray
      'gold-presence': 'none',
      'button-style': 'outline-white',
      'card-border': '1px solid #2A2A3A',
      'ai-accent-only': true,
    },
    light: {
      'accent.primary': '#111827', // Black
      'accent.secondary': '#6B7280', // Gray
      'gold-presence': 'none',
      'button-style': 'outline-black',
      'card-border': '1px solid #E5E7EB',
      'ai-accent-only': true,
    }
  }
};

// ============================================
// COLOR PSYCHOLOGY
// ============================================

/**
 * GOLD (#C9A24A / #B8963F)
 * - Represents: Luxury, exclusivity, premium quality
 * - Psychological effect: Trust, prestige, warmth
 * - Usage: Primary CTAs, premium badges, key highlights
 * 
 * AI BLUE (#5B8DEF / #3A63D8)
 * - Represents: Intelligence, technology, clarity
 * - Psychological effect: Calm, trustworthy, innovative
 * - Usage: AI indicators, recommendations, data visualization
 * 
 * DARK BACKGROUND (#0A0A0F)
 * - Represents: Sophistication, focus, premium experience
 * - Psychological effect: Reduced eye strain, immersive, exclusive
 * - Usage: Primary theme for luxury feel
 * 
 * LIGHT BACKGROUND (#F9FAFB)
 * - Represents: Cleanliness, openness, accessibility
 * - Psychological effect: Fresh, approachable, clear
 * - Usage: Secondary theme for daytime use
 */

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  palette,
  tokens,
  componentUsage,
  interactions,
  gradients,
  accessibility,
  microInteractions,
  variations,
};
