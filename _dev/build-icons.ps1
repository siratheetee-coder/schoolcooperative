# Build app icons from logo.png (1024x1024 universal cooperative logo)
# Logo already has green background + rounded corners → just resize for "any" purpose
# Maskable variants: place on solid green square with safe-zone padding
#
# Usage: from repo root run:  powershell -ExecutionPolicy Bypass -File _dev/build-icons.ps1

Add-Type -AssemblyName System.Drawing

$bgColor = [System.Drawing.ColorTranslator]::FromHtml("#2D7D6F")
$logoPath = Join-Path (Get-Location) "logo.png"
if (-not (Test-Path $logoPath)) { Write-Error "logo.png not found in $(Get-Location)"; exit 1 }
$source = [System.Drawing.Bitmap]::new($logoPath)
Write-Host "Source: logo.png  $($source.Width) x $($source.Height)"

# Simple resize — keeps logo as-is including its built-in rounded corners
function Resize-Logo($outName, $size) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'AntiAlias'
    $g.InterpolationMode = 'HighQualityBicubic'
    $g.PixelOffsetMode = 'HighQuality'
    $g.DrawImage($source, 0, 0, $size, $size)
    $outPath = Join-Path (Get-Location) $outName
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
    Write-Host "  -> $outName ($size x $size)"
}

# Maskable — solid green square, logo centered at 80% (safe zone)
function Make-Maskable($outName, $size) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'AntiAlias'
    $g.InterpolationMode = 'HighQualityBicubic'
    $g.PixelOffsetMode = 'HighQuality'

    $brush = New-Object System.Drawing.SolidBrush $bgColor
    $g.FillRectangle($brush, 0, 0, $size, $size)
    $brush.Dispose()

    $logoSize = [int]($size * 0.80)
    $offset   = [int](($size - $logoSize) / 2)
    $g.DrawImage($source, $offset, $offset, $logoSize, $logoSize)

    $outPath = Join-Path (Get-Location) $outName
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
    Write-Host "  -> $outName ($size x $size) [maskable]"
}

# any-purpose icons
Resize-Logo "favicon-96x96.png" 96
Resize-Logo "apple-touch-icon.png" 180
Resize-Logo "web-app-manifest-192x192.png" 192
Resize-Logo "web-app-manifest-512x512.png" 512
Resize-Logo "logo-no-bg.png" 512  # used in app UI/landing

# maskable icons (Android adaptive — fills full square, logo in 80% safe zone)
Make-Maskable "web-app-manifest-192x192-maskable.png" 192
Make-Maskable "web-app-manifest-512x512-maskable.png" 512

$source.Dispose()
Write-Host "Done."
