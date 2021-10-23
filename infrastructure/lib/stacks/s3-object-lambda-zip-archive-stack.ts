import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import { DeploymentConfig } from '../config/deployment-config';
import { S3ObjectLambdaZipArchive } from '../constructs/s3-object-lambda-zip-archive';

export class S3ObjectLambdaZipArchiveStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, deployment: DeploymentConfig, props?: cdk.StackProps) {
    super(scope, id, props);

    const s3Bucket = new s3.Bucket(this, 's3-bucket', {
      bucketName: `${deployment.Prefix}-s3-object-lambda-zip-archive-${cdk.Aws.ACCOUNT_ID}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });
    
    new s3deploy.BucketDeployment(this, 's3-deployment', {
      sources: [s3deploy.Source.asset('./assets/s3-object-lambda-zip-archive/bucket-content')],
      destinationBucket: s3Bucket,
      prune: true,
      retainOnDelete: false
    });

    new S3ObjectLambdaZipArchive(this, 's3-object-lambda-zip-archive', {
      prefix: deployment.Prefix,
      s3Bucket: s3Bucket
    });
  }
}
