output "vpc_id" {
  description = "ID of the EventPlug VPC"
  value       = aws_vpc.this.id
}

output "availability_zones" {
  description = "Availability zones used by the networking module"
  value       = slice(data.aws_availability_zones.available.names, 0, 2)
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "private_app_subnet_ids" {
  description = "IDs of the private application subnets"
  value       = aws_subnet.private_app[*].id
}

output "private_db_subnet_ids" {
  description = "IDs of the private database subnets"
  value       = aws_subnet.private_db[*].id
}