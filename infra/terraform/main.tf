resource "aws_s3_bucket" "firmware_storage" {
  bucket = "devops-firmware-storage"

  tags = {
    Name        = "Firmware Storage"
    Environment = "dev"
  }
}

resource "aws_s3_bucket_versioning" "firmware_versioning" {
  bucket = aws_s3_bucket.firmware_storage.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_iam_user" "firmware_uploader" {
  name = "firmware-uploader"
}

resource "aws_iam_user_policy" "firmware_upload_policy" {
  name = "firmware-upload-policy"
  user = aws_iam_user.firmware_uploader.name
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket"
        ],
        Resource = [
          aws_s3_bucket.firmware_storage.arn,
          "${aws_s3_bucket.firmware_storage.arn}/*"
        ]
      }
    ]
  })
}