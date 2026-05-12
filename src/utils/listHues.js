export const LIST_HUES = {
  urgent:    'var(--color-urgent)',
  daily:     'oklch(0.70 0.07 80)',
  weekly:    'oklch(0.68 0.07 200)',
  monthly:   'oklch(0.68 0.08 280)',
  quarterly: 'oklch(0.68 0.08 160)',
  annually:  'oklch(0.65 0.06 30)',
  reading:   'oklch(0.66 0.06 320)',
};

export function getHue(listId) {
  return LIST_HUES[listId] || 'var(--color-text-tertiary)';
}
