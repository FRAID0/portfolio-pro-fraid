param(
  [string]$InputsPath = (Join-Path $PSScriptRoot "inputs.json"),
  [string]$OutDir = (Join-Path $PSScriptRoot "out")
)

. (Join-Path $PSScriptRoot "utils.ps1")

Ensure-OutDir -OutDir $OutDir
$inputs = Read-DiagnosticsInputs -Path $InputsPath

function Curl-HeadFollow {
  param([string]$Url)
  try {
    $raw = & curl.exe -sS -L -D - -o NUL -I $Url
    $lines = ($raw -split "`r?`n") | Where-Object { $_ -ne "" }
    # Keep only last response headers (after redirects)
    $last = @()
    foreach ($line in $lines) {
      if ($line -match '^HTTP/') { $last = @($line); continue }
      if ($last.Count -gt 0) { $last += $line }
    }
    return @{ ok = $true; finalUrl = $Url; headers = $last }
  } catch {
    return @{ ok = $false; error = $_.Exception.Message }
  }
}

function Extract-SecurityHeaders {
  param($headersLines)
  $wanted = @(
    "content-security-policy",
    "strict-transport-security",
    "x-frame-options",
    "x-content-type-options",
    "referrer-policy",
    "permissions-policy"
  )

  $map = @{}
  foreach ($w in $wanted) { $map[$w] = $null }
  foreach ($line in $headersLines) {
    foreach ($w in $wanted) {
      if ($line.ToLower().StartsWith($w + ":")) {
        $map[$w] = $line
      }
    }
  }
  return $map
}

$targets = @(
  @{ env = "prod"; url = $inputs.prod.url },
  @{ env = "stage"; url = $inputs.stage.url }
)

$result = [ordered]@{
  timestamp = (Get-Date).ToString("o")
  targets = @()
}

foreach ($t in $targets) {
  $head = Curl-HeadFollow -Url $t.url
  $sec = $null
  if ($head.ok) { $sec = Extract-SecurityHeaders -headersLines $head.headers }
  $result.targets += @{
    env = $t.env
    url = $t.url
    head = $head
    securityHeaders = $sec
  }
}

Write-Json -Object $result -Path (Join-Path $OutDir "headers.json")
Write-Output "Wrote: $(Join-Path $OutDir 'headers.json')"

