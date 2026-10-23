# Tiny static file server for local preview (supports HTTP Range for video seeking)
param([int]$Port = 5173)
$root = $PSScriptRoot
$types = @{ '.html'='text/html; charset=utf-8'; '.js'='text/javascript'; '.css'='text/css'; '.json'='application/json';
  '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.svg'='image/svg+xml'; '.webp'='image/webp';
  '.mp4'='video/mp4'; '.pdf'='application/pdf'; '.ico'='image/x-icon'; '.woff2'='font/woff2' }
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
Write-Host "Serving $root on http://localhost:$Port/"
while ($l.IsListening) {
  $ctx = $l.GetContext(); $req = $ctx.Request; $res = $ctx.Response
  try {
    $rel = [Uri]::UnescapeDataString($req.Url.AbsolutePath.TrimStart('/'))
    if ($rel -eq '' -or $rel.EndsWith('/')) { $rel += 'index.html' }
    $path = [IO.Path]::GetFullPath((Join-Path $root $rel))
    if (-not $path.StartsWith($root) -or -not (Test-Path $path -PathType Leaf)) { $res.StatusCode = 404; $res.Close(); continue }
    $ext = [IO.Path]::GetExtension($path).ToLower()
    $res.ContentType = $(if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' })
    $res.Headers.Add('Accept-Ranges', 'bytes'); $res.Headers.Add('Cache-Control', 'no-store')
    $fs = [IO.File]::OpenRead($path); $len = $fs.Length; $start = 0; $end = $len - 1
    $range = $req.Headers['Range']
    if (-not $range -and $ext -eq '.mp4') { $range = 'bytes=0-' }
    if ($range -match 'bytes=(\d*)-(\d*)') {
      if ($matches[1]) { $start = [long]$matches[1] }
      if ($matches[2]) { $end = [long]$matches[2] }
      # serve big files in 1MB chunks so one media request never blocks the server
      $end = [Math]::Min($end, $start + 1MB - 1)
      $res.StatusCode = 206; $res.Headers.Add('Content-Range', "bytes $start-$end/$len")
    }
    $res.ContentLength64 = $end - $start + 1
    $fs.Seek($start, 'Begin') | Out-Null
    $buf = New-Object byte[] 65536; $left = $end - $start + 1
    while ($left -gt 0) { $n = $fs.Read($buf, 0, [Math]::Min($buf.Length, $left)); if ($n -le 0) { break }; $res.OutputStream.Write($buf, 0, $n); $left -= $n }
    $fs.Close()
  } catch { } finally { try { $res.Close() } catch { } }
}
