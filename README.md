# Kenny Fok Portfolio

Personal portfolio for Kenny Fok, a fullstack developer working across health tech, clinical software, and research tooling. Square grid framing, a continuous single-lead sinus-rhythm animation, and a horizontal project gallery use the existing charcoal, mint, and blue palette.

Live site: [kennyklfok.github.io](https://kennyklfok.github.io)

## Overview

This site highlights:

- Fullstack and health tech project work
- Technical stack and tools
- Peer-reviewed publication information
- Experience across ECG validation, cardiology technology, and biomedical research
- Contact links for LinkedIn and GitHub

## Featured Projects

- [CapyECG](https://capyecg.onrender.com/) - React/FastAPI ECG trainer with synthetic 12-lead waveforms, 150 practice cases across 30 patterns, and an 82-topic study guide. [Source](https://github.com/kennyklfok/CapyECG).
- [code expl.AI.ner](https://github.com/kennyklfok/hackthebreak2026) - VS Code extension and AI developer tool built with Node.js, Express, and Groq API.
- [Burnaby Hospital Diagnostic Cardiology](https://bh-card-website.web.app/) - Responsive clinical department website hosted on Firebase.
- [SureSpot](https://github.com/kennyklfok/SureSpot) - Real-time parking availability tracker using Firebase and MapTiler.
- [Holter Box Check](https://holter-box-check.pages.dev/) - TypeScript staff check-in tool using Cloudflare Pages, Pages Functions, and D1. [Source](https://github.com/kennyklfok/holter-box-check).

## Publication

Deletion of carboxypeptidase E in beta cells disrupts proinsulin processing but does not lead to spontaneous development of diabetes in mice.

- DOI: [10.2337/db22-0945](https://doi.org/10.2337/db22-0945)
- PubMed: [37364047](https://pubmed.ncbi.nlm.nih.gov/37364047/)

## Tech

The site is built with plain static files:

- HTML
- CSS
- JavaScript
- GitHub Pages

No build step is required.

## Local Development

Open `index.html` directly in a browser, or serve the folder locally:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Structure

```text
.
+-- index.html
+-- assets/
|   +-- css/
+-- README.md
```

## Notes

The site defaults to dark mode and includes a color theme toggle that stores the selected theme in `localStorage`.

A 3.2-second sinus-rhythm entrance plays on the first visit in each browser, ending with an 800-millisecond crossfade into the page. A “Replay entrance” button in the footer returns to the top and replays the sequence. The visit flag (`kenny-ecg-intro-seen`) is stored locally. Reduced-motion preferences skip the entrance and disable decorative motion. If browser storage is unavailable, the site remains usable without persistence.

The project gallery supports native touch/trackpad scrolling, numbered project buttons, looping previous/next buttons, and Left/Right/Home/End keys when the gallery is focused. Projects precede Stack to make the work easier to find. All descriptions, experience details, education, and publication information are retained. Navigation and content remain accessible without JavaScript; the gallery can still be scrolled horizontally.

Interactions use browser APIs with no animation-library dependency. Fonts use the existing Google Fonts families with local system fallbacks.

The hero's decorative terminal status repeats a six-second cycle: two seconds of “checking website...” and four seconds of “website healthy,” with crossfades, animated dots, a blinking cursor, and a status dot synchronized to the ECG's one-second heartbeat. The ECG scrolls uninterrupted. This is a visual motif, not a network or backend health check. Reduced-motion mode keeps a static healthy label and waveform without cycling announcements to screen readers.

## Project previews

Project cards include screenshots with full-size links. CapyECG, SureSpot, and the hospital site were captured from their live interfaces. Holter Box Check uses an isolated local copy with sample staff data. The code explainer screenshot uses the actual extension webview with sample JavaScript; its browser demo uses a fixed sample response and makes no AI requests.

Screenshots are stored in `assets/images/projects/`. The sample extension webview is in `assets/demos/code-explainer/`; its Source Code Pro font license is included.

An optional Holter Box Check usage video is retained locally for later use and is excluded from the deployed site. The project card shows its expandable screenshot.
