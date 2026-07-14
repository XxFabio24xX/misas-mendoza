---
name: Serene Organic Minimalist
colors:
  surface: '#fdf9ee'
  surface-dim: '#dddacf'
  surface-bright: '#fdf9ee'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3e8'
  surface-container: '#f2eee3'
  surface-container-high: '#ece8dd'
  surface-container-highest: '#e6e2d7'
  on-surface: '#1c1c15'
  on-surface-variant: '#424844'
  inverse-surface: '#323129'
  inverse-on-surface: '#f5f0e5'
  outline: '#727974'
  outline-variant: '#c2c8c2'
  surface-tint: '#496457'
  primary: '#476254'
  on-primary: '#ffffff'
  primary-container: '#5f7b6c'
  on-primary-container: '#f5fff7'
  inverse-primary: '#b0cdbd'
  secondary: '#655e4c'
  on-secondary: '#ffffff'
  secondary-container: '#eadfc9'
  on-secondary-container: '#696250'
  tertiary: '#5a5d54'
  on-tertiary: '#ffffff'
  tertiary-container: '#72766c'
  on-tertiary-container: '#fbfef2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ccead8'
  primary-fixed-dim: '#b0cdbd'
  on-primary-fixed: '#052016'
  on-primary-fixed-variant: '#324c40'
  secondary-fixed: '#ece1cb'
  secondary-fixed-dim: '#d0c5b0'
  on-secondary-fixed: '#201b0e'
  on-secondary-fixed-variant: '#4d4636'
  tertiary-fixed: '#e1e4d8'
  tertiary-fixed-dim: '#c5c8bd'
  on-tertiary-fixed: '#191d16'
  on-tertiary-fixed-variant: '#444840'
  background: '#fdf9ee'
  on-background: '#1c1c15'
  surface-variant: '#e6e2d7'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  caption:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: '0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1120px
  gutter: 24px
---

## Brand & Style
The brand personality is tranquil, grounded, and sophisticated, specifically tailored for a younger demographic seeking a mindful and high-end digital experience. This design system focuses on a **Modern Minimalist** aesthetic with a strong **Editorial** influence, prioritizing content clarity over decorative elements.

The UI should evoke a sense of calm and intentionality. By utilizing a "Warm Organic" palette and generous whitespace, the design system avoids the coldness of traditional tech minimalism, opting instead for a soft, approachable, and premium tactile feel.

## Colors
The color strategy relies on a low-contrast, harmonious relationship between organic tones. 
- **Primary (#769283):** Used sparingly for key actions, active states, and brand highlights to maintain its impact.
- **Main Background (#f2eee3):** The foundation of the UI, providing a warm, paper-like quality that reduces eye strain.
- **Secondary Background/Cards (#e9dec8):** Provides subtle depth for containerized content without requiring heavy shadows.
- **Details/Borders (#c0c3b8):** Used for hair-line dividers and structural definition to keep the layout organized yet soft.

## Typography
We use **Geist** exclusively to achieve a precise, technical, yet highly legible look. The typographic hierarchy is built on "Editorial Spacing"—meaning larger line heights and tighter letter spacing for headlines to create a customized, high-end feel.

Body text should maintain a generous line height (1.6) to enhance readability and reinforce the "airy" brand personality. Labels are rendered in uppercase with slight tracking to provide a clear functional contrast to narrative text.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy for desktop to maintain the editorial "magazine" feel, transitioning to a fluid layout for mobile devices. 

- **Desktop:** 12-column grid, 1120px max-width, center-aligned.
- **Tablet:** 8-column grid, 32px margins.
- **Mobile:** 4-column grid, 20px margins.

Spacing is used aggressively; do not be afraid of "empty" space. Sections should be separated by `xl` spacing to allow content to breathe. Components within sections should use `md` spacing to maintain a clear relationship.

## Elevation & Depth
Depth is created through **Tonal Layering** rather than traditional heavy shadows. 
- **Surface 0 (Main BG):** #f2eee3.
- **Surface 1 (Cards/Modals):** #e9dec8.
- **Shadows:** When necessary for interactivity (e.g., hovering a card), use an extremely diffused ambient shadow: `0 12px 32px rgba(118, 146, 131, 0.08)`. This tints the shadow with the primary Sage Green color, making it feel integrated into the environment.
- **Outlines:** Use 1px borders in #c0c3b8 for secondary buttons and input fields to define shape without adding visual weight.

## Shapes
The design system utilizes a "Large Roundness" strategy to offset the technical precision of the Geist typeface. This creates a friendly, "squishy," and approachable interface. 

Buttons and input fields use a consistent 16px (`rounded-lg` in this context) radius. Larger containers like cards use 24px (`rounded-xl`), while primary "Pill" buttons or tags use a fully rounded layout to signify high interactivity.

## Components
- **Buttons:** Primary buttons are solid Sage Green (#769283) with white or cream text. Secondary buttons are outlined in #c0c3b8. All buttons use 16px padding on the Y-axis and 32px on the X-axis for a wide, premium look.
- **Cards:** Cards use the Warm Beige (#e9dec8) background with no border. On hover, they lift slightly with the tinted ambient shadow.
- **Inputs:** Input fields are background-less with a bottom border of 1.5px in #c0c3b8. This enhances the editorial feel. When focused, the border transitions to Sage Green.
- **Chips/Badges:** Small, fully rounded (pill) elements using #c0c3b8 with a 40% opacity background and dark green text.
- **Lists:** Items are separated by generous padding (24px) and a subtle 1px divider in #c0c3b8 that does not span the full width of the container.
- **Navigation:** Top-tier navigation uses wide spacing between items, utilizing the `label-md` typographic style for a clean, professional header.