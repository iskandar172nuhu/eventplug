output "lambda_function_name" {
  description = "Lambda function used to redeploy ECS after secret rotation"
  value       = aws_lambda_function.redeploy.function_name
}

output "event_rule_name" {
  description = "EventBridge rule monitoring secret rotation"
  value       = aws_cloudwatch_event_rule.secret_rotation.name
}