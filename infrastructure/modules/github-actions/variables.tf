variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "github_repository" {
  description = "GitHub repository in owner/repo format"
  type        = string
}

variable "oidc_provider_arn" {
  description = "Existing GitHub Actions OIDC provider ARN"
  type        = string
}

variable "ecr_repository_arn" {
  description = "ARN of the EventPlug ECR repository"
  type        = string
}

variable "ecs_cluster_arn" {
  description = "ARN of the EventPlug ECS cluster"
  type        = string
}

variable "ecs_service_arn" {
  description = "ARN of the EventPlug ECS service"
  type        = string
}

variable "ecs_task_execution_role_arn" {
  description = "ARN of the ECS task execution role"
  type        = string
}