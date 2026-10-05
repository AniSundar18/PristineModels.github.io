# Pristine Models project page

A static, dependency-free project page (plain HTML, CSS, JS). No build step.
Layout: title, authors, link buttons, teaser video, TL;DR, then an essay with a sticky contents list.

## Preview locally

```bash
cd pristine-site
python3 -m http.server 8000
# open http://localhost:8000
```

## Fill in before publishing

1. **Links**: edit `assets/js/config.js` (paper, code, pdf). Empty values show as "(soon)". Only `https://` URLs are accepted.
2. **Teaser video**: drop an H.264 MP4 at `assets/video/teaser.mp4`. Until then the teaser image is shown with a "coming soon" tag.
3. **BibTeX**: edit the entry in the `#cite` section of `index.html` (add the arXiv id).
4. **Title/OG tags**: the `<head>` of `index.html` has the page title and social-preview tags.
5. **Writeup**: each section in `index.html` is a `<section id="...">`. Add a new one and a matching `<li>` in the `<nav class="toc">` and it appears in the contents list.

## Publish on GitHub Pages (when you are ready)

```bash
git remote add origin git@github.com:<user-or-org>/<repo>.git
git push -u origin main
```

Then on GitHub: Settings, Pages, Source = "Deploy from a branch", Branch = `main`, folder `/ (root)`.
The site appears at `https://<user-or-org>.github.io/<repo>/`. All paths are relative, so it works from a repo subpath.
`.nojekyll` is included so GitHub serves the files as-is.

## Notes

- Security: a Content Security Policy is set via a `<meta>` tag (GitHub Pages cannot set headers). Everything is self-hosted: no CDN scripts, fonts, or analytics. If you add any external resource, update the policy in `index.html`.
- The ImageNet interactive demo uses crops of the paper's figure (`assets/img/inet-r*.jpg`). Rows 5 to 7 of that figure were left out; see the note in the chat history.
- Figures were converted from the paper's PDFs to WebP/JPEG. Original PDFs are not included.
