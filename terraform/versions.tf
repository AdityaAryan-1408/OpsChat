terraform {
  # 1. Terraform Version Constraint
  # This guarantees that if you share this code, others use a compatible version.
  required_version = ">= 1.5.0"

  # 2. The Backend Configuration (Local)
  # Instead of S3, we save the "state" (the memory of what we built)
  # to a file named 'terraform.tfstate' right here in this folder.
  backend "local" {
    path = "terraform.tfstate"
  }

  # 3. Required Providers
  # This tells Terraform to download the plugin that knows how to talk to AWS.
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}