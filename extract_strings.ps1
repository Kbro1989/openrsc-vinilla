$bytes = [System.IO.File]::ReadAllBytes('decompiled_jar/mudclient.class')
$text = [System.Text.Encoding]::ASCII.GetString($bytes)
$strings = $text -split '[^ -~]+' | Where-Object { $_.Length -ge 4 }
$strings | Select-Object -First 100
