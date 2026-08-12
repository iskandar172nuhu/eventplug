module "networking" {
  source = "../../modules/networking"

  project_name = var.project_name
  environment  = var.environment

  vpc_cidr = "10.0.0.0/16"

  public_subnet_cidrs = [
    "10.0.1.0/24",
    "10.0.2.0/24",
  ]

  private_app_subnet_cidrs = [
    "10.0.11.0/24",
    "10.0.12.0/24",
  ]

  private_db_subnet_cidrs = [
    "10.0.21.0/24",
    "10.0.22.0/24",
  ]
}

module "security" {
  source = "../../modules/security"

  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.networking.vpc_id

  app_port      = 3000
  database_port = 5432
}

module "database" {
  source = "../../modules/database"

  project_name = var.project_name
  environment  = var.environment

  private_db_subnet_ids = module.networking.private_db_subnet_ids
  rds_security_group_id = module.security.rds_security_group_id

  db_name         = "eventplug"
  master_username = "eventplug_admin"

  instance_class    = "db.t4g.micro"
  allocated_storage = 20
}

module "ecr" {
  source = "../../modules/ecr"

  project_name = var.project_name
  environment  = var.environment

  image_retention_count = 10
}