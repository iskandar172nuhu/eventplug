# --------------------------------------------------
# ALB Security Group
# --------------------------------------------------

resource "aws_security_group" "alb" {
  name        = "${var.project_name}-${var.environment}-alb-sg"
  description = "Security group for EventPlug Application Load Balancer"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.project_name}-${var.environment}-alb-sg"
  }
}

resource "aws_vpc_security_group_ingress_rule" "alb_http" {
  security_group_id = aws_security_group.alb.id

  description = "Allow HTTP from the internet"
  ip_protocol = "tcp"
  from_port   = 80
  to_port     = 80
  cidr_ipv4   = "0.0.0.0/0"
}

resource "aws_vpc_security_group_ingress_rule" "alb_https" {
  security_group_id = aws_security_group.alb.id

  description = "Allow HTTPS from the internet"
  ip_protocol = "tcp"
  from_port   = 443
  to_port     = 443
  cidr_ipv4   = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "alb_egress" {
  security_group_id = aws_security_group.alb.id

  description                  = "Allow ALB traffic to ECS tasks only"
  ip_protocol                  = "tcp"
  from_port                    = var.app_port
  to_port                      = var.app_port
  referenced_security_group_id = aws_security_group.ecs.id
}


# --------------------------------------------------
# ECS Security Group
# --------------------------------------------------

resource "aws_security_group" "ecs" {
  name        = "${var.project_name}-${var.environment}-ecs-sg"
  description = "Security group for EventPlug ECS Fargate tasks"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-sg"
  }
}

resource "aws_vpc_security_group_ingress_rule" "ecs_from_alb" {
  security_group_id = aws_security_group.ecs.id

  description                  = "Allow EventPlug traffic from ALB only"
  ip_protocol                  = "tcp"
  from_port                    = var.app_port
  to_port                      = var.app_port
  referenced_security_group_id = aws_security_group.alb.id
}

# DEV ONLY: ECS currently requires outbound internet/AWS service access.
# Replace this exception when ECS moves to private application subnets
# with controlled egress via NAT and/or VPC endpoints.
#trivy:ignore:AWS-0104
resource "aws_vpc_security_group_egress_rule" "ecs_egress" {
  security_group_id = aws_security_group.ecs.id

  description = "Allow ECS outbound traffic"
  ip_protocol = "-1"
  cidr_ipv4   = "0.0.0.0/0"
}


# --------------------------------------------------
# RDS Security Group
# --------------------------------------------------

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-${var.environment}-rds-sg"
  description = "Security group for EventPlug PostgreSQL database"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.project_name}-${var.environment}-rds-sg"
  }
}

resource "aws_vpc_security_group_ingress_rule" "rds_from_ecs" {
  security_group_id = aws_security_group.rds.id

  description                  = "Allow PostgreSQL access from EventPlug ECS tasks only"
  ip_protocol                  = "tcp"
  from_port                    = var.database_port
  to_port                      = var.database_port
  referenced_security_group_id = aws_security_group.ecs.id
}