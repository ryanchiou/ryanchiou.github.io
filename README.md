# portfolio

Source for [ryanchiou.github.io](https://ryanchiou.github.io). Built with React and Vite, and deployed to GitHub Pages on every push to `main`.

## Running locally

```sh
npm i
npm run dev
```

## Layout

```
src/
  app/
    components/portfolio/   home page sections (hero, gallery, about, nav)
    components/project/     case-study page template and blocks
    projects/               one file per case study
  assets/
    elements/               site-wide art: profile photo, logos, corgi layers
    projects/<project>/     each project's home-page tile and case-study images
  styles/                   fonts, Tailwind, theme tokens
public/                     files served as-is (resume, fonts)
scripts/                    Python scripts that cut source art into layers
```
