$ErrorActionPreference = 'Stop'

$item = Get-Item -LiteralPath $env:BUREAU_RELEASE_EXE
$signature = Get-AuthenticodeSignature -LiteralPath $env:BUREAU_RELEASE_EXE

[pscustomobject]@{
    ProductName = $item.VersionInfo.ProductName
    FileDescription = $item.VersionInfo.FileDescription
    SignatureStatus = $signature.Status.ToString()
    Signer = if ($signature.SignerCertificate) { $signature.SignerCertificate.Subject } else { $null }
} | ConvertTo-Json -Compress
