---
name: Serene Organic Minimalist Dark
colors:
  surface: '#101412'
  surface-dim: '#101412'
  surface-bright: '#363a37'
  surface-container-lowest: '#0b0f0d'
  surface-container-low: '#191c1a'
  surface-container: '#1d201e'
  surface-container-high: '#272b28'
  surface-container-highest: '#323633'
  on-surface: '#e0e3df'
  on-surface-variant: '#c2c8c2'
  inverse-surface: '#e0e3df'
  inverse-on-surface: '#2d312f'
  outline: '#8c928d'
  outline-variant: '#424844'
  surface-tint: '#b0cdbc'
  primary: '#b0cdbc'
  on-primary: '#1b352a'
  primary-container: '#8ba898'
  on-primary-container: '#233d31'
  inverse-primary: '#496456'
  secondary: '#bec9c3'
  on-secondary: '#29332f'
  secondary-container: '#414b47'
  on-secondary-container: '#b0bbb5'
  tertiary: '#eabbba'
  on-tertiary: '#462828'
  tertiary-container: '#c39796'
  on-tertiary-container: '#4f3030'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#cbead8'
  primary-fixed-dim: '#b0cdbc'
  on-primary-fixed: '#052015'
  on-primary-fixed-variant: '#324c3f'
  secondary-fixed: '#dae5df'
  secondary-fixed-dim: '#bec9c3'
  on-secondary-fixed: '#141e1a'
  on-secondary-fixed-variant: '#3f4945'
  tertiary-fixed: '#ffdad9'
  tertiary-fixed-dim: '#eabbba'
  on-tertiary-fixed: '#2e1414'
  on-tertiary-fixed-variant: '#603e3d'
  background: '#101412'
  on-background: '#e0e3df'
  surface-variant: '#323633'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style
This design system reimagines organic minimalism for a nocturnal environment. The brand personality is grounded, contemplative, and restorative, targeting a wellness-conscious demographic that seeks digital sanctuary. 

The design style is a blend of **Soft Minimalism** and **Glassmorphism**, moving away from harsh "tech" blacks in favor of deep, earthen tones that mimic the natural world at twilight. The emotional response should be one of "sacred modernity"—a space that feels quiet, high-end, and spiritually resonant. Visuals rely on generous whitespace (dark space), soft gradients that mimic natural light sources, and a tactile sense of depth achieved through translucent layering rather than heavy shadows.

## Colors
The palette is built on "Warm Earth Dark" tones. 
- **Primary (#8BA898):** A luminous Sage Green, slightly adjusted from the original for better legibility and "glow" against dark surfaces.
- **Background (#1A1C1B):** A deep, olive-tinted neutral. This avoids the blue-light strain of pure black, providing a softer, more organic foundation.
- **Surface (#252826):** Used for cards and elevated containers. It maintains a warm, desaturated grey-green hue to create subtle separation from the background.
- **Text Hierarchy:** High-emphasis text uses an off-white (#F2F4F3) to prevent "haloing," while secondary text uses a muted Sage (#A3ADA7).
- **Borders:** Low-contrast dark greens are used to define edges without breaking the fluid feel of the interface.

## Typography
The typography balances the approachable nature of **Be Vietnam Pro** with the modern, clean structure of **Plus Jakarta Sans**. 

Headlines are set in Plus Jakarta Sans with tighter letter-spacing to create a confident, editorial feel. Body text utilizes Be Vietnam Pro for its warm, contemporary terminals which remain highly legible in dark mode. For "sacred" emphasis, use the `label-sm` in all caps with generous letter spacing to act as a quiet organizational guide. Ensure all light-on-dark text maintains a minimum contrast ratio of 4.5:1.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a focus on "breathability." 

- **Desktop:** 12-column grid with wide 64px margins to center the content and create a focused, calm experience.
- **Tablet:** 8-column grid with 32px margins.
- **Mobile:** 4-column grid with 20px margins.

Spacing is governed by an 8px base unit. To maintain the "organic" feel, use `stack-lg` (48px) between major sections to prevent the dark UI from feeling cramped or heavy. Content should reflow vertically on mobile, with cards spanning the full width of the margins.

## Elevation & Depth
Depth is communicated through **Tonal Layering** and **Subtle Blurs**. 

Instead of traditional drop shadows—which can appear muddy on dark, earthy backgrounds—this design system uses "Inner Glow" and "Backdrop Blur." 
1. **Base:** The background layer (#1A1C1B).
2. **Surface:** Cards (#252826) use a subtle 1px border (#3E423F) to define edges.
3. **Floating Elements:** Modals and menus use a slightly more luminous surface with a 12px backdrop blur, allowing the background colors to ghost through, reinforcing the organic, ephemeral aesthetic.
4. **Highlights:** Use a very soft, top-down linear gradient (White at 5% opacity to Transparent) on cards to simulate a faint overhead light source.

## Shapes
The shape language is consistently **Rounded**, avoiding sharp corners to maintain a soft, welcoming, and youthful energy. 

- **Primary Buttons & Containers:** 0.5rem (8px) radius.
- **Cards & Larger Sections:** 1rem (16px) radius to emphasize the "organic" container.
- **Feature Elements:** Use 1.5rem (24px) for featured images or highlight banners to create a distinct, softer focal point. 
Icons should follow a "Line-Art" style with rounded caps and joins to match the geometry of the components.

## Components
- **Buttons:** Primary buttons are filled with Sage (#8BA898) and use dark text (#1A1C1B) for maximum punch. Secondary buttons are "Ghost" style with a Sage border and text. 
- **Cards:** Use the Surface color (#252826) with 16px padding. Content within should be left-aligned to maintain a clean vertical rhythm.
- **Chips/Tags:** Small, pill-shaped elements with a background of #3E423F and light sage text. These are used for categorization without overwhelming the visual hierarchy.
- **Input Fields:** Darker than the surface (#1A1C1B), with a subtle 1px border. On focus, the border transitions to Sage with a faint outer glow.
- **Progress Indicators:** Use soft, rounded bars. The track should be a dark neutral, with the active progress in a Sage-to-Light-Green gradient.
- **Selection Controls:** Checkboxes and radio buttons use the Primary Sage color when active, with a soft "bloom" effect (glow) rather than a hard shadow.