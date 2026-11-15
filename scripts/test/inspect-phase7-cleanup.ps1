# READ-ONLY inventory. No disable, delete, elevation or cleanup command is present.
$ErrorActionPreference='Stop'
$records=@();$sources=@()
foreach($file in (Get-ChildItem -LiteralPath $env:TEMP -Filter 'lapis-phase7-*-created.json' -File)){
  if($file.Name -notmatch '^lapis-phase7-(auth|browser|content|db|files|full|release)-created\.json$'){throw 'Unexpected metadata filename'}
  $sources+=@{path=$file.FullName;sha256=(Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()}
  foreach($item in @(Get-Content -LiteralPath $file.FullName -Raw|ConvertFrom-Json)){
    if($item.Database -notmatch '^lapis_test_([a-f0-9]{16})$'){throw 'Invalid database metadata'}
    $suffix=$Matches[1]
    if($item.Login -cne ('lapis_test_login_'+$suffix)){throw 'Test principal/database suffix mismatch'}
    $records+=@{database=$item.Database;login=$item.Login;metadata=$file.FullName}
  }
}
$records=@($records|Sort-Object {$_.login} -Unique)
$connection=New-Object System.Data.SqlClient.SqlConnection 'Server=.\SQLEXPRESS;Database=master;Integrated Security=True;Connect Timeout=5;Encrypt=True;TrustServerCertificate=True'
try{
  $connection.Open()
  foreach($item in $records){
    $command=$connection.CreateCommand()
    $command.CommandText='SELECT p.is_disabled,p.create_date,CASE WHEN DB_ID(@database) IS NULL THEN 0 ELSE 1 END AS database_present FROM sys.sql_logins p WHERE p.name=@login;'
    [void]$command.Parameters.Add('@login',[System.Data.SqlDbType]::NVarChar,128);$command.Parameters['@login'].Value=$item.login
    [void]$command.Parameters.Add('@database',[System.Data.SqlDbType]::NVarChar,128);$command.Parameters['@database'].Value=$item.database
    $reader=$command.ExecuteReader()
    if($reader.Read()){$item.present=$true;$item.disabled=[bool]$reader['is_disabled'];$item.created=$reader['create_date'].ToString('s');$item.databasePresent=[bool]$reader['database_present']}
    else{$item.present=$false;$item.disabled=$null;$item.databasePresent=$null}
    $reader.Close();$command.Dispose()
  }
}finally{$connection.Dispose()}
$credentials=@()
foreach($file in (Get-ChildItem -LiteralPath $env:TEMP -Filter 'lapis-phase7-*-test-env.json' -File)){
  if($file.Name -notmatch '^lapis-phase7-(auth|browser|content|db|files|full|release)-test-env\.json$'){throw 'Unexpected credential filename'}
  # Read only the identities for verification; NEVER output the settings object or secrets.
  $settings=Get-Content -LiteralPath $file.FullName -Raw|ConvertFrom-Json
  $matched=@($records|Where-Object {$_.login -ceq $settings.SQL_USER -and $_.database -ceq $settings.SQL_DATABASE})
  if($settings.SQL_ENV -ne 'test' -or $settings.SQL_SERVER -ne 'localhost' -or $matched.Count -ne 1){throw 'Credential target is not verified disposable local metadata'}
  $credentials+=@{path=$file.FullName;database=$settings.SQL_DATABASE;login=$settings.SQL_USER;protectedAcl=(Get-Acl -LiteralPath $file.FullName).AreAccessRulesProtected}
  $settings=$null
}
$report=@{date='2026-11-12';status='BLOCKED';instance='.\SQLEXPRESS';readOnly=$true;metadata=$sources;targets=$records;credentialFiles=$credentials;
  approvalPolicy='never';narrowerApprovalToolAvailable=$false;cleanupAttemptedThisCorrection=$false;
  reason='Prior cleanup was rejected: blocked by policy. No authorized approval-request mechanism is available; no mutation retried.'}
$destination=Join-Path $PSScriptRoot '../../docs/backend/evidence/phase7-corrections/cleanup-inventory.json'
[void][IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName([IO.Path]::GetFullPath($destination)))
[IO.File]::WriteAllText([IO.Path]::GetFullPath($destination),($report|ConvertTo-Json -Depth 8))
Write-Output (@{verifiedLocalTargets=$records.Count;credentialFiles=$credentials.Count;readOnly=$true;cleanup='BLOCKED'}|ConvertTo-Json -Compress)
