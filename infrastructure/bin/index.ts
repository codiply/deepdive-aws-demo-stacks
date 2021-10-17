#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { Config, getConfig } from '../lib/config/config'

const app = new cdk.App();
let environmentName = app.node.tryGetContext('config');

const config: Config = getConfig(environmentName, './config/');
const env  = { account: config.Deployment.AWSAccountID, region: config.Deployment.AWSRegion };