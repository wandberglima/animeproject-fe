export interface BuscaExternaItem {
  provider: string;
  mediaId: string;
  titulo: string;
  capa?: string;
  ano?: number;
}

export interface BuscaAgregada {
  locais: unknown[];
  externos: BuscaExternaItem[];
}