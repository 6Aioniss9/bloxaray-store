param(
  [switch]$Log = $false
)

$botDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$logFile = Join-Path $botDir "bot.log"

Write-Host "Iniciando BloxAray Bot..." -ForegroundColor Cyan

if ($Log) {
  $job = Start-Job -Name "BloxArayBot" -ScriptBlock {
    param($dir, $log)
    Set-Location $dir
    npx tsx src/index.ts *>&1 | Out-File -FilePath $log -Append
  } -ArgumentList $botDir, $logFile

  Write-Host "Bot iniciado en background (Job ID: $($job.Id))" -ForegroundColor Green
  Write-Host "Logs: $logFile" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "Comandos:" -ForegroundColor Yellow
  Write-Host "  Get-Job -Name BloxArayBot     # Ver estado" -ForegroundColor Gray
  Write-Host "  Receive-Job -Name BloxArayBot  # Ver logs recientes" -ForegroundColor Gray
  Write-Host "  Stop-Job -Name BloxArayBot     # Detener" -ForegroundColor Gray
} else {
  Write-Host "Ejecutando en primer plano. Presiona Ctrl+C para detener." -ForegroundColor Yellow
  Set-Location $botDir
  npx tsx src/index.ts
}

Write-Host "Bot detenido." -ForegroundColor Red
