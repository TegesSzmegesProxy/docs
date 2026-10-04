export const EASE_OUT = [0.22, 0.8, 0.24, 1] as const;
export const DUR = { fast: 0.12, base: 0.22, slow: 0.48, reveal: 0.7 } as const;

export const reveal = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: DUR.reveal, ease: EASE_OUT },
} as const;

/** `reveal` with an 80 ms stagger step. */
export function revealAt(i: number) {
  return { ...reveal, transition: { ...reveal.transition, delay: i * 0.08 } };
}
