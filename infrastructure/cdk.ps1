$awsProfile = Get-Content .\config\aws-profile.txt -Raw

cdk --profile $awsProfile @args