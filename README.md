# AVANT*GARDE Film Fest 2027 — Website

The official site for AVANT*GARDE, an inclusive short film competition hosted by Navkis Educational Centre in Gokula, Bangalore. The festival runs on **26 June 2027**.

## Features

- **Animated intro** with a "Roll with sound" or "Watch silently" choice. Sound is controlled by a toggle in the bottom left.
- **Hero** with the AVANT*GARDE wordmark, a live countdown to the festival, and two marquee ribbons.
- **Manifesto** where the words turn from grey to blue as you scroll.
- **Five categories** (A to E), including an AI category. Rows fill on hover, and the AI row has a rainbow sweep and a glitch when you leave it.
- **Film-strip marquee** between sections.
- **Themes** teasers that peek on hover or tap.
- **Podium** with confetti and animated prize steps.
- **Save the date** ticket and an Instagram link.
- **Custom cursor** on desktop. It is a small dot that becomes a ring over text, and a large spinning asterisk over cards and buttons. Its colours change based on the section underneath.
- **Responsive layout** for phones, tablets, and desktops, with a hamburger menu under 900px.
- **Reduced-motion support.** Animations are switched off for users who have that setting turned on.

## Tech stack

- [React](https://react.dev/) (functional components and hooks)
- [Vite](https://vitejs.dev/) for development and builds
- Plain CSS, embedded in `app.jsx` as a string
- Google Fonts: Archivo, Instrument Serif, JetBrains Mono

## Project structure

```
avant-garde/
├── public/
│   ├── avantgarde-mark.png   # logo mark
│   ├── navkis-logo.png       # host logo
│   └── song.mp3              # background track (optional)
├── src/
│   ├── app.jsx               # all components, styles, and cursor logic
│   ├── main.jsx              # React entry point
│   └── index.css             # global base styles
├── index.html                # page shell and font links
├── package.json
└── vite.config.js
```

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm (comes with Node)

### Install and run

```bash
npm install
npm run dev
```

Open the local address Vite prints, usually `http://localhost:5173`.

### Build for production

```bash
npm run build
npm run preview
```

The output goes to `dist/`.

## Customising

- **Dates and countdown:** change `FEST_DATE` at the top of `src/app.jsx`.
- **Instagram handle:** change `IG` at the top of `src/app.jsx`.
- **Categories:** edit the `CATEGORIES` array.
- **Manifesto text:** edit the `MANIFESTO` array. Wrap a word in `*asterisks*` in headings to italicise it.
- **Cursor colours:** edit `PALETTE`, `INK`, and `SAMPLE` in `src/app.jsx`.
- **Background song:** replace `public/song.mp3`.
- **Theme images:** the four theme cards are CSS art. Replace the `.theme-art` backgrounds in the `STYLES` string with `background-image` to use real stills.

## Browser support

Works in current versions of Chrome, Firefox, Safari, and Edge. The custom cursor and the colour-sampling features need a device with a fine pointer (a mouse or trackpad). On touch devices the normal cursor is used.

## Credits

- Logo and brand identity: AVANT*GARDE
- Hosted by Navkis Educational Centre, Gokula, Bangalore

## License

All rights reserved. Contact the organisers before reusing the brand assets, logos, or content.