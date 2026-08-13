output "role_arn" {
  description = "IAM role ARN used by GitHub Actions"
  value       = aws_iam_role.github_actions.arn
}

output "role_name" {
  description = "IAM role name used by GitHub Actions"
  value       = aws_iam_role.github_actions.name
}