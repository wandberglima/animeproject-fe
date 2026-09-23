export function formatarData(iso?: string): string {
  if (!iso) {
    return '';
  }
  const data = new Date(iso);
  if (isNaN(data.getTime())) {
    return iso;
  }
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatarNota(nota?: number | null): string {
  return nota == null ? '–' : nota.toFixed(1);
}