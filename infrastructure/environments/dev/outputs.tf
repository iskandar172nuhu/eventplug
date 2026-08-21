output "database_endpoint" {
  description = "EventPlug PostgreSQL endpoint"
  value       = module.database.db_endpoint
}

output "database_secret_arn" {
  description = "Secrets Manager ARN for the RDS master credentials"
  value       = module.database.master_user_secret_arn
  sensitive   = true
}

output "ecr_repository_url" {
  description = "EventPlug ECR repository URL"
  value       = module.ecr.repository_url
}

output "auth_secret_arn" {
  description = "Secrets Manager ARN for EventPlug Auth.js secret"
  value       = module.app_secrets.auth_secret_arn
}

output "alb_dns_name" {
  description = "Public ALB DNS name for EventPlug"
  value       = module.ecs.alb_dns_name
}

output "github_actions_role_arn" {
  description = "IAM role assumed by GitHub Actions through OIDC"
  value       = module.github_actions.role_arn
}

output "secret_rotation_redeploy_lambda" {
  description = "Lambda function that redeploys ECS after RDS secret rotation"
  value       = module.secret_rotation_redeploy.lambda_function_name
}

output "secret_rotation_event_rule" {
  description = "EventBridge rule monitoring RDS secret rotation"
  value       = module.secret_rotation_redeploy.event_rule_name
}