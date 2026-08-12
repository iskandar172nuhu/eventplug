variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "private_db_subnet_ids" {
  description = "Private subnet IDs used by RDS"
  type        = list(string)
}

variable "rds_security_group_id" {
  description = "Security group ID for RDS"
  type        = string
}

variable "db_name" {
  description = "Initial PostgreSQL database name"
  type        = string
  default     = "eventplug"
}

variable "master_username" {
  description = "RDS master username"
  type        = string
  default     = "eventplug_admin"
}

variable "instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "allocated_storage" {
  description = "Initial database storage in GB"
  type        = number
  default     = 20
}