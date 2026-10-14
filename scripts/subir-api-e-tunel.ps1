# Sobe a API e o tunel do Cloudflare, e mantem o site publicado apontando para a URL nova.
#
# Por que um script: a API roda na maquina de quem desenvolve, entao o site publicado so a alcanca
# por um tunel rapido (trycloudflare.com). Esse tunel gera uma URL nova a cada reinicio, e antes a
# mao isso exigia editar o CORS, reiniciar a API e recompilar e republicar o site inteiro. Aqui a
# sequencia inteira acontece em um comando.
#
# O que ele faz, nesta ordem:
#   1. sobe a API, se a porta 8080 estiver livre;
#   2. le a URL do tunel; se o processo do cloudflared morreu ou a URL nao responde, reinicia o
#      tunel e espera a URL nova aparecer no log;
#   3. se a URL mudou, atualiza a lista de CORS e reinicia a API, senao o navegador bloqueia a
#      resposta com erro de CORS mesmo com a API no ar;
#   4. reescreve api-config.js no build e republica as paginas, para o site publicado usar a URL
#      nova sem recompilar o projeto.
#
# Nao ha segredo aqui: o token administrativo e a lista de CORS ficam em api-env.ps1, que o
# start-api.ps1 carrega e que por isso nunca e versionado.
#
# Uso:
#   powershell -ExecutionPolicy Bypass -File .\scripts\subir-api-e-tunel.ps1
#   powershell -ExecutionPolicy Bypass -File .\scripts\subir-api-e-tunel.ps1 -SemPublicar
#
# Parametros:
#   -SemPublicar   apenas sobe API e tunel; nao republica as paginas (use quando o site ainda
#                  aponta para a URL certa, ou para nao esperar o upload das 26 MB do build).

param(
    [switch]$SemPublicar
)

$ErrorActionPreference = "Stop"

# Raiz deste repositorio (a pasta scripts esta dentro dela).
$raiz = Split-Path -Parent $PSScriptRoot
$temp = Join-Path $env:TEMP "opencode"

$arquivoEnv = Join-Path $temp "api-env.ps1"
$scriptApi = Join-Path $temp "start-api.ps1"
$logTunel = Join-Path $temp "cloudflared.log"
$arquivoUrl = Join-Path $temp "tunnel-url.txt"
$logApi = Join-Path $temp "api.log"

# O executavel do cloudflared fica no perfil de quem instala; procura em vez de fixar o caminho,
# porque o nome da pasta do usuario entra no caminho.
$cloudflared = @(
    (Join-Path $env:USERPROFILE ".cloudflared\cloudflared.exe"),
    "C:\Program Files (x86)\cloudflared\cloudflared.exe",
    "cloudflared.exe"
) | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1

function Say($texto) { Write-Host $texto }

function TestarUrl($url) {
    if (-not $url) { return $false }
    try {
        $r = Invoke-WebRequest -Uri "$url/api/home" -TimeoutSec 20 -UseBasicParsing
        return $r.StatusCode -eq 200
    } catch { return $false }
}

function ApiNoAr() {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:8080/api/home" -TimeoutSec 10 -UseBasicParsing
        return $r.StatusCode -eq 200
    } catch { return $false }
}

# ─── 1. API ───────────────────────────────────────────────────────────────────

if (ApiNoAr) {
    Say "API ja responde em :8080"
} else {
    if (-not (Test-Path $scriptApi)) {
        Say "ERRO: start-api.ps1 nao esta em $temp"
        exit 1
    }
    Say "subindo a API..."
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptApi
    if (-not (ApiNoAr)) {
        Say "ERRO: a API nao respondeu. Veja $logApi"
        exit 1
    }
}

# ─── 2. Tunel ─────────────────────────────────────────────────────────────────

$url = if (Test-Path $arquivoUrl) { (Get-Content $arquivoUrl -Raw).Trim() } else { "" }
$processoTunel = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Select-Object -First 1

if ($processoTunel -and (TestarUrl $url)) {
    Say "tunel no ar: $url"
} else {
    if ($processoTunel) {
        Say "tunel existente nao responde; reiniciando..."
        Stop-Process -Id $processoTunel.Id -Force
        Start-Sleep -Seconds 3
    }
    if (-not $cloudflared) {
        Say "ERRO: cloudflared nao encontrado. Instale com: winget install Cloudflare.cloudflared"
        exit 1
    }
    Say "subindo o tunel..."
    # Os dois logs precisam ser apagados: o cloudflared escreve a URL no stderr, e um .err antigo
    # fazia o script ler a URL do tunel anterior e menulis um CORS que nao existe.
    foreach ($arquivo in @($logTunel, "$logTunel.err")) {
        if (Test-Path $arquivo) { Remove-Item $arquivo -Force }
    }
    Start-Process -FilePath $cloudflared `
        -ArgumentList "tunnel", "--url", "http://localhost:8080", "--no-autoupdate" `
        -RedirectStandardOutput $logTunel `
        -RedirectStandardError "$logTunel.err" `
        -WindowStyle Hidden

    # O cloudflared so imprime a URL depois de estabelecer o tunel, e a URL so passa a responder
    # alguns segundos depois disso. So aceitar a URL depois que ela responder evita registrar no
    # CORS um tunel que ainda nao serve nada.
    $url = ""
    $limite = (Get-Date).AddSeconds(120)
    while ((Get-Date) -lt $limite) {
        Start-Sleep -Seconds 4
        $achado = Select-String -Path "$logTunel.err", $logTunel `
            -Pattern "https://[a-z0-9-]+\.trycloudflare\.com" -ErrorAction SilentlyContinue |
            Select-Object -Last 1
        if (-not $achado) { continue }
        $candidata = ([regex]::Match($achado.Line, "https://[a-z0-9-]+\.trycloudflare\.com")).Value
        if (TestarUrl $candidata) {
            $url = $candidata
            break
        }
    }
    if (-not $url) {
        Say "ERRO: o tunel nao ficou respondendo. Veja $logTunel.err"
        exit 1
    }
    Say "tunel no ar: $url"
}

# ─── 3. CORS ──────────────────────────────────────────────────────────────────

# A URL nova so entra no CORS depois de reiniciar a API. Sem isso o navegador bloqueia a resposta.
if (Test-Path $arquivoEnv) {
    # Trabalha linha a linha em vez de regex no arquivo inteiro: o arquivo guarda o token
    # administrativo, e um -replace que nao casa falha em silencio, a API sobe com o CORS velho e o
    # problema so aparece no navegador, como CORS bloqueado, longe daqui.
    $linhas = @(Get-Content $arquivoEnv)
    $indice = -1
    for ($i = 0; $i -lt $linhas.Count; $i++) {
        if ($linhas[$i] -like "*CORS_ORIGINS*") { $indice = $i; break }
    }
    if ($indice -lt 0) {
        Say "ERRO: nao encontrei a linha CORS_ORIGINS em $arquivoEnv"
        exit 1
    }
    if ($linhas[$indice] -notlike "*$url*") {
        Say "atualizando o CORS com a URL nova..."
        # A linha e do tipo $env:CORS_ORIGINS = 'a,b,c'. Pega o que esta entre as apostrofos.
        $aspas = $linhas[$indice].Split("'")
        if ($aspas.Count -lt 2) {
            Say "ERRO: a linha CORS_ORIGINS nao tem o valor entre apostrofos: $($linhas[$indice])"
            exit 1
        }
        # Descarta a URL de tunel anterior e mantem as origens fixas.
        $fixas = @($aspas[1] -split "," | Where-Object { $_ -and $_ -notlike "*trycloudflare.com*" })
        $novas = @($fixas + $url) -join ","
        $linhas[$indice] = '$env:CORS_ORIGINS = ''' + $novas + ''''
        $linhas | Set-Content -Path $arquivoEnv

        $confere = @(Get-Content $arquivoEnv)[$indice]
        if ($confere -notlike "*$url*") {
            Say "ERRO: o CORS nao foi gravado. Segue no arquivo: $confere"
            exit 1
        }

        $javaw = Get-Process -Name "javaw" -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($javaw) { Stop-Process -Id $javaw.Id -Force; Start-Sleep -Seconds 5 }
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptApi
        if (-not (ApiNoAr)) {
            Say "ERRO: a API nao voltou depois do ajuste de CORS. Veja $logApi"
            exit 1
        }
        Say "CORS atualizado e API reiniciada"
    } else {
        Say "CORS ja lista a URL atual"
    }
} else {
    Say "AVISO: $arquivoEnv nao existe; conferindo o CORS manualmente"
}

# ─── 4. Site publicado ────────────────────────────────────────────────────────

# O Angular 17+ gera os arquivos em dist\aniprojects\browser; a pasta de fora so tem metadados do
# build. Publicar a pasta errada sobe um site sem index.html.
$dirBuild = Join-Path $raiz "dist\aniprojects\browser"
$configJs = Join-Path $dirBuild "api-config.js"

if ($SemPublicar) {
    Say "pulando a publicacao (-SemPublicar)"
} elseif (-not (Test-Path $configJs)) {
    Say "AVISO: build ausente em $dirBuild. Rode 'npm run build:prod' para publicar depois."
} else {
    Say "atualizando api-config.js e republicando as paginas..."
    @"
/*
 * Endereco da API usado pelo site publicado.
 *
 * Escrito por scripts\subir-api-e-tunel.ps1 quando o tunel do Cloudflare gera uma URL nova.
 * O padrao compilado continua em src/environments/environment.prod.ts.
 */
window.__ANIME_API_URL__ = '$url';
"@ | Set-Content -Path $configJs -Encoding utf8

    Push-Location $raiz
    try {
        & npx.cmd wrangler pages deploy dist\aniprojects\browser --project-name aniprojects --branch main --commit-dirty=true
        if ($LASTEXITCODE -ne 0) {
            Say "AVISO: a publicacao falhou (wrangler saiu com $LASTEXITCODE); o site segue com a URL antiga"
        }
    } finally {
        Pop-Location
    }
}

# ─── 5. Resumo ────────────────────────────────────────────────────────────────

Say ""
Say "pronto"
Say "  API local: http://localhost:8080"
Say "  API publica: $url"
Say "  site: https://aniprojects.pages.dev"