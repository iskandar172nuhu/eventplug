variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-2"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "eventplug"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}