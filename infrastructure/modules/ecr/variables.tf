variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "image_retention_count" {
  description = "Number of recent images to retain"
  type        = number
  default     = 10
}