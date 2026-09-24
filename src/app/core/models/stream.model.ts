export interface LegendaStream {
  idioma: string;
  rotulo: string;
  url: string;
}

export interface StreamInfo {
  url: string;
  tipo: 'HLS' | 'MP4';
  qualidade?: string;
  legendas?: LegendaStream[];
  provedor?: string;
}