import * as fs from 'fs'
import * as path from 'path';
import { DeploymentConfig, getDeploymentConfig } from './deployment-config';
import { getSection} from './utils';
const yaml = require('js-yaml');

export interface Config {
    readonly Deployment: DeploymentConfig;
}
export function getConfig(environmentName: string, configPath: string): Config
{
    let env: string = environmentName ?? 'default';

    let deploymentYaml = yaml.load(fs.readFileSync(path.resolve(configPath+env+'.deployment.yaml'), 'utf8'));
    let configYaml = yaml.load(fs.readFileSync(path.resolve(configPath+env+'.yaml'), 'utf8'));

    let config: Config = {
        Deployment: getDeploymentConfig(deploymentYaml),
    };

    return config;
}