import os
import boto3
from PIL import Image
import io
import json

s3 = boto3.client("s3")
sns = boto3.client("sns")

def main():
    bucket = os.environ["BUCKET"]
    key = os.environ["KEY"]
    topic_arn = os.environ["SNS_TOPIC_ARN"]

    print(f"topic_arn: {topic_arn}")

    print(f"processing s3://{bucket}/{key}")

    obj = s3.get_object(Bucket=bucket, Key=key)
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

    user_id = extract_user_id(key)
    
    payload = {
        "event": "IMAGE_RESIZE",
        "status": "success",
        "bucket": bucket,
        "key": key,
        "user_id": user_id
    }
    
    response = sns.publish(
        TopicArn=topic_arn,
        Message=json.dumps(payload)
    )
    
    print("sns published:", response["MessageId"])


def extract_user_id(key: str):
    parts = key.split("/")
    if len(parts) >= 2 and parts[0] in ("users", "recipes"):
        return parts[1]
    return None

if __name__ == "__main__":
    main()
