# Phase7A mobile correction — 2026-11-12

The owner explicitly authorized a minimal correction for the confirmed mobile defect, superseding the earlier frontend freeze **only for this defect**. The only changed frontend source is `app/(site)/globals.css`. AOS initializer, welcoming/smile components, designs, dashboard, forms, API/auth/SEO contracts and translations remain unchanged.

## Confirmed cause and controlled diagnosis

Installed AOS2.3.4 applies translateX(+100px) to fade-left and(-100px) to fade-right until an element enters the viewport. Both welcome and smile copy/visual elements use these horizontal fades. Their full-width mobile sections previously allowed horizontal overflow. The offset visual's30px welcome/28px smile gradient also contributes to the out-of-bounds area. In RTL, negative-side overflow contributes to scrollable document width; checking only the right edge misses it.

This is an actual document scroll-area defect while elements wait offscreen, not merely a650ms transition to ignore. It can persist beyond seven seconds until scrolling triggers the relevant sections. A passing run could already have animated the elements. Source inspection confirmed AOS was initialized (`aos-init`, body duration650); no missing-init/Next hydration bug was established.

The original production build was measured at320/375/390/414/430 and1440px, in both languages, through direct DOM readiness, initialized offscreen state, client-side navigation verified by a persistent document sentinel, language switch, in-view animation and scrolling back. Rectangles, layout widths, computed transforms/opacity/direction/grid and overflowing elements were captured. A temporary **diagnostic-only** style removed the welcome transform:390px English still measured484px because smile remained shifted. Removing both sections' transforms reduced it to390px. These styles were removed and are not used in the after-tests.

At320px the existing non-wrapping highlighted hero phrase also exceeded its280px copy area; the already clipped hero container concealed part of real text. It needed wrapping rather than another clipping workaround.

## Exact source changes

1. Below the existing1024px desktop breakpoint, set `overflow-x: clip` only on the two semantic section containers identified by welcoming-heading/smile-heading. These are the smallest existing containers that retain the final gradient offsets and surrounding mobile gutter. `overflow-y` remains visible; no body/html/global horizontal hiding or scroll-container creation is added. Final text/images/gradients fit the viewport and are tested after animation.
2. At375px and below, allow only the hero h1's existing highlighted span to wrap within its copy width, with a fallback for an overlong word. No translation, font size or desktop heading changes.
3. Under prefers-reduced-motion:reduce, make existing AOS elements fully visible without transforms/transitions. This honors the media query immediately and after toggling it, without removing DOM animation attributes or inventing a second initializer. Normal-motion opacity/slide timing and desktop animations remain.

## Before/after measurements

| Viewport | Maximum document width before, either language/navigation state | Document width after |
| --- | --- | --- |
|320 |415 |320 |
|375 |470 |375 |
|390 |485 |390 |
|414 |509 |414 |
|430 |525 |430 |
|1440 |1440 |1440 |

**PASS:** three repeated complete matrix rounds, each with five mobile widths×two languages plus1440px×two languages:30mobile cases and6desktop cases,360snapshots. Every after snapshot has scrollWidth exactly equal to innerWidth and scrollX0, including explicit positive/negative horizontal scroll attempts. Existing strict browser assertion was tightened to exact equality, not relaxed. The check remains at document level, rather than ignoring translated nodes.

After full-page scrolling, visible text ranges are measured for clipping; none were outside the viewport. Welcome image bytes render with nonzero natural dimensions; its frame and gradient fit. Both actual AOS elements per case are verified animated with computed opacity1 after entry, not a vacuous empty selector assertion. Reduced motion is checked on a fresh reload with the preference active. Desktop1440px welcome geometry matches the original measured left/right/width/height exactly in Arabic and English across all three rounds. Page exceptions and legacy requests:0.

Evidence: [summary](evidence/phase7-corrections/mobile-summary.json), [original measurements](evidence/phase7-corrections/before/measurements.json), [after measurements](evidence/phase7-corrections/after/measurements.json), [before English390](evidence/phase7-corrections/before/en-390-top.png), [after English390](evidence/phase7-corrections/after/en-390-top.png), [Arabic welcome after](evidence/phase7-corrections/after/ar-390-welcome.png). Historical failed Phase7 evidence is retained, not relabeled PASS.

## Reproduce

Build with APP_ORIGIN=http://127.0.0.1:3197 and SQL_ENV=test. Supply the existing guarded local disposable test database credentials/JWT keys through private process configuration, never through command arguments. `npm run test:mobile` starts its own production server and runs three matrix rounds in installed Chrome, with public read requests only. It refuses a non-test/non-acknowledged SQL target. Do not run alongside test:browser or test:integration:sql because they own the same port. The before-mode exists for diagnosis against an original artifact, not as a release-success command.

The existing21functional browser scenarios and backend/SQL/typecheck/lint/build/audit are revalidated separately in the current readiness report. No hosted site or production resource was used. Physical mobile devices and non-Chrome engines remain host/release follow-up checks; they are not implied by this local result.
