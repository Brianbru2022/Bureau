$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$outputDirectory = Join-Path (Split-Path -Parent $PSScriptRoot) 'build'
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
$bitmap = [System.Drawing.Bitmap]::new(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.Color]::Transparent)

function Brush([string]$hex) { [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml($hex)) }
function Pen([string]$hex, [float]$width) { [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml($hex), $width) }

$cream = Brush '#f4e6c2'; $teal = Brush '#2f8f95'; $paper = Brush '#fff7df'; $gold = Brush '#e0a83f'; $red = Pen '#d9644f' 20; $brown = Pen '#7e5c24' 22; $brownThin = Pen '#7e5c24' 12; $blue = Pen '#376d9b' 18; $green = Pen '#4f7457' 14; $goldPen = Pen '#b7882f' 12
$graphics.FillEllipse($cream, 20, 20, 472, 472); $graphics.DrawEllipse($brown, 20, 20, 472, 472)
$graphics.FillEllipse($teal, 64, 64, 384, 384); $graphics.DrawEllipse($goldPen, 64, 64, 384, 384)
$graphics.FillRectangle($paper, 150, 125, 212, 270); $graphics.DrawRectangle($brownThin, 150, 125, 212, 270)
$graphics.DrawLine($red, 205, 132, 205, 388)
$graphics.FillRectangle($gold, 230, 165, 95, 42); $graphics.DrawRectangle($brownThin, 230, 165, 95, 42)
$graphics.FillRectangle((Brush '#67c4c1'), 230, 239, 95, 42); $graphics.DrawRectangle($brownThin, 230, 239, 95, 42)
$graphics.FillRectangle((Brush '#376d9b'), 230, 313, 95, 42); $graphics.DrawRectangle($brownThin, 230, 313, 95, 42)
$graphics.DrawArc($green, 93, 226, 218, 220, 88, 96); $graphics.DrawArc($green, 201, 226, 218, 220, -4, 96)

$pngPath = Join-Path $outputDirectory 'icon.png'
$icoPath = Join-Path $outputDirectory 'icon.ico'
$bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
$stream = [System.IO.MemoryStream]::new(); $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png); $pngBytes = $stream.ToArray()
$file = [System.IO.File]::Open($icoPath, [System.IO.FileMode]::Create); $writer = [System.IO.BinaryWriter]::new($file)
$writer.Write([uint16]0); $writer.Write([uint16]1); $writer.Write([uint16]1)
$writer.Write([byte]0); $writer.Write([byte]0); $writer.Write([byte]0); $writer.Write([byte]0); $writer.Write([uint16]1); $writer.Write([uint16]32); $writer.Write([uint32]$pngBytes.Length); $writer.Write([uint32]22); $writer.Write($pngBytes)
$writer.Dispose(); $file.Dispose(); $stream.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
Write-Host "Generated $pngPath and $icoPath"
