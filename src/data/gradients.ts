export interface GradientOption {
  id: string;
  css: string;
}

// Placeholder "photos" until real images land in public/backgrounds — see
// public/backgrounds/README.md. Swap this list, not the rendering logic.
export const GRADIENTS: GradientOption[] = [
  { id: 'dusk', css: 'linear-gradient(160deg, #1e293b 0%, #334155 55%, #0f172a 100%)' },
  { id: 'dawn', css: 'linear-gradient(160deg, #7c2d12 0%, #c2410c 45%, #78350f 100%)' },
  { id: 'forest', css: 'linear-gradient(160deg, #052e16 0%, #166534 55%, #022c22 100%)' },
  { id: 'ocean', css: 'linear-gradient(160deg, #0c4a6e 0%, #0369a1 50%, #082f49 100%)' },
  { id: 'lavender', css: 'linear-gradient(160deg, #312e81 0%, #6d28d9 50%, #1e1b4b 100%)' },
  { id: 'rose', css: 'linear-gradient(160deg, #881337 0%, #be123c 45%, #4c0519 100%)' },
  { id: 'slate', css: 'linear-gradient(160deg, #18181b 0%, #3f3f46 55%, #09090b 100%)' },
  { id: 'amber', css: 'linear-gradient(160deg, #78350f 0%, #b45309 45%, #451a03 100%)' },
];
