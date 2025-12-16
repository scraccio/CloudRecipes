import json
import sys
import boto3
from PIL import Image
import io

s3 = boto3.client("s3")

def main():
    event = json.load(sys.stdin)

    bucket = event["detail"]["bucket"]["name"]
    key = event["detail"]["object"]["key"]

    print(f"processando s3://{bucket}/{key}")

    obj = s3.get_object(Bucket=bucket, Key=key)
    image_bytes = obj["Body"].read()

    image = Image.open(io.BytesIO(image_bytes))
    image.thumbnail((512, 512))

    buffer = io.BytesIO()
    image.save(buffer, format=image.format)
    buffer.seek(0)

    resized_key = f"resized/{key.split('/')[-1]}"

    s3.put_object(
        Bucket=bucket,
        Key=resized_key,
        Body=buffer,
        ContentType=obj["ContentType"]
    )

    print(f"salvato s3://{bucket}/{resized_key}")

if __name__ == "__main__":
    main()
