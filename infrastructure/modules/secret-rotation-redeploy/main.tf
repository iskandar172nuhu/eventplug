terraform {
  required_providers {
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

resource "aws_iam_role" "lambda" {
  name = "${var.project_name}-${var.environment}-secret-rotation-redeploy-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Service = "lambda.amazonaws.com"
        }

        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-secret-rotation-redeploy-role"
  }
}

resource "aws_iam_role_policy" "lambda" {
  name = "${var.project_name}-${var.environment}-secret-rotation-redeploy-policy"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Action = [
          "ecs:UpdateService"
        ]

        Resource = "arn:aws:ecs:${data.aws_region.current.region}:${data.aws_caller_identity.current.account_id}:service/${var.ecs_cluster_name}/${var.ecs_service_name}"
      },

      {
        Effect = "Allow"

        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]

        Resource = "*"
      }
    ]
  })
}

data "archive_file" "lambda" {
  type        = "zip"
  output_path = "${path.module}/lambda.zip"

  source {
    filename = "index.py"

    content = <<-PYTHON
import boto3
import os

ecs = boto3.client("ecs")

def lambda_handler(event, context):
    cluster = os.environ["ECS_CLUSTER"]
    service = os.environ["ECS_SERVICE"]

    response = ecs.update_service(
        cluster=cluster,
        service=service,
        forceNewDeployment=True
    )

    return {
        "statusCode": 200,
        "service": response["service"]["serviceName"]
    }
PYTHON
  }
}

resource "aws_lambda_function" "redeploy" {
  function_name = "${var.project_name}-${var.environment}-secret-rotation-redeploy"

  role    = aws_iam_role.lambda.arn
  handler = "index.lambda_handler"
  runtime = "python3.12"

  filename         = data.archive_file.lambda.output_path
  source_code_hash = data.archive_file.lambda.output_base64sha256

  environment {
    variables = {
      ECS_CLUSTER = var.ecs_cluster_name
      ECS_SERVICE = var.ecs_service_name
    }
  }

  timeout = 30

  tags = {
    Name = "${var.project_name}-${var.environment}-secret-rotation-redeploy"
  }
}

resource "aws_cloudwatch_event_rule" "secret_rotation" {
  name        = "${var.project_name}-${var.environment}-secret-rotation"
  description = "Redeploy EventPlug ECS service when the RDS secret AWSCURRENT version changes"

  event_pattern = jsonencode({
    source = [
      "aws.secretsmanager"
    ]

    detail-type = [
      "Secret Label Updated"
    ]

    resources = [
      var.secret_arn
    ]

    detail = {
      labelUpdated = [
        "AWSCURRENT"
      ]
    }
  })
}

resource "aws_cloudwatch_event_target" "lambda" {
  rule      = aws_cloudwatch_event_rule.secret_rotation.name
  target_id = "RedeployEventPlugECS"
  arn       = aws_lambda_function.redeploy.arn
}

resource "aws_lambda_permission" "eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.redeploy.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.secret_rotation.arn
}