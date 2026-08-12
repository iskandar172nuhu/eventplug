output "vpc_id" {
  description = "ID of the EventPlug VPC"
  value       = aws_vpc.this.id
}

output "availability_zones" {
  description = "Availability zones used by the networking module"
  value       = slice(data.aws_availability_zones.available.names, 0, 2)
}