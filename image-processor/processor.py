import os
import json
import boto3
from PIL import Image
import io

s3 = boto3.client("s3")

def main():
    raw_event = os.environ.get("EVENT_JSON")
    if not raw_event:
        raise RuntimeError("EVENT_JSON missing")

    event = json.loads(raw_event)

    bucket = event["detail"]["bucket"]["name"]
    key = event["detail"]["object"]["key"]

    if not key.startswith("original/"):
        print("skip: non original")
        return

    print(f"processando {bucket}/{key}")

    obj = s3.get_object(Bucket=bucket, Key=key)
    image_bytes = obj["Body"].read()

    image = Image.open(io.BytesIO(image_bytes))
    image.thumbnail((512, 512))

    buffer = io.BytesIO()
    image.save(buffer, format=image.format)
    buffer.seek(0)

    resized_key = key.replace("original/", "resized/", 1)

    s3.put_object(
        Bucket=bucket,
        Key=resized_key,
        Body=buffer,
        ContentType=obj["ContentType"]
    )

    print(f"salvata {resized_key}")

if __name__ == "__main__":
    main()
