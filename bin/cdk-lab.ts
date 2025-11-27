#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import { CdkLabStack } from "../lib/cdk-lab-stack";
import { PipelineStack } from "../lib/pipeline-stack";

const app = new cdk.App();

// Lambda + API Gateway stack
new CdkLabStack(app, "CdkLabStack", {
  env: { account: "141262319565", region: "us-east-1" },
});

// CodePipeline stack
new PipelineStack(app, "PipelineStack", {
  githubConnectionArn: "arn:aws:codeconnections:us-east-1:141262319565:connection/bf36fefc-122a-4987-a156-3a6a07f63cff",
  owner: "dearjay22",
  repo: "Automated-Infrastructure-Deployment-with-AWS-CDK-Code-Pipeline",
  branch: "main",
  env: { account: "141262319565", region: "us-east-1" },
});
