#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { Config, getConfig } from '../lib/config/config'
import { S3ObjectLambdaZipArchiveStack } from '../lib/stacks/s3-object-lambda-zip-archive-stack';

const app = new cdk.App();
let environmentName = app.node.tryGetContext('config');

const config: Config = getConfig(environmentName, './config/');
const env  = { account: config.Deployment.AWSAccountID, region: config.Deployment.AWSRegion };

new S3ObjectLambdaZipArchiveStack(app, `${config.Deployment.Prefix}-s3-object-lambda-zip-archive`, config.Deployment, {env: env});