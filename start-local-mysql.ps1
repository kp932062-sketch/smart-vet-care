$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$mysqlBin = 'C:\Program Files\MySQL\MySQL Server 8.0\bin'
$mysqld = Join-Path $mysqlBin 'mysqld.exe'
$mysql = Join-Path $mysqlBin 'mysql.exe'
$port = 3310
$dataDir = Join-Path $root 'local-mysql\data-3310'
$logDir = Join-Path $root 'runtime-logs'
$pidFile = Join-Path $root 'local-mysql\mysqld-3310.pid'
$errorLog = Join-Path $logDir 'local-mysql-3310-error.log'

if (-not (Test-Path $mysqld)) {
  throw "mysqld.exe not found at $mysqld"
}

if (-not (Test-Path $mysql)) {
  throw "mysql.exe not found at $mysql"
}

New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
New-Item -ItemType Directory -Path $logDir -Force | Out-Null

# Initialize the local instance once.
$mysqlSystemDir = Join-Path $dataDir 'mysql'
if (-not (Test-Path $mysqlSystemDir)) {
  & $mysqld --initialize-insecure --datadir="$dataDir" --console | Out-Null
}

$listening = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if (-not $listening) {
  $args = @(
    "--datadir=$dataDir"
    "--port=$port"
    "--bind-address=127.0.0.1"
    "--pid-file=$pidFile"
    "--log-error=$errorLog"
  )
  Start-Process -FilePath $mysqld -ArgumentList $args -WindowStyle Hidden | Out-Null
  Start-Sleep -Seconds 6
}

$listening = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if (-not $listening) {
  throw "Local MySQL failed to start on port $port."
}

# Ensure app database and dedicated user exist.
& $mysql -h 127.0.0.1 -P $port -u root -e @"
CREATE DATABASE IF NOT EXISTS smartvet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'smartvet_user'@'127.0.0.1' IDENTIFIED BY 'SmartVetDB@123';
CREATE USER IF NOT EXISTS 'smartvet_user'@'localhost' IDENTIFIED BY 'SmartVetDB@123';
ALTER USER 'smartvet_user'@'127.0.0.1' IDENTIFIED BY 'SmartVetDB@123';
ALTER USER 'smartvet_user'@'localhost' IDENTIFIED BY 'SmartVetDB@123';
GRANT ALL PRIVILEGES ON smartvet.* TO 'smartvet_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON smartvet.* TO 'smartvet_user'@'localhost';
FLUSH PRIVILEGES;
"@ | Out-Null

Write-Output "Local MySQL ready on 127.0.0.1:$port"
