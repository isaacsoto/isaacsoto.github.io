import type { Profile } from '@/types'
import { mdiEmailOutline, mdiGithub, mdiInstagram } from '@mdi/js'
import gdLogo from '@/assets/logos/giesecke-devrient-wordmark.svg?raw'
import microsoftLogo from '@/assets/logos/microsoft.svg?raw'
import softubeLogo from '@/assets/logos/softube-wordmark.svg?raw'

export const profile: Profile = {
  name: 'Izzy Sorrow',
  handle: 'isaacsoto',
  tagline: 'Extended range developer',
  about: [
    'I write code that makes images, motion and noise. Algorithms tuned low, drop-tuned and distorted.',
  ],
  tools: ['Typescript', 'Vue', 'Angular', 'p5.js', 'Playwright', 'C++', 'JUCE', 'Java', 'Processing'],
  // Logos are single-colour SVGs (fill="currentColor"), tinted by CSS.
  // stageScale balances their visual size in the "Shared the stage with" strip.
  // TODO: replace the placeholder years and cities, set `current: true` on an ongoing job.
  experience: [
    {
      company: 'Softube AB',
      years: '2023 – present',
      city: 'Linköping, SE',
      billing: 'Headliner',
      role: 'Web Developer: Lead Dev for Softube Central, rewrite of the whole Softube Central app.',
      logo: softubeLogo,
      stageScale: 1.1,
      current: false,
    },
    {
      company: 'Giesecke + Devrient Mobile Security Sweden AB',
      years: '2021 – 2023',
      city: 'Stockholm, SE',
      billing: 'Main support',
      role: 'Software Engineer: Design Systems, automated user tests, backend and front end development.',
      logo: gdLogo,
      stageScale: 0.55,
      current: false,
    },
    {
      company: 'Microsoft',
      years: '2018 – 2019',
      city: 'Copenhagen, DK',
      billing: 'Opening act',
      role: 'Software Developer (IAESTE Intern): Automatic tools for developer experience, data visualization.',
      logo: microsoftLogo,
      stageScale: 0.8,
      current: false,
    },
  ],
  links: [
    { label: 'GitHub', href: 'https://github.com/isaacsoto', icon: mdiGithub },
    // { label: 'Instagram', href: 'https://instagram.com/yourhandle', icon: mdiInstagram },
    // { label: 'Email', href: 'mailto:you@example.com', icon: mdiEmailOutline },
  ],
}
