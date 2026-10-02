import { codigoIdioma, ehPortuguesBrasileiro, pesoIdioma } from './idioma-legenda';

describe('idioma-legenda', () => {
  describe('ehPortuguesBrasileiro', () => {
    it('reconhece as grafias que o provider usa para pt-BR', () => {
      expect(ehPortuguesBrasileiro('pt-BR')).toBeTrue();
      expect(ehPortuguesBrasileiro('Portuguese (Brazil)')).toBeTrue();
      expect(ehPortuguesBrasileiro('português do brasil')).toBeTrue();
      expect(ehPortuguesBrasileiro('Brazilian Portuguese')).toBeTrue();
    });

    it('nao confunde portugues generico com pt-BR', () => {
      // "portuguese" sozinho vale menos que pt-BR: o provider brasileiro entrega pt-BR, mas a
      // distincao mantem a preferencia correta caso ele passe a informar o pais.
      expect(ehPortuguesBrasileiro('portuguese')).toBeFalse();
      expect(ehPortuguesBrasileiro('Portuguese 2')).toBeFalse();
    });

    it('ignora as outras linguas', () => {
      expect(ehPortuguesBrasileiro('english')).toBeFalse();
      expect(ehPortuguesBrasileiro('English')).toBeFalse();
      expect(ehPortuguesBrasileiro('spanish')).toBeFalse();
      expect(ehPortuguesBrasileiro('')).toBeFalse();
    });

    it('nao casa por substring dentro de outra palavra', () => {
      // "bulgarian" contem as letras de "br" no inicio; sem checagem de palavra inteira a legenda
      // bulgaria seria escolhida como se fosse pt-BR.
      expect(ehPortuguesBrasileiro('bulgarian')).toBeFalse();
      expect(ehPortuguesBrasileiro('german')).toBeFalse();
    });

    it('nao trata "breton" como portugues do Brasil', () => {
      // "breton" comeca com "br": e o caso em que a sigla precisa ser comparada como palavra
      // inteira, e nao como substring.
      expect(ehPortuguesBrasileiro('breton')).toBeFalse();
      expect(pesoIdioma('breton')).toBe(1);
    });

    it('trata a numeracao do provider como parte do rotulo, nao do nome', () => {
      // "Portuguese 2" nao informa o pais: vale como portugues, nao como pt-BR explicito. Sem
      // essa distincao ele ordenaria acima de "pt-BR", que e o que o usuario pediu primeiro.
      expect(ehPortuguesBrasileiro('Portuguese 2')).toBeFalse();
      expect(pesoIdioma('Portuguese 2')).toBe(2);
      expect(ehPortuguesBrasileiro('spanish 2')).toBeFalse();
      expect(codigoIdioma('Portuguese 2')).toBe('pt');
      expect(codigoIdioma('spanish 2')).toBe('es');
    });
  });

  describe('pesoIdioma', () => {
    it('ordena pt-BR acima de portugues, que fica acima das demais', () => {
      expect(pesoIdioma('pt-BR')).toBeGreaterThan(pesoIdioma('portuguese'));
      expect(pesoIdioma('portuguese')).toBeGreaterThan(pesoIdioma('english'));
    });
  });

  describe('codigoIdioma', () => {
    it('converte a grafia livre do provider em BCP-47 para o <track>', () => {
      expect(codigoIdioma('pt-BR')).toBe('pt-BR');
      expect(codigoIdioma('Portuguese (Brazil)')).toBe('pt-BR');
      expect(codigoIdioma('portuguese')).toBe('pt');
      expect(codigoIdioma('english')).toBe('en');
      expect(codigoIdioma('English')).toBe('en');
      expect(codigoIdioma('spanish 2')).toBe('es');
    });

    it('cai para und quando nao da para advinhar, em vez de gerar tag invalida', () => {
      // O HTML so aceita BCP-47: um rotulo livre faria o navegador recusar a faixa inteira.
      expect(codigoIdioma('')).toBe('und');
      expect(codigoIdioma('Klingon')).toBe('und');
    });
  });
});
