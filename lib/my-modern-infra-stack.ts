import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";

export class MyModernInfraStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    //  ECRリポジトリを作成（昨日作成済みだが、コードとしては残す）
    // new ecr.Repository(this, 'MyFargateAppRepoDef', {
    //   repositoryName: 'my-fargate-app-repo',
    // });

    // VPCを作成する
    const vpc = new ec2.Vpc(this, "MyVpc", {
      maxAzs: 2, // 2つのアベイラビリティゾーンを使う
    });

    // ECSクラスタを作成する
    const cluster = new ecs.Cluster(this, "MyCluster", {
      vpc: vpc, // 上で作ったVPC内に作成する
    });

    // 既存のECRリポジトリを参照する
    const repository = ecr.Repository.fromRepositoryName(
      this,
      "MyFargateAppRepository",
      "my-fargate-app-repo"
    );

    // Application Load Balanced Fargateサービスを作成する
    const fargateService =
      new ecs_patterns.ApplicationLoadBalancedFargateService(
        this,
        "MyFargateService",
        {
          cluster: cluster, // どのクラスタに所属させるか
          cpu: 256, // タスクに割り当てるCPUユニット
          memoryLimitMiB: 512, // タスクに割り当てるメモリ
          desiredCount: 2, // 起動しておくコンテナの数
          taskImageOptions: {
            image:
              ecs.ContainerImage.fromEcrRepository(
                repository
              ), // どのイメージを使うか
            containerPort: 8080, // コンテナが公開しているポート番号
          },
          publicLoadBalancer: true, // パブリックIPを持つロードバランサーを作成する
        }
      );

    // 作成されたロードバランサーのDNS名を出力する
    new cdk.CfnOutput(this, "LoadBalancerDNS", {
      value:
        fargateService.loadBalancer.loadBalancerDnsName,
    });

    // 作成されたFargateサービスのAuto Scalingを設定する
    const scalableTarget =
      fargateService.service.autoScaleTaskCount({
        minCapacity: 2, // ★ この行を追加！ (最小数を2に設定)
        maxCapacity: 4, // タスクの最大数を4に設定
      });

    // CPU使用率に基づいてスケーリングするルールを追加
    scalableTarget.scaleOnCpuUtilization("CpuScaling", {
      targetUtilizationPercent: 50, // CPU使用率が50%に達したらスケールアウト
    });
  }
}
