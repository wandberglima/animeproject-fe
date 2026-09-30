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
  /** Idioma realmente entregue. Difere do pedido quando o provider não tinha dublagem. */
  idioma?: 'sub' | 'dub' | null;
}