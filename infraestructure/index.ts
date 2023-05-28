import { App, Stack, Environment, CfnParameter, Duration } from 'aws-cdk-lib';
import { Cors, LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { LambdaIntegration, EndpointType } from 'aws-cdk-lib/aws-apigateway';
import { AnyPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { BlockPublicAccess, Bucket, BucketAccessControl, BucketEncryption } from 'aws-cdk-lib/aws-s3';

const stackName = 'arcboats';
const env: Environment = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.REGION
};

const app = new App();

const stack = new Stack(app, 'dev', { stackName, env });

const logfilesBucket = new CfnParameter(stack, "logfilesBucket", {
    type: "String",
    description: "The name of the Amazon S3 bucket where uploaded files will be stored."});

const websiteBucket = new CfnParameter(stack, "website", {
    type: "String",
    description: "The name of the Amazon S3 bucket where webapp will be hosted."});


const logfiles = new Bucket(stack, 'LogFiles', {
    bucketName: logfilesBucket.valueAsString,
    // blockPublicAccess: BlockPublicAccess.BLOCK_ACLS,
    accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
    encryption: BucketEncryption.S3_MANAGED,
    enforceSSL: true,
    versioned: false,
});
        
const website = new Bucket(stack, 'Website', {
    bucketName: websiteBucket.valueAsString,
    websiteIndexDocument: 'index.html',
    blockPublicAccess: BlockPublicAccess.BLOCK_ACLS,
    encryption: BucketEncryption.S3_MANAGED,
    enforceSSL: false,
    versioned: false,
});

website.addToResourcePolicy(
    new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['s3:GetObject'],
        resources: [website.arnForObjects('*')],
        principals: [new AnyPrincipal()],
    })
);

const backend = new Function(stack, 'Backend', {
    functionName: `${stackName}-backend`,
    runtime: Runtime.PYTHON_3_9,
    code: Code.fromInline('def lambda_handler(event, context):\n    pass'),
    handler: 'lambda_function.lambda_handler',
    environment: {
        BUCKET_NAME: logfiles.bucketName,
    },
    timeout: Duration.seconds(15),
});

logfiles.grantReadWrite(backend);

const cors = {
    allowOrigins: ['*'],
    allowMethods: ['POST'],
    allowHeaders: Cors.DEFAULT_HEADERS,
    exposeHeaders: [
        'Content-Length', 'Content-Type', 'Date',
        'X-Amz-Apigw-Id', 'X-Amzn-Requestid', 'X-Amzn-Trace-Id'
    ],
};

const lambdaAPI = new LambdaRestApi(stack, 'LambdaAPI', {
    handler: backend,
    restApiName: `${stackName}-api`,
    description: 'API for Arcboats',
    endpointTypes: [EndpointType.REGIONAL],
    defaultCorsPreflightOptions: cors,
    deploy: true,
    proxy: false,
});

lambdaAPI.root.addMethod('POST', 
    new LambdaIntegration(backend, { proxy: true }), {});
