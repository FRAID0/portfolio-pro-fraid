param(
  [string]$InputsPath = (Join-Path $PSScriptRoot "inputs.json")
)

$scripts = @(
  "collect-local.ps1",
  "collect-render.ps1",
  "collect-vercel.ps1",
  "collect-dns-tls.ps1",
  "collect-headers.ps1"
)

foreach ($s in $scripts) {
  $p = Join-Path $PSScriptRoot $s
  if (Test-Path -LiteralPath $p) {
    Write-Output "==> $s"
    & $p -InputsPath $InputsPath
  } else {
    Write-Warning "Missing script: $p"
  }
}

