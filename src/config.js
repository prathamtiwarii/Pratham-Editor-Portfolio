/**
 * ============================================================
 * SITE CONFIG — edit personal details here only
 * ============================================================
 */
export const SITE_CONFIG = {
  name: 'Pratham Tiwari',
  role: 'Video Editor',
  tagline: 'Frames with main-character energy.',

  email: 'prathamtiwari360@gmail.com',
  emailUrl:
    'https://mail.google.com/mail/?view=cm&fs=1&to=prathamtiwari360@gmail.com',
  instagramHandle: '@prathamtiwarii',
  instagramUrl: 'https://instagram.com/prathamtiwarii',
  whatsapp: '+91 9769116582',
  whatsappUrl: 'https://wa.me/919769116582',
  discord: 'deadpunkk',
}

export const WORK = [
  {
    id: 'watch-society',
    number: '01',
    title: 'Watch Society',
    category: 'Luxury · Product',
    aspect: 'vertical',
    featured: true,
    featuredTreatment: 'premium',
    src: 'https://pub-1e3a9218b53f4a3585505754ba50ba96.r2.dev/Shorts/Watch%20society.mp4',
    poster: '/Shorts/watch_society_short_form.png',
  },
  {
    id: 'property-by-kazy',
    number: '02',
    title: 'Property KratZ',
    category: 'Commercial · Short-form',
    aspect: 'vertical',
    featured: true,
    featuredTreatment: 'editorial',
    src: 'https://pub-1e3a9218b53f4a3585505754ba50ba96.r2.dev/Shorts/Property%20KratZ.mp4',
    poster: '/Shorts/property_kratz_short_form.png',
  },
  {
    id: 'archit-x-inso',
    number: '05',
    title: 'Archit x INSO',
    category: 'Creative · VFX',
    aspect: 'landscape',
    featured: true,
    featuredTreatment: 'cinematic',
    src: 'https://pub-1e3a9218b53f4a3585505754ba50ba96.r2.dev/Shorts/Archit%20x%20INSO.mp4',
    poster: '/posters/archit_x_inso_short_form.png',
  },
  {
    id: 'jason-watson',
    number: '03',
    title: 'Jason Watson',
    category: 'Talking Head · Brand',
    aspect: 'vertical',
    featured: false,
    src: 'https://pub-1e3a9218b53f4a3585505754ba50ba96.r2.dev/Shorts/Jason%20Watson.mp4',
    poster: '/Shorts/jason_watson_short_form.png',
  },
  {
    id: 'saul-paul',
    number: '04',
    title: 'Saul Paul',
    category: 'Editorial · Captions',
    aspect: 'vertical',
    featured: false,
    src: 'https://pub-1e3a9218b53f4a3585505754ba50ba96.r2.dev/Shorts/Saul%20Paul.mp4',
    poster: '/Shorts/saul_paul_short_form.png',
  },
]

/** Long-form projects — YouTube links only (no local MP4 playback). */
export const LONG_FORM = [
  {
    id: 'kim-gross',
    number: '01',
    title: 'Kim Gross',
    category: 'Long-form Edit',
    description:
      'Interview-led storytelling, shaped for clarity, pacing, and retention.',
    url: 'https://youtu.be/BIWKK-Rk2H8',
    aspect: 'landscape',
    poster: '/posters/kim_gross_preview.png',
  },
  {
    id: 'techwiz',
    number: '02',
    title: 'TechWiz',
    category: 'Long-form Edit',
    description:
      'A longer-form cut focused on rhythm, structure, and keeping the story moving.',
    url: 'https://youtu.be/XSDmPnd7Aeg',
    aspect: 'landscape',
    poster: '/posters/techwiz_preview.png',
  },
]

export function getProjectById(id) {
  return WORK.find((w) => w.id === id)
}
