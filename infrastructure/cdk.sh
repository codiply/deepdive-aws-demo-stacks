#!/bin/bash

set -euo pipefail

AWS_PROFILE=$(cat ./config/aws-profile.txt)

aws ecr-public get-login-password --region us-east-1 --profile $AWS_PROFILE | docker login --username AWS --password-stdin public.ecr.aws

cdk --profile $AWS_PROFILE "${@}"
