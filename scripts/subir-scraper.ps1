# Sobe o agregador (anime-sdk) na porta 3001, sem janela e sem console.
#
# Por que existe: a API resolve streams por este servico. Se ele estiver fora do ar, a varredura
# de cobertura marca todo o catalogo como indisponivel (anime sai das listas). Subir o scraper
# antes da API no lancamento evita esse apagao.
#
# Uso:
#   powershell -ExecutionPolicy Bypass -File .\scripts\subir-scraper.ps1
param(
    [int]$Porta = 3001,
    [string]$Log = "C:\Users\WANDBE~1\AppData\Local\Temp\opencode\scraper.log"
)

$ErrorActionPreference = "Stop"

$raiz = Split-Path -Parent $PSScriptRoot
$runner = Join-Path $PSScriptRoot "scraper-server.mjs"

if (Get-NetTCPConnection -LocalPort $Porta -State Listen -ErrorAction SilentlyContinue) {
    "scraper ja esta no ar (porta $Porta)"
    exit 0
}

$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) {
    "ERRO: node nao encontrado no PATH"
    exit 1
}

if (-not (Test-Path $runner)) {
    "ERRO: runner nao encontrado em $runner"
    exit 1
}

$env:PORT = "$Porta"
$p = Start-Process -FilePath $node -ArgumentList $runner `
    -WorkingDirectory $raiz -WindowStyle Hidden -PassThru `
    -RedirectStandardOutput $Log -RedirectStandardError "$Log.err"

$limite = (Get-Date).AddSeconds(60)
while ((Get-Date) -lt $limite) {
    Start-Sleep -Seconds 3
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:$Porta/health" -TimeoutSec 8 -UseBasicParsing
        if ($r.StatusCode -eq 200) {
            "scraper respondendo 200 (node pid $($p.Id))"
            exit 0
        }
    } catch {}
}
"ERRO: scraper nao respondeu em 60s; veja $Log"
exit 1
