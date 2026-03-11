param(
  [string]$InputsPath = (Join-Path $PSScriptRoot "inputs.json"),
  [string]$OutDir = (Join-Path $PSScriptRoot "out")
)

. (Join-Path $PSScriptRoot "utils.ps1")

Ensure-OutDir -OutDir $OutDir
$inputs = Read-DiagnosticsInputs -Path $InputsPath

$token = $env:VERCEL_TOKEN
if (-not $token) {
  $out = @{
    ok = $false
    error = "Missing VERCEL_TOKEN env var"
    hint = "Export VERCEL_TOKEN in your shell session (do not commit it)."
  }
  Write-Json -Object $out -Path (Join-Path $OutDir "deployments-vercel.json")
  Write-Output "Wrote: $(Join-Path $OutDir 'deployments-vercel.json')"
  exit 0
}

$teamId = $inputs.vercel.teamId
if (-not $teamId) { $teamId = $env:VERCEL_TEAM_ID }

$headers = @{ Authorization = "Bearer $token" }

function Get-VercelDeployments {
  param([string]$projectId)
  if (-not $projectId -or $projectId -like "<*") { return @{} }
  $qs = "projectId=$projectId&limit=10"
  if ($teamId) { $qs = $qs + "&teamId=$teamId" }
  $url = "https://api.vercel.com/v6/deployments?$qs"
  try {
    $resp = Invoke-JsonApi -Method "GET" -Url $url -Headers $headers
    return @{ ok = $true; url = $url; deployments = $resp }
  } catch {
    return @{ ok = $false; url = $url; error = $_.Exception.Message }
  }
}

$result = [ordered]@{
  timestamp = (Get-Date).ToString("o")
  teamId = $teamId
  prodProjectId = $inputs.vercel.prodProjectId
  stageProjectId = $inputs.vercel.stageProjectId
  prod = (Get-VercelDeployments -projectId $inputs.vercel.prodProjectId)
  stage = (Get-VercelDeployments -projectId $inputs.vercel.stageProjectId)
}

Write-Json -Object $result -Path (Join-Path $OutDir "deployments-vercel.json")
Write-Output "Wrote: $(Join-Path $OutDir 'deployments-vercel.json')"

