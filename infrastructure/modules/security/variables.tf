variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where security groups will be created"
  type        = string
}

variable "app_port" {
  description = "Port used by the EventPlug application"
  type        = number
  default     = 3000
}

variable "database_port" {
  description = "PostgreSQL port"
  type        = number
  default     = 5432
}