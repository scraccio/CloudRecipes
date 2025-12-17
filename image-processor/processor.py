import json
import sys
import os
import boto3
from PIL import Image
from io import BytesIO

s3 = boto3.client("s3")

def main():
    raw_event = sys.stdin.read()
    if not raw_event:
        print("no event received on stdin")
        return

    event = json.loads(raw_event)

    bucket = event["detail"]["bucket"]["name"]
    key = event["detail"]["object"]["key"]

    print(f"received event for s3://{bucket}/{key}")

    if not key.startswith("original/"):
        print("skip: not in original/")
        return

    filename = key.split("/")[-1]
    resized_key = f"resized/{filename}"

    obj = s3.get_object(Bucket=bucket, Key=key)
    image_bytes = obj["Body"].read()

    img = Image.open(BytesIO(image_bytes))
    img = img.convert("RGB")

    img.thumbnail((1024, 1024))

    buffer = BytesIO()
    img.save(buffer, format="JPEG", quality=85)
    buffer.seek(0)

    s3.put_object(
        Bucket=bucket,
        Key=resized_key,
        Body=buffer,
        ContentType="image/jpeg"
    )

    print(f"saved resized image to s3://{bucket}/{resized_key}")

if __name__ == "__main__":
    main()
