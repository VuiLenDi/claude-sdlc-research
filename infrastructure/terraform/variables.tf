variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-southeast-1"
}

variable "env" {
  description = "Environment: dev | staging | prod"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.env)
    error_message = "env must be dev, staging, or prod."
  }
}

variable "project" {
  description = "Project name (used for resource naming)"
  type        = string
  default     = "taskflow"
}

variable "db_username" {
  description = "PostgreSQL master username"
  type        = string
  sensitive   = true
}
