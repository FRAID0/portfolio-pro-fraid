param(
  [string]$InputsPath = (Join-Path $PSScriptRoot "inputs.json"),
  [string]$OutDir = (Join-Path $PSScriptRoot "out")
)

. (Join-Path $PSScriptRoot "utils.ps1")

Ensure-OutDir -OutDir $OutDir
$inputs = Read-DiagnosticsInputs -Path $InputsPath

$apiKey = $env:RENDER_API_KEY
if (-not $apiKey) {
  $out = @{
    ok = $false
    error = "Missing RENDER_API_KEY env var"
    hint = "Export RENDER_API_KEY in your shell session (do not commit it)."
  }
  Write-Json -Object $out -Path (Join-Path $OutDir "deployments-render.json")
  Write-Output "Wrote: $(Join-Path $OutDir 'deployments-render.json')"
  exit 0
}

$headers = @{ Authorization = "Bearer $apiKey" }

function Get-RenderDeploys {
  param([string]$serviceId)
  if (-not $serviceId -or $serviceId -eq "<render-backend-service-id>") { return @() }

  # Render API is expected to expose deploys per service.
  # If your account/API differs, update this endpoint accordingly.
  $url = "https://api.render.com/v1/services/$serviceId/deploys?limit=10"
  try {
    $resp = Invoke-JsonApi -Method "GET" -Url $url -Headers $headers
    return @{ ok = $true; url = $url; deploys = $resp }
  } catch {
    return @{ ok = $false; url = $url; error = $_.Exception.Message }
  }
}

$result = [ordered]@{
  timestamp = (Get-Date).ToString("o")
  backendServiceId = $inputs.render.backendServiceId
  frontendServiceId = $inputs.render.frontendServiceId
  backend = (Get-RenderDeploys -serviceId $inputs.render.backendServiceId)
  frontend = (Get-RenderDeploys -serviceId $inputs.render.frontendServiceId)
}

Write-Json -Object $result -Path (Join-Path $OutDir "deployments-render.json")
Write-Output "Wrote: $(Join-Path $OutDir 'deployments-render.json')"

