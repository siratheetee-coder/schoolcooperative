# Build app icons: green bg + school logo centered
# Generates: apple-touch-icon.png (180), web-app-manifest-192x192.png, web-app-manifest-512x512.png
Add-Type -AssemblyName System.Drawing

$bgColor = [System.Drawing.ColorTranslator]::FromHtml("#2D7D6F")
$logoPath = Join-Path (Get-Location) "logo-no-bg.png"
$logo = [System.Drawing.Image]::FromFile($logoPath)

function Build-Icon($size, $outName, $scalePct) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'AntiAlias'
    $g.InterpolationMode = 'HighQualityBicubic'
    $g.PixelOffsetMode = 'HighQuality'

    # Fill background
    $brush = New-Object System.Drawing.SolidBrush $bgColor
    $g.FillRectangle($brush, 0, 0, $size, $size)

    # Compute logo size keeping aspect, fit within (size * scalePct) box
    $maxDim = $size * $scalePct
    $aspect = $logo.Width / $logo.Height
    if ($aspect -ge 1) {
        $w = $maxDim
        $h = $maxDim / $aspect
    } else {
        $h = $maxDim
        $w = $maxDim * $aspect
    }
    $x = ($size - $w) / 2
    $y = ($size - $h) / 2
    $g.DrawImage($logo, $x, $y, $w, $h)

    $brush.Dispose()
    $g.Dispose()

    $outPath = Join-Path (Get-Location) $outName
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Wrote $outName ($size x $size)"
}

# Apple touch icon — iOS auto-rounds, fills edge-to-edge; logo at 78% so it doesn't get clipped
Build-Icon 180 "apple-touch-icon.png" 0.78
# PWA manifest icons (maskable safe-zone = inner 80%; we use 70% to be safe)
Build-Icon 192 "web-app-manifest-192x192.png" 0.70
Build-Icon 512 "web-app-manifest-512x512.png" 0.70
# Favicon size (small, used by some browsers)
Build-Icon 96 "favicon-96x96.png" 0.78

$logo.Dispose()
Write-Host "Done."
