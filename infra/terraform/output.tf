output "firmware_bucket_name" {
  value = aws_s3_bucket.firmware_storage.id
}

output "supabase_url" {
  value = var.supabase_url
}

output "supabase_anon_key" {
  value     = var.supabase_anon_key
  sensitive = true
}