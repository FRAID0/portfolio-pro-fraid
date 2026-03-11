Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Read-DiagnosticsInputs {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    throw "Inputs file not found: $Path"
  }

  $raw = Get-Content -LiteralPath $Path -Raw
  return ($raw | ConvertFrom-Json)
}

function Ensure-OutDir {
  param(
    [Parameter(Mandatory = $true)]
    [string]$OutDir
  )
  if (-not (Test-Path -LiteralPath $OutDir)) {
    New-Item -ItemType Directory -Path $OutDir | Out-Null
  }
}

function Write-Json {
  param(
    [Parameter(Mandatory = $true)]$Object,
    [Parameter(Mandatory = $true)]
    [string]$Path
  )
  $dir = Split-Path -Parent $Path
  if ($dir) { Ensure-OutDir -OutDir $dir }
  ($Object | ConvertTo-Json -Depth 20) | Set-Content -LiteralPath $Path -Encoding UTF8
}

function Invoke-JsonApi {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Method,
    [Parameter(Mandatory = $true)]
    [string]$Url,
    [Parameter(Mandatory = $false)]
    [hashtable]$Headers = @{},
    [Parameter(Mandatory = $false)]
    $Body = $null
  )

  $params = @{
    Method = $Method
    Uri = $Url
    Headers = $Headers
  }
  if ($null -ne $Body) {
    $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
    $params["ContentType"] = "application/json"
  }
  return Invoke-RestMethod @params
}

