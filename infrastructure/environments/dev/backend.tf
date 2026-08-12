terraform {
  backend "s3" {
    bucket       = "eventplug-terraform-state-433806445659"
    key          = "dev/terraform.tfstate"
    region       = "eu-west-2"
    encrypt      = true
    use_lockfile = true
  }
}