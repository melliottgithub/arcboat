
# Project setup

```bash
yarn init -y
yarn -D add typescript ts-node @types/node aws-cdk
yarn -D add constructs
./node_modules/.bin/tsc --init
```

# Create config file

`cdk.json`:
```json
{
  "app": "npx ts-node index.ts"
}
```

## Useful commands

 * `yarn run build`   compile typescript to js
 * `yarn run watch`   watch for changes and compile
 * `yarn run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

# Environment variables

```
.env
REGION=AWS Region
CDK_DEFAULT_ACCOUNT=AWS Account ID
```