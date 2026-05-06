terraform {
  required_version = ">= 1.8"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "taskflow-terraform-state"
    key    = "terraform.tfstate"
    region = "ap-southeast-1"
  }
}

provider "aws" {
  region = var.aws_region
}

module "vpc" {
  source  = "./modules/vpc"
  env     = var.env
  project = var.project
}

module "eks" {
  source          = "./modules/eks"
  env             = var.env
  project         = var.project
  vpc_id          = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnet_ids
}

module "rds" {
  source          = "./modules/rds"
  env             = var.env
  project         = var.project
  vpc_id          = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnet_ids
  db_name         = "taskflow"
  db_username     = var.db_username
}

module "ecr" {
  source  = "./modules/ecr"
  project = var.project
}
