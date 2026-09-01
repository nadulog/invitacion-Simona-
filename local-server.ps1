param(
  [int]$Port = 5180,
  [string]$BindAddress = '127.0.0.1'
)

$root = [System.IO.Path]::GetFullPath($PSScriptRoot)
$ipAddress = [System.Net.IPAddress]::Parse($BindAddress)
$listener = [System.Net.Sockets.TcpListener]::new($ipAddress, $Port)
$listener.Start()

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $requestLine = $reader.ReadLine()
      $headers = @{}
      while (($line = $reader.ReadLine()) -ne '') {
        if ($null -eq $line) { break }
        if ($line -match '^([^:]+):\s*(.*)$') { $headers[$matches[1].ToLowerInvariant()] = $matches[2] }
      }

      $requestPath = if ($requestLine -match '^GET\s+([^\s]+)') { $matches[1].Split('?')[0] } else { '/' }
      $requestPath = [System.Uri]::UnescapeDataString($requestPath).TrimStart('/')
      if ([string]::IsNullOrWhiteSpace($requestPath)) { $requestPath = 'index.html' }

      $file = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($root, $requestPath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)))
      $relativePath = $requestPath.Replace('\', '/').ToLowerInvariant()
      $isPublicFile = $relativePath -in @('index.html', 'styles.css', 'script.js') -or
        ($relativePath.StartsWith('assets/') -and $relativePath -match '\.(png|jpe?g|mp3|mp4)$')

      if ($isPublicFile -and $file.StartsWith($root) -and [System.IO.File]::Exists($file)) {
        $allBytes = [System.IO.File]::ReadAllBytes($file)
        $mime = switch ([System.IO.Path]::GetExtension($file).ToLowerInvariant()) {
          '.html' { 'text/html; charset=utf-8' }
          '.css'  { 'text/css; charset=utf-8' }
          '.js'   { 'application/javascript; charset=utf-8' }
          '.png'  { 'image/png' }
          '.jpg'  { 'image/jpeg' }
          '.jpeg' { 'image/jpeg' }
          '.mp4'  { 'video/mp4' }
          '.mp3'  { 'audio/mpeg' }
          default { 'application/octet-stream' }
        }
        $status = 'HTTP/1.1 200 OK'
        $bytes = $allBytes
        $extraHeaders = 'Accept-Ranges: bytes'
        if ($headers.ContainsKey('range') -and $headers['range'] -match '^bytes=(\d+)-(\d*)') {
          $start = [int64]$matches[1]
          $end = if ($matches[2]) { [Math]::Min([int64]$matches[2], $allBytes.Length - 1) } else { $allBytes.Length - 1 }
          if ($start -le $end -and $start -lt $allBytes.Length) {
            $length = [int]($end - $start + 1)
            $bytes = [byte[]]::new($length)
            [Array]::Copy($allBytes, $start, $bytes, 0, $length)
            $status = 'HTTP/1.1 206 Partial Content'
            $extraHeaders += "`r`nContent-Range: bytes $start-$end/$($allBytes.Length)"
          }
        }
        $header = "$status`r`nContent-Type: $mime`r`nContent-Length: $($bytes.Length)`r`n$extraHeaders`r`nConnection: close`r`n`r`n"
      } else {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes('404 - Archivo no encontrado')
        $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`n`r`n"
      }

      $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
      $stream.Write($headerBytes, 0, $headerBytes.Length)
      if ($requestLine -notmatch '^HEAD\s') { $stream.Write($bytes, 0, $bytes.Length) }
    } finally {
      $client.Close()
    }
  }
} finally {
  $listener.Stop()
}
