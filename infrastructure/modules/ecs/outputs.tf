output "cluster_id" {
  description = "ID of the ECS cluster"
  value       = aws_ecs_cluster.this.id
}

output "cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.this.name
}

output "task_execution_role_arn" {
  description = "ARN of the ECS task execution IAM role"
  value       = aws_iam_role.ecs_task_execution.arn
}

output "log_group_name" {
  description = "CloudWatch log group used by ECS"
  value       = aws_cloudwatch_log_group.ecs.name
}

output "task_definition_arn" {
  description = "ARN of the EventPlug ECS task definition"
  value       = aws_ecs_task_definition.this.arn
}

output "task_definition_family" {
  description = "Family of the EventPlug ECS task definition"
  value       = aws_ecs_task_definition.this.family
}

output "alb_dns_name" {
  description = "DNS name of the EventPlug Application Load Balancer"
  value       = aws_lb.this.dns_name
}

output "alb_arn" {
  description = "ARN of the EventPlug Application Load Balancer"
  value       = aws_lb.this.arn
}

output "target_group_arn" {
  description = "ARN of the EventPlug target group"
  value       = aws_lb_target_group.this.arn
}

output "service_name" {
  description = "Name of the EventPlug ECS service"
  value       = aws_ecs_service.this.name
}

output "cluster_arn" {
  description = "ARN of the EventPlug ECS cluster"
  value       = aws_ecs_cluster.this.arn
}

output "service_arn" {
  description = "ARN of the EventPlug ECS service"
  value       = aws_ecs_service.this.id
}