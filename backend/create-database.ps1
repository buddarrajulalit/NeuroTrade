# Creates the "neurotrade" database for the Spring Boot backend.
# Run this once. Password for user "postgres" is set below (default: postgres).

$pgVersion = "17"
$psqlPath = "C:\Program Files\PostgreSQL\$pgVersion\bin\psql.exe"
$dbUser = "postgres"
$dbPassword = "postgres"
$dbName = "neurotrade"

if (-not (Test-Path $psqlPath)) {
    Write-Host "PostgreSQL not found at: $psqlPath" -ForegroundColor Red
    Write-Host "Edit this script and change `$pgVersion to your version (e.g. 16 or 15)." -ForegroundColor Yellow
    exit 1
}

$env:PGPASSWORD = $dbPassword
& $psqlPath -U $dbUser -h localhost -c "CREATE DATABASE $dbName;"
$result = $LASTEXITCODE
Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue

if ($result -eq 0) {
    Write-Host "Database '$dbName' created successfully." -ForegroundColor Green
    Write-Host "You can now run: mvn spring-boot:run" -ForegroundColor Cyan
} else {
    Write-Host "If the database already exists, that's OK. Try starting the backend: mvn spring-boot:run" -ForegroundColor Yellow
}
