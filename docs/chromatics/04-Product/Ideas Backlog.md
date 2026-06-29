---
tags: [product, ideas]
---

# Ideas Backlog

Structured backlog of concrete feature ideas for a model-specific color utility, grouped by theme. Sourced from early product-thinking dumps. For formalized specs see [[Feature Specs]]; for unresolved tensions see [[Open Questions]]; for sequencing see [[Roadmap]].

> [!note] Stance: "No AI / user in control" — reframed
> The original dumps were emphatic: **no AI-randomized schemes**, every color combination has a rationale, the user drives the choices. The tool may be "smart" deterministically (theory-based suggestions, rule-based contrast adjustments) but does not guess. This hard stance has since been **reframed** rather than dropped — see [[Open Questions]] for where AI/assistance might re-enter (e.g. natural-language palette prompts) without sacrificing predictability and control.

## Theme: Interactive Visualization of Color Models

- **3D model views** — Render colors in their model's geometric shape (RGB cube, HSL cylinder). Rotate/slice to see how colors change per component.
- **Interactive sliders & wheel** — Dedicated per-channel controls for the selected model (circular hue picker + S/L sliders for HSL; three sliders / cube for RGB). Highlight the current color's position in the model.
- **Cross-model comparison** — Toggle the *same* color's visualization between models side by side (HSL cylinder vs. RGB cube) to show how one color occupies different coordinates per space.
- **Color harmony wheel** — Pick a base hue; see harmony positions (complementary, triadic, analogous) marked on the wheel. Drag points to adjust the scheme (e.g. widen split-complementary) with live updates.

## Theme: Flexible Color Parsing & Input

- **Support all common formats** — hex (`#RRGGBB`/`#RGB`), RGB(A), HSL(A), CSS color names; curated name dictionary.
- **"Raw" model inputs** — In model-specific mode, accept bare numerics (e.g. `210, 50, 60` → HSL(210°, 50%, 60%)) mapped via conventional ranges, no `hsl()` wrapper needed.
- **Abstract & relative color parsing** — CSS Color Level 4 syntax (`color(mix in Lab, red 30%, blue)`, `oklab(from #0000FF calc(l + 0.1) a b)`); textual commands like "lighten 20%", "desaturate 10%" applied to a base color — a color calculator.
- **Batch & palette parsing** — Paste a CSS block or JSON theme; scan for color values and list them for manipulation. For migrating palettes or bulk conversion.
- **Error-tolerant input** — Accept `hsl(210 50 60)` (no commas), shorthand `fff` → `#ffffff`.
- **Model detection** — Guess the format when no model context is set, or require explicit tags/dropdown to disambiguate. Smart parsing that always interprets values in a known model.

## Theme: Advanced Conversion & Model Exploration

- **Multi-model conversion** — Show a color's values across many models simultaneously (HEX, RGB, HSL, HSV, HWB, CMYK, LAB, LCH, OKLab, …), updating in real time.
- **Wide gamut & new color spaces** — Support OKLab/OKLCH and Display-P3. Tweak perceived lightness/chroma in OKLCH then convert back to sRGB; flag out-of-sRGB-gamut results. Enables perceptually-uniform gradients/palettes.
- **Color model comparison & info** — Pick two colors, see their ΔE in Lab and their coordinates in a chosen model — teaches each model's strengths.
- **Interactive model conversion** — Manipulate a color in one model and watch the equivalent change in another (adjust HSL lightness, watch RGB twist). Real-time linkage, educational.
- **Blend & interpolate in chosen model** — Mix two colors / generate gradients, with the user choosing the model's math (sRGB vs. HSL vs. Lab/LCH). Toggle to compare results; LCH/OKLab often yield smoother transitions.
- **Color math & custom models** — Playground for expressions like `(#ff0000 + #0000ff)/2` or `mix(#ff0000, #00ff00, 25% in LAB)`; convert a whole palette to a target model (e.g. nearest Pantone, or CMYK for print).

## Theme: Color Scheme Design & Palette Generation

- **Algorithmic palette generation** — From a base color, produce a full tint/shade scale (Tailwind 50–900 style) by adjusting lightness in a chosen model; switch between HSL lightness, Lab lightness, or mix-with-white/black.
- **Multi-base palettes** — Ensure an extended palette includes two+ key colors; interpolate between bases (e.g. blue→blue-green→green) with user-chosen count and interpolation model.
- **Classic color harmonies** — Complementary, split-complementary, triadic, tetradic, analogous, monochromatic. Theory-based (not arbitrary); presented on the wheel, adjustable (drag to asymmetrical variants, tweak per-color S/L).
- **Preview & testing** — Apply palette to UI mock elements (text on background, buttons, charts) to check visibility and contrast in context; interactive component selection.
- **Perceptual palette adjustment** — Mode generating equal perceived steps (Lab/OKLCH), avoiding light-color crowding and keeping hue constant across lightness (a red stays red as it lightens, unlike naive HSL).
- **Manual fine-tuning** — Tweak any generated swatch in model terms ("adjust this one's L", "reduce saturation for the darkest tone"); updates output and preview immediately. Last-mile control like Tailwind's hand-tuned palette.
- **Deterministic "smarts" (not AI)** — Suggestions rooted in theory or user-defined rules; no random "trending" combos. May still warn/adjust low-contrast results (with permission). See the stance note above and [[Open Questions]].

## Theme: Customization, Integration & Output

- **Export in multiple formats** — Tailwind config snippet, SCSS/Sass map, CSS custom properties, JSON design tokens, `theme.json`; for designers: swatch-sheet image, Adobe ASE/ACO, Figma palette. (Mirrors Leonardo's token/CSS-variable output.)
- **Personalized settings** — Remember default output format (HEX, Tailwind classes) and default models per action (e.g. always blend in LAB).
- **UI customization & theming** — Light/dark mode for the app itself; optionally apply the user's chosen palette to the app UI (meta dogfooding).
- **Use-case-specific workspaces** — Modes like "Accessibility Checker" (list text/background colors, see WCAG ratios per pairing) or "Brand Guide" (primary/secondary/accent → structured palette sheet with variations).
- **Collaboration & sharing** — Save palettes/projects to cloud, share links; recipient sees numeric values and can toggle output format. GitHub gist / Google Drive integration for versioning.
- **Integration with design/dev tools** — Figma plugin (send frame colors to the tool, bring updated palette back), VS Code extension (fetch saved palettes to enforce consistency). Longer-term.
- **Accessibility aids** — Built-in contrast calculators and color-vision-deficiency simulators; ratio + AA/AAA for any pair; suggest adjustments to improve contrast; color-blindness preview of a palette. A color decision-support system.
- **Tailored presets / templates** — "Tailwind Palette" (50–900 slots), "Material Design" (primary/secondary/surface/error). Users modify or define their own color-role templates.

## Theme: Positioning / Differentiators

- **Model-specific focus** — Operate deliberately *within* a chosen model (HSL, Lab, …) for predictable, model-true results; educational by doing.
- **No AI — user in control** — Every combination has a rationale; the tool guides (formulas, harmonies, perceptual models) but the user drives. (Reframed — see stance note and [[Open Questions]].)
- **Rich visual & interactive experience** — 3D views, interactive diagrams, dynamic parsing; play with and *see* color relationships.
- **Comprehensive tooling in one place** — Harmonies, converters, accessibility checks, exports — full workflow without switching sites.
- **Actionable & practical** — Every feature solves a real task (parse a CSS snippet, generate a Tailwind palette, share with teammates). A workhorse, not a toy.
- **Continuous learning curve** — Serves beginners and experts; grows with skill (analogous harmony → Lab tab → 3D view → relative-color syntax).

---

Related: [[Feature Specs]] · [[Open Questions]] · [[Roadmap]]
