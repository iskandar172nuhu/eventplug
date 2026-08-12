variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "log_retention_days" {
  description = "Number of days to retain ECS application logs"
  type        = number
  default     = 7
}

variable "ecr_repository_url" {
  description = "ECR repository URL for the EventPlug container"
  type        = string
}

variable "image_tag" {
  description = "Container image tag"
  type        = string
}

variable "app_port" {
  description = "Application container port"
  type        = number
  default     = 3000
}

variable "db_host" {
  description = "RDS PostgreSQL endpoint"
  type        = string
}

variable "db_port" {
  description = "PostgreSQL port"
  type        = number
  default     = 5432
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
}

variable "database_secret_arn" {
  description = "ARN of the RDS-managed database secret"
  type        = string
}

variable "auth_secret_arn" {
  description = "ARN of the Auth.js secret"
  type        = string
}