#1a2b33 -> #17252c
Not but holy #fff #97ab73


Background = #17252c
Primary = #94ad62 (40% lighten -120hue) // AA 6.2
Primary = #9fb673 (45% lighten -120hue) // AAA 7
Primary = #a2b776 (46% lighten -120hue) // AAA 7.1
Primary = #a6bb7d (48% lighten -120hue) // AAA 7.4 -
Primary = #abbe84 (50% lighten -120hue) // AAA 7.7


--- AI
Background = #17242b
Text = #e9eff2 //  ~10%  Lightness = bgLightness + 80% = ~93%
Primary = #a6ba7d // +48% lightness, -120° hue shift
Secondary = #904f72 // Hue = bgHue + 120° = 322° moderate saturation (~25–30%) igher than background but lower than primary for subtlety (~40–50%)
Accent = #9373d9 // complement of primary


--- 

Background = #17252c - oklch(25.5, 0.0233, 230.47)
Primary = # - oklch(25.5, 0.0233, 110.47)


---

Background = #17252c https://hue.tools/info?color=17252cff hsl(200, 31%, 13%)

Triad = #2c1725 hsl(320, 31%, 13%)    #252c17  hsl(80, 31%, 13%)

48 % #a6bb7d hsl(80, 31%, 61%)  #d89cc2 hsl(320 43% 73%)

-> hsl(260, 31%, 61%) tetrad #927dbb

complement #927dbb
-> oklch #b9a5e1


hsl(80, 31%, 61%) oklch(0.76 0.0865 123.43) -> oklch complement -> hsl(264.97 47% 76%) oklch(0.76 0.0865 303.43) #bca4de


hsl(200, 31%, 13%) -> oklch complement -> oklch(0.25 0.0228 50.44) #2c1f19 -> adjusted to primary oklch(0.76 0.0865 50.43) #dea17f


----

Background = #17252c | hsl(200    31% 13%) | oklch(0.26 0.0233  230.47)
Primary =    #a6ba7d | hsl(80     31% 61%) | oklch(0.76 0.0865  123.43) // Background HSL triad +48% lightness
Secondary =  #bca4de | hsl(264.97 47% 76%) | oklch(0.76 0.0865  303.43) // Primary Oklch complementary
Accent =     #dea17f | hsl(21.66  59% 68%) | oklch(0.76 0.0865  50.47)  // Primary Oklch + Background Oklch complementary hue
Foreground = #b5b3a6 | hsl(52     9%  68%) | oklch(0.76 0.0183  99.68)  // Background HSL split complementary +55% lightness -22% saturation

<!-- Foreground = #d0d9de | hsl(200.81 17% 84%) | oklch(0.88 0.01165 230.47) // Background Oklch 1/2 chroma (1 - Primary lightness) / 2 -->
<!-- Foreground = #eaf3f8 | hsl(200.81 51% 95%) | oklch(0.96 0.01165 230.47) // Background Oklch 1/2 chroma 96% lightness (2 * primary lightness bump) -->

---

> Secondary refined: oklch(Primary L -0.05, Primary C ×1.1, Primary Hue +180°)
> Accent refined: oklch(Primary L +0.05, Primary C ×1.2, Background complementary hue)


https://tweakcn.com/editor/theme

