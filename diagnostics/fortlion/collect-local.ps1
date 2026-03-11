param(
  [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\\..")).Path,
  [string]$OutDir = (Join-Path $PSScriptRoot "out"),
  [string]$InputsPath = (Join-Path $PSScriptRoot "inputs.json")
)

. (Join-Path $PSScriptRoot "utils.ps1")

Ensure-OutDir -OutDir $OutDir

$result = [ordered]@{
  timestamp = (Get-Date).ToString("o")
  repoRoot = $RepoRoot
  git = @{}
  envKeys = @{}
  repoFindings = @()
}

try {
  $safeDir = ($RepoRoot -replace '\\\\','/')
  $gitBranch = (& git -c "safe.directory=$safeDir" -C $RepoRoot rev-parse --abbrev-ref HEAD) 2>$null
  $gitSha = (& git -c "safe.directory=$safeDir" -C $RepoRoot rev-parse HEAD) 2>$null
  $result.git = @{
    branch = ($gitBranch | Select-Object -First 1)
    sha = ($gitSha | Select-Object -First 1)
  }
} catch {
  $result.git = @{ error = "git not available or repo not trusted"; details = $_.Exception.Message }
}

$backendEnv = Join-Path $RepoRoot "backend\\.env"
if (Test-Path -LiteralPath $backendEnv) {
  $keys = Get-Content -LiteralPath $backendEnv |
    Where-Object { $_ -match '^[A-Za-z_][A-Za-z0-9_]*=' } |
    ForEach-Object { ($_ -split '=')[0] } |
    Sort-Object -Unique
  $result.envKeys.backend = $keys
} else {
  $result.envKeys.backend = @()
}

$frontEnv = Join-Path $RepoRoot "frontend\\.env.local"
if (Test-Path -LiteralPath $frontEnv) {
  $keys = Get-Content -LiteralPath $frontEnv |
    Where-Object { $_ -match '^[A-Za-z_][A-Za-z0-9_]*=' } |
    ForEach-Object { ($_ -split '=')[0] } |
    Sort-Object -Unique
  $result.envKeys.frontend = $keys
} else {
  $result.envKeys.frontend = @()
}

# Repo-only findings (no secrets)
$serverPath = Join-Path $RepoRoot "backend\\server.js"
if (Test-Path -LiteralPath $serverPath) {
  $server = Get-Content -LiteralPath $serverPath -Raw
  if ($server -match 'rejectUnauthorized\s*:\s*false') {
    $result.repoFindings += @{
      id = "P0.smtp_tls_disabled"
      severity = "P0"
      file = "backend/server.js"
      note = "Nodemailer TLS verification is disabled (rejectUnauthorized:false)."
    }
  }
  if ($server -match 'origin\s*:\s*\[') {
    $result.repoFindings += @{
      id = "P1.cors_hardcoded"
      severity = "P1"
      file = "backend/server.js"
      note = "CORS origins are hardcoded; prod/stage likely need env-based config."
    }
  }
}

$promCfg = Join-Path $RepoRoot "infra\\prometheus.yml"
if (Test-Path -LiteralPath $promCfg) {
  $result.repoFindings += @{
    id = "P1.prometheus_metrics_gap"
    severity = "P1"
    file = "infra/prometheus.yml"
    note = "Prometheus scrapes backend but /metrics endpoint is not implemented in backend."
  }
}

Write-Json -Object $result -Path (Join-Path $OutDir "local.json")
Write-Output "Wrote: $(Join-Path $OutDir 'local.json')"
