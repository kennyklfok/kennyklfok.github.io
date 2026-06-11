# Kenny Fok Portfolio

Minimal personal portfolio for Kenny Fok, a fullstack developer working across health tech, clinical software, and research tooling.

Live site: [kennyklfok.github.io](https://kennyklfok.github.io)

## Overview

This site highlights:

- Fullstack and health tech project work
- Technical stack and tools
- Peer-reviewed publication information
- Experience across ECG validation, cardiology technology, and biomedical research
- Contact links for LinkedIn and GitHub

## Featured Projects

- [code expl.AI.ner](https://github.com/kennyklfok/hackthebreak2026) - VS Code extension and AI developer tool built with Node.js, Express, and Groq API.
- [Burnaby Hospital Diagnostic Cardiology](https://bh-card-website.web.app/) - Responsive clinical department website hosted on Firebase.
- [SureSpot](https://github.com/kennyklfok/SureSpot) - Real-time parking availability tracker using Firebase and MapTiler.

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
|   +-- js/
|   +-- webfonts/
+-- README.md
```

## Notes

The site defaults to light mode and includes a dark-mode toggle that stores the selected theme in `localStorage`.
