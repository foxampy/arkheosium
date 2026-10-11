export interface Branding {
  name: string;
  tagline: string;
  logoSrc: string;
  htmlTitle: string;
  metaDescription: string;
  primaryColor: string;
  accentColor: string;
}

export const BRAND: Branding = {
  name: 'ARKHEOSIUM',
  tagline: 'Planetary Infrastructure Intelligence Operating System',
  logoSrc: '/logo.png',
  htmlTitle: 'ARKHEOSIUM — Planetary OS',
  metaDescription:
    'ARKHEOSIUM — глобальная цифровая операционная система управления ресурсами, технологиями, инфраструктурой и развитием цивилизации.',
  primaryColor: '#00d4ff',
  accentColor: '#7c3aed',
};
