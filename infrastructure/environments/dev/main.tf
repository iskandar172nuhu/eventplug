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

module "ecs" {
  source = "../../modules/ecs"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region

  log_retention_days = 7

  ecr_repository_url = module.ecr.repository_url
  image_tag          = "v6"

  app_port = 3000

  db_host = module.database.db_endpoint
  db_port = module.database.db_port
  db_name = module.database.db_name

  database_secret_arn = module.database.master_user_secret_arn
  auth_secret_arn     = module.app_secrets.auth_secret_arn

  vpc_id = module.networking.vpc_id

  public_subnet_ids = module.networking.public_subnet_ids

  alb_security_group_id = module.security.alb_security_group_id
  ecs_security_group_id = module.security.ecs_security_group_id

  desired_count = 1
}

module "app_secrets" {
  source = "../../modules/app-secrets"

  project_name = var.project_name
  environment  = var.environment
}

module "github_actions" {
  source = "../../modules/github-actions"

  project_name = var.project_name
  environment  = var.environment

  github_repository = "iskandar172nuhu/eventplug"

  oidc_provider_arn = "arn:aws:iam::433806445659:oidc-provider/token.actions.githubusercontent.com"

  ecr_repository_arn = module.ecr.repository_arn

  ecs_cluster_arn = module.ecs.cluster_arn
  ecs_service_arn = module.ecs.service_arn

  ecs_task_execution_role_arn = module.ecs.task_execution_role_arn
}