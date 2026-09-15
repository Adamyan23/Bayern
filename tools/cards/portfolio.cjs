// Раскладка карточек портфеля из Figma «BAYERN — Portfolio cards template» (координаты в системе 360×480).
// Порядок слоёв = порядок в Figma (снизу вверх). Тексты/стрелка на сайте всегда поверх.
const G = 'gradient'; // радиальный светлый фон шаблона + слой IMAGE (#E2E0DD, 55%)
module.exports = [
  { id: 'weber-mt', name: 'Weber MT', cc: 'DE', country: 'de', cat: 'compaction', bg: G, layers: [
    { src: 'Weber/weber3.png', x: 12, y: 199, w: 133, h: 211, photo: true },
    { plate: '#313436', x: 13, y: 7, w: 241, h: 74 },
    { src: 'Weber/WeberMT-Logo.png', x: 18, y: 12, w: 231, h: 63, logo: true },
    { src: 'Weber/weber2.png', x: 66, y: 140, w: 287, h: 330, photo: true }
  ] },
  { id: 'imer', name: 'IMER', cc: 'IT', country: 'it', cat: 'access', bg: '#FFFFFF', layers: [
    { src: 'Imer/imer2.png', x: 4, y: 64, w: 360, h: 446, photo: true },
    { plate: '#EFEFEF', x: 10, y: 6, w: 241, h: 74 },
    { src: 'Imer/Imer-logo.png', x: 47, y: 11, w: 161, h: 64, logo: true }
  ] },
  { id: 'enar', name: 'ENAR', cc: 'ES', country: 'es', cat: 'concrete', bg: G, layers: [
    { plate: '#313436', x: 10, y: 6, w: 241, h: 74 },
    { src: 'Enar/enar-logo.svg', x: 10, y: 13, w: 236, h: 60, logo: true, contain: true },
    { src: 'Enar/enar3.png', x: 61, y: 49, w: 284, h: 284, photo: true },
    { src: 'Enar/enar4.png', x: 2, y: 166, w: 350, h: 350, photo: true }
  ] },
  { id: 'kern-deudiam', name: 'Kern-Deudiam', cc: 'DE', country: 'de', cat: 'diamond', bg: '#FFFFFF', layers: [
    { plate: '#FFFFFF', x: 8, y: 8, w: 241, h: 74 },
    { src: 'Kern-Deudiam/kern-logo.png', x: 38, y: 15, w: 172, h: 60, logo: true, crop: [0.9974227, 0.0012887, 0.6185567, 0.1958763] },
    { src: 'Kern-Deudiam/kern6.png', x: 92, y: 105, w: 233, h: 370, photo: true },
    { src: 'Kern-Deudiam/kern7.png', x: -58, y: 140, w: 215, h: 215, photo: true }
  ] },
  { id: 'ofmer', name: 'Ofmer', cc: 'IT', country: 'it', cat: 'rebar', bg: G, layers: [
    { plate: '#313436', x: 10, y: 6, w: 241, h: 74 },
    { src: 'Ofmer/ofmer3.png', x: 15, y: 87, w: 418, h: 419, photo: true },
    { src: 'Ofmer/OFMER_LOGO.png', x: 27, y: 22, w: 219, h: 41, logo: true }
  ] },
  { id: 'geda', name: 'Geda', cc: 'DE', country: 'de', cat: 'lifting', bg: '#FFFFFF', layers: [
    { src: 'Geda/geda5.png', x: 18, y: 119, w: 365, h: 365, photo: true },
    { plate: '#FFFFFF', x: 10, y: 6, w: 241, h: 74 },
    { src: 'Geda/geda_logo.png', x: 54, y: 16, w: 153, h: 53, logo: true }
  ] },
  { id: 'dynapac', name: 'Dynapac', cc: 'SE', country: 'se', cat: 'light', bg: '#ECEBE9', layers: [
    { plate: '#9A2A20', x: 8, y: 8, w: 241, h: 74 },
    { src: 'Dynapac/dynapac-logo.png', x: 10, y: 15, w: 238, h: 60, logo: true },
    { src: 'Dynapac/dynapac4.png', x: 0, y: 123, w: 381, h: 287, photo: true }
  ] },
  { id: 'hatz', name: 'Hatz', cc: 'DE', country: 'de', cat: 'power', bg: '#E5E5E5', layers: [
    { src: 'Hatz/hatz4.png', x: -59, y: 161, w: 511, h: 319, photo: true },
    { plate: '#DA281B', x: 8, y: 9, w: 241, h: 74 },
    { src: 'Hatz/hatz-logo.png', x: 44, y: 13, w: 169, h: 61, logo: true, crop: [1, 0, 0.4008276, 0.4870357] }
  ] },
  { id: 'yanmar', name: 'Yanmar', cc: 'JP', country: 'jp', cat: 'compact', bg: '#FFFFFF', layers: [
    { src: 'Yanmar/yanmar3.png', x: 38, y: 85, w: 350, h: 389, photo: true },
    { plate: '#FFFFFF', x: 8, y: 8, w: 241, h: 74 },
    { src: 'Yanmar/yanmar-logo.png', x: 10, y: 18, w: 230, h: 56, logo: true, crop: [0.9072979, 0.0276134, 1, 0] }
  ] }
];
