resource "aws_db_subnet_group" "this" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = var.private_db_subnet_ids

  tags = {
    Name = "${var.project_name}-${var.environment}-db-subnet-group"
  }
}

resource "aws_db_instance" "this" {
  identifier = "${var.project_name}-${var.environment}-postgres"

  engine         = "postgres"
  instance_class = var.instance_class

  allocated_storage     = var.allocated_storage
  max_allocated_storage = 100
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.master_username

  manage_master_user_password = true

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [var.rds_security_group_id]

  publicly_accessible = false
  multi_az            = false

  backup_retention_period = 7
  backup_window           = "02:00-03:00"
  maintenance_window      = "sun:03:00-sun:04:00"

  auto_minor_version_upgrade = true

  deletion_protection = false
  skip_final_snapshot = true

  copy_tags_to_snapshot = true

  tags = {
    Name = "${var.project_name}-${var.environment}-postgres"
  }
}