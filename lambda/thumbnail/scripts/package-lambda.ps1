$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$stage = Join-Path $root ".lambda-package"
$zip = Join-Path $root "thumbnail-lambda.zip"
$node = (Get-Command node.exe -ErrorAction Stop).Source
$npmCli = Join-Path (Split-Path -Parent $node) "node_modules\npm\bin\npm-cli.js"
if (!(Test-Path -LiteralPath $npmCli)) {
  throw "Could not find npm CLI at $npmCli"
}

Remove-Item -Recurse -Force -LiteralPath $stage -ErrorAction SilentlyContinue
Remove-Item -Force -LiteralPath $zip -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $stage | Out-Null

Push-Location $root
try {
  & $node $npmCli run build

  Copy-Item -LiteralPath (Join-Path $root "package.json") -Destination $stage
  Copy-Item -LiteralPath (Join-Path $root "package-lock.json") -Destination $stage

  Push-Location $stage
  try {
    & $node $npmCli ci --omit=dev --os=linux --cpu=x64 --libc=glibc
  }
  finally {
    Pop-Location
  }

  Copy-Item -Path (Join-Path $root "dist\*") -Destination $stage -Recurse

  $sharpRuntime = Join-Path $stage "node_modules\@img\sharp-linux-x64"
  $libvipsRuntime = Join-Path $stage "node_modules\@img\sharp-libvips-linux-x64"
  if (!(Test-Path -LiteralPath $sharpRuntime)) {
    throw "Missing Sharp linux-x64 runtime package at $sharpRuntime"
  }
  if (!(Test-Path -LiteralPath $libvipsRuntime)) {
    throw "Missing Sharp linux-x64 libvips package at $libvipsRuntime"
  }

  Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $zip -Force

  Write-Host "Created $zip with Sharp linux-x64 binaries for AWS Lambda."
}
finally {
  Pop-Location
}
