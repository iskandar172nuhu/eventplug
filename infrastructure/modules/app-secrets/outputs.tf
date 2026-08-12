output "auth_secret_arn" {
  description = "ARN of the EventPlug Auth.js secret"
  value       = aws_secretsmanager_secret.auth.arn
}