const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  // Use powershell script file to extract
  const psScript = `
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zipPath = "h:\\._HK32526\\CT499\\3mienres\\B2306614_NguyenHoangHao_DoAn.docx"
    $zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
    $entry = $zip.GetEntry("word/document.xml")
    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $xml = $reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    $zip.Dispose()
    
    # Extract paragraphs
    $paragraphs = [regex]::Matches($xml, '<w:p\b[^>]*>(.*?)</w:p>') | ForEach-Object {
        $p = $_.Groups[1].Value
        $texts = [regex]::Matches($p, '<w:t\b[^>]*>(.*?)</w:t>') | ForEach-Object { $_.Groups[1].Value }
        -join $texts
    }
    $paragraphs | Out-File -FilePath "extracted_paragraphs.txt" -Encoding utf8
  `;
  fs.writeFileSync('temp_extract.ps1', psScript, 'utf8');
  execSync('powershell -ExecutionPolicy Bypass -File temp_extract.ps1');
  if (fs.existsSync('temp_extract.ps1')) fs.unlinkSync('temp_extract.ps1');
  console.log('Successfully extracted document paragraphs to extracted_paragraphs.txt');
} catch (err) {
  console.error('Error:', err);
}
