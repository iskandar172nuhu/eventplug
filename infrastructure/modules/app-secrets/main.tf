resource "aws_secretsmanager_secret" "auth" {
  name        = "${var.project_name}/${var.environment}/auth-secret"
  description = "Auth.js secret for EventPlug ${var.environment}"

  tags = {
    Name = "${var.project_name}-${var.environment}-auth-secret"
  }
}