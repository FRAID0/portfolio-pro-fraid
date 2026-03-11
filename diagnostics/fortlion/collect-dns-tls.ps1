param(
  [string]$InputsPath = (Join-Path $PSScriptRoot "inputs.json"),
  [string]$OutDir = (Join-Path $PSScriptRoot "out")
)

. (Join-Path $PSScriptRoot "utils.ps1")

Ensure-OutDir -OutDir $OutDir
$inputs = Read-DiagnosticsInputs -Path $InputsPath

function Resolve-Records {
  param([string]$Name)
  $out = @()
  foreach ($type in @("A","AAAA","CNAME")) {
    try {
      $records = Resolve-DnsName -Name $Name -Type $type -ErrorAction Stop
      $out += $records | ForEach-Object {
        [ordered]@{
          name = $_.Name
          type = $_.Type
          ttl = $_.TTL
          data = ($_.IPAddress, $_.NameHost) | Where-Object { $_ } | Select-Object -First 1
        }
      }
    } catch {
      # Ignore missing types; keep going
    }
  }
  return $out
}

function Curl-Head {
  param([string]$Url)
  try {
    $raw = & curl.exe -sS -D - -o NUL -I $Url
    return @{ ok = $true; headers = ($raw -split "`r?`n") }
  } catch {
    return @{ ok = $false; error = $_.Exception.Message }
  }
}

$result = [ordered]@{
  timestamp = (Get-Date).ToString("o")
  prod = @{
    domainApex = $inputs.prod.domainApex
    domainWww = $inputs.prod.domainWww
    dns = @{
      apex = (Resolve-Records -Name $inputs.prod.domainApex)
      www = (Resolve-Records -Name $inputs.prod.domainWww)
    }
    http = @{
      head_http = (Curl-Head -Url ("http://" + $inputs.prod.domainApex))
      head_https = (Curl-Head -Url ("https://" + $inputs.prod.domainApex))
      head_http_www = (Curl-Head -Url ("http://" + $inputs.prod.domainWww))
      head_https_www = (Curl-Head -Url ("https://" + $inputs.prod.domainWww))
    }
  }
  stage = @{
    domainApex = $inputs.stage.domainApex
    domainWww = $inputs.stage.domainWww
    dns = @{
      apex = (Resolve-Records -Name $inputs.stage.domainApex)
      www = (Resolve-Records -Name $inputs.stage.domainWww)
    }
    http = @{
      head_http = (Curl-Head -Url ("http://" + $inputs.stage.domainApex))
      head_https = (Curl-Head -Url ("https://" + $inputs.stage.domainApex))
      head_http_www = (Curl-Head -Url ("http://" + $inputs.stage.domainWww))
      head_https_www = (Curl-Head -Url ("https://" + $inputs.stage.domainWww))
    }
  }
}

Write-Json -Object $result -Path (Join-Path $OutDir "dns-tls.json")
Write-Output "Wrote: $(Join-Path $OutDir 'dns-tls.json')"

