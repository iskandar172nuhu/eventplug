output "database_endpoint" {
  description = "EventPlug PostgreSQL endpoint"
  value       = module.database.db_endpoint
}

output "database_secret_arn" {
  description = "Secrets Manager ARN for the RDS master credentials"
  value       = module.database.master_user_secret_arn
  sensitive   = true
}