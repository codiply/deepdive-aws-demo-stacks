import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3objectlambda from '@aws-cdk/aws-s3objectlambda';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';
import { PythonFunction } from '@aws-cdk/aws-lambda-python';

export interface S3ObjectLambdaZipArchiveProps {
  readonly prefix: string;
  readonly s3Bucket: s3.Bucket;
}

export class S3ObjectLambdaZipArchive extends cdk.Construct {
  private readonly props: S3ObjectLambdaZipArchiveProps;

  constructor(
    scope: cdk.Construct, 
    id: string, 
    props: S3ObjectLambdaZipArchiveProps) {
    super(scope, id);

    this.props = props;

    const standardAccessPoint = new s3.CfnAccessPoint(this, 'standard-access-point', {
      name: `${props.prefix}-zip-archive-standard-access-point`,
      bucket: props.s3Bucket.bucketName
    });

    this.updateS3BucketPolicy(standardAccessPoint);
    
    const objectLambdaFunction = new PythonFunction(this, 'object-lambda-function', {
      functionName: `${props.prefix}-object-lambda-zip-archive`,
      entry: `./assets/s3-object-lambda-zip-archive/lambda-function`,
      runtime: lambda.Runtime.PYTHON_3_8,
      index: 'lambda-handler.py',
      handler: 'main',
      role: this.defineLambdaExecutionRole(standardAccessPoint),
      environment: {
        'ACCOUNT_ID': cdk.Aws.ACCOUNT_ID,
        'ACCESS_POINT_ALIAS': standardAccessPoint.attrAlias
      }
    });

    const objectLambdaAccessPoint = new s3objectlambda.CfnAccessPoint(this, 's3-object-lambda-access-point', {
      name: `${props.prefix}-zip-archive-object-lambda`,
      objectLambdaConfiguration: {
        supportingAccessPoint: standardAccessPoint.attrArn,
        transformationConfigurations: [{
          actions: [
            "GetObject"
          ],
          contentTransformation: {
            "AwsLambda":{
              "FunctionArn": objectLambdaFunction.functionArn 
            }
          }
        }],
        cloudWatchMetricsEnabled: true
      }
    });
  }

  private updateS3BucketPolicy(accessPoint: s3.CfnAccessPoint): void {
    this.props.s3Bucket.addToResourcePolicy(new iam.PolicyStatement({
      principals: [
        new iam.ArnPrincipal("*")
      ],
      effect: iam.Effect.ALLOW,
      actions: [
        's3:List*',
        's3:Get*'
      ],
      resources: [
        this.props.s3Bucket.bucketArn,
        this.props.s3Bucket.arnForObjects("*")
      ],
      conditions: {
        'StringLike': {
          's3:DataAccessPointArn': accessPoint.attrArn
        }
      }
    }));
  }

  private defineLambdaExecutionRole(accessPoint: s3.CfnAccessPoint): iam.Role {
    const role = new iam.Role(this,'lambda-execution-role', {
      path:'/service-role/',
      roleName: `${this.props.prefix}-s3-object-lambda-zip-archive-role`,
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    });
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'));
    role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:List*',
        's3:Get*'
      ],
      resources: [
        accessPoint.attrArn,
        `${accessPoint.attrArn}/object/*`
      ]  
    }));
    role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3-object-lambda:WriteGetObjectResponse'
      ],
      resources: [
        '*'
      ]    
    }));
    return role;
  }
}