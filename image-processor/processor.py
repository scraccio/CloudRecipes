import os
import boto3
from PIL import Image
import io

s3 = boto3.client("s3")

def main():
    bucket = os.environ["BUCKET"]
    image_bytes = obj["Body"].read()

    image = Image.open(io.BytesIO(image_bytes))
    image.thumbnail((512, 512))

    buffer = io.BytesIO()
    image.save(buffer, format=image.format)
    buffer.seek(0)

    s3.put_object(
        Bucket=bucket,
        Key=key,
        Body=buffer,
        ContentType=obj["ContentType"],
        Metadata={
            "processed": "true"
        }
    )

    print(f"resized image overwritten at s3://{bucket}/{key}")

if __name__ == "__main__":
    main()
