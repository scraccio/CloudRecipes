import os
import boto3
from PIL import Image
from datetime import datetime
import io

s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("RecipeImageTags")

def main():
    bucket = os.environ["BUCKET"]
    key = os.environ["KEY"]

    print(f"processing s3://{bucket}/{key}")

    obj = s3.get_object(Bucket=bucket, Key=key)
    image_bytes = obj["Body"].read()

    image = Image.open(io.BytesIO(image_bytes))
    image.thumbnail((512, 512))

    buffer = io.BytesIO()
    image.save(buffer, format=image.format)
    buffer.seek(0)

    parts = key.split("/", 1)
    resized_key = f"resized/{parts[1]}"

    s3.put_object(
        Bucket=bucket,
        Key=resized_key,
        Body=buffer,
        ContentType=obj["ContentType"]
    )

    print(f"uploaded resized image to s3://{bucket}/{resized_key}")

if __name__ == "__main__":
    main()
