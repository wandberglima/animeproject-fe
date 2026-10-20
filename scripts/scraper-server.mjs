// Sobe o agregador self-hosted (anime-sdk) na porta 3001, usado pela API para resolver
// streams dos providers. Fica neste repositorio para que o lançamento seja reproduzivel:
// antes o runner vivia apenas em uma pasta temporaria e sumia entre sessoes.
//
// A pasta do SDK pode ser trocada por env:
//   ANIME_SDK_DIST=C:\caminho\anime-sdk\dist\index.js
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const sdkDist = process.env.ANIME_SDK_DIST
  ? resolve(process.env.ANIME_SDK_DIST)
  : resolve(aqui, '..', '..', 'anime-sdk', 'dist', 'index.js');

const sdk = await import(pathToFileURL(sdkDist).href);

const {
  AnimeParadiseProvider,
  AnikotoProvider,
  GogoanimeProvider,
  GoyabuProvider,
  MegaPlayProvider,
  HianimeProvider,
  AllmangaProvider,
  MangadexProvider,
  WeebcentralProvider,
  MangapillProvider,
  AnilistMeta,
  MalMeta,
  KitsuMeta,
  MappingClient,
  startServer,
  HttpClient,
  FetchTransport,
} = sdk;

const cacheStore = new Map();
const cache = {
  get: async (key) => cacheStore.get(key),
  set: async (key, value) => {
    cacheStore.set(key, value);
  },
};

// 502/503 sao instabilidade momentanea dos providers; vale a pena repetir antes de desistir.
class RetryTransport {
  constructor(base) {
    this.base = base;
  }
  async fetch(url, init) {
    let ultimoErro;
    for (let tentativa = 0; tentativa < 4; tentativa++) {
      try {
        const res = await this.base.fetch(url, init);
        if (res && res.status !== undefined && ![502, 503].includes(res.status)) {
          return res;
        }
      } catch (e) {
        ultimoErro = e;
      }
    }
    if (ultimoErro) throw ultimoErro;
    return this.base.fetch(url, init);
  }
}

const httpClient = new HttpClient({
  timeoutMs: 30000,
  transport: new RetryTransport(new FetchTransport()),
});

const mapping = new MappingClient(httpClient, {
  disableAnify: true,
  disableArmServer: true,
});

const server = startServer({
  providers: [
    new GogoanimeProvider(httpClient),
    new GoyabuProvider(httpClient),
    new AllmangaProvider(httpClient),
    new AnimeParadiseProvider(httpClient),
    new AnikotoProvider(httpClient),
    new MegaPlayProvider(httpClient),
    new HianimeProvider(httpClient),
    new MangadexProvider(httpClient),
    new WeebcentralProvider(httpClient),
    new MangapillProvider(httpClient),
  ],
  metaProviders: [
    new AnilistMeta(httpClient, { mappingClient: mapping }),
    new MalMeta(httpClient, { mappingClient: mapping }),
    new KitsuMeta(httpClient, { mappingClient: mapping }),
  ],
  port: Number(process.env.PORT || 3001),
  proxy: false,
  cache,
});

server.once('listening', () => {
  console.log('anime-sdk local pronto na porta', server.address()?.port);
});
