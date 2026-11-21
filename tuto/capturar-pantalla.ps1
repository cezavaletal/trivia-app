<#
.SYNOPSIS
    Script para capturar pantallas de la ventana activa o pantalla completa de Google Antigravity.
    Guarda automáticamente las capturas en tuto\img\ con fecha y hora.
.DESCRIPTION
    Ejecuta este script o haz doble clic en 'capturar-pantalla.bat' desde tu escritorio Windows
    mientras estás usando Antigravity para capturar el IDE y que aparezca en la documentación de la charla.
#>

param (
    [string]$Nombre = "captura_ide"
)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$imgDir = Join-Path $PSScriptRoot "img"
if (-not (Test-Path $imgDir)) {
    New-Item -ItemType Directory -Path $imgDir -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$fileName = "${Nombre}_${timestamp}.png"
$fullPath = Join-Path $imgDir $fileName

$screen = [System.Windows.Forms.Screen]::PrimaryScreen
$bounds = $screen.Bounds
$bitmap = New-Object System.Drawing.Bitmap($bounds.Width, $bounds.Height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

$graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
$bitmap.Save($fullPath, [System.Drawing.Imaging.ImageFormat]::Png)

$graphics.Dispose()
$bitmap.Dispose()

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " [OK] Captura de pantalla guardada con exito:" -ForegroundColor Cyan
Write-Host "      $fullPath" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green
