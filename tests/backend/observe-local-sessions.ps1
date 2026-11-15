param([Parameter(Mandatory=$true)][string]$TestLogin)
$ErrorActionPreference='Stop'
if($env:SQL_ENV -ne 'test' -or $env:SQL_ALLOW_TESTS -ne 'true' -or $TestLogin -notmatch '^lapis_test_login_[a-f0-9]{16}$'){exit 1}
# Local test observer only. No app diagnostic route and no hosted connection.
$connection=New-Object System.Data.SqlClient.SqlConnection 'Server=.\SQLEXPRESS;Database=master;Integrated Security=True;Connect Timeout=5;Encrypt=True;TrustServerCertificate=True'
try {
  $connection.Open();$command=$connection.CreateCommand()
  $command.CommandText="SELECT host_process_id,COUNT(*) AS connections FROM sys.dm_exec_sessions WHERE login_name=@login AND program_name=N'LAPiS-Foundation' GROUP BY host_process_id;"
  [void]$command.Parameters.Add('@login',[System.Data.SqlDbType]::NVarChar,128);$command.Parameters['@login'].Value=$TestLogin
  $reader=$command.ExecuteReader();$rows=@();while($reader.Read()){$rows+=@{processId=[int]$reader['host_process_id'];connections=[int]$reader['connections']}}
  $reader.Close();ConvertTo-Json -InputObject @($rows) -Compress
}catch{exit 1}finally{$connection.Dispose()}
