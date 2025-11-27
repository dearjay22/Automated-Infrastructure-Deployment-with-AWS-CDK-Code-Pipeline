import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as actions from "aws-cdk-lib/aws-codepipeline-actions";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import { CdkLabStack } from "./cdk-lab-stack";

export interface PipelineStackProps extends cdk.StackProps {
  githubConnectionArn: string;
  owner: string;
  repo: string;
  branch?: string;
}

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact();

    const pipeline = new codepipeline.Pipeline(this, "Pipeline");

    // SOURCE
    pipeline.addStage({
      stageName: "Source",
      actions: [
        new actions.CodeStarConnectionsSourceAction({
          actionName: "GitHubSource",
          owner: props.owner,
          repo: props.repo,
          branch: props.branch ?? "main",
          output: sourceOutput,
          connectionArn: props.githubConnectionArn,
        }),
      ],
    });

    // BUILD
    const project = new codebuild.PipelineProject(this, "CdkBuildProject", {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: { commands: ["npm install -g aws-cdk", "npm install"] },
          build: { commands: ["npm run build", "cdk synth"] },
        },
        artifacts: { "base-directory": "cdk.out", files: ["**/*"] },
      }),
    });

    pipeline.addStage({
      stageName: "Build",
      actions: [
        new actions.CodeBuildAction({
          actionName: "Build",
          project,
          input: sourceOutput,
          outputs: [buildOutput],
        }),
      ],
    });

    // DEPLOY
    pipeline.addStage({
      stageName: "Deploy",
      actions: [
        new actions.CloudFormationCreateUpdateStackAction({
          actionName: "Deploy-CFN",
          stackName: "CdkLabStack",
          templatePath: buildOutput.atPath("CdkLabStack.template.json"),
          adminPermissions: true,
        }),
      ],
    });
  }
}
