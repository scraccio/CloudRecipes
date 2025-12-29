import os
import boto3
from PIL import Image
import io
import json

s3 = boto3.client("s3")
sns = boto3.client("sns")

SNS_TOPIC_ARN = os.environ["SNS_TOPIC_ARN"]

def lambda_handler(event, context):
    bucket = event["bucket"]
    key = event["key"]

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
        Metadata={"processed": "true"}
    )

    parts = key.split("/")

    payload = {
        "operation": "image_resize",
        "status": "success",
        "key": key
    }

    if parts[0] == "recipes" and len(parts) >= 3:
        payload.update({
            "scope": "recipe",
            "user_id": parts[1],
            "recipe_id": parts[2]
        })

    elif parts[0] == "users" and len(parts) >= 2:
        payload.update({
            "scope": "user",
            "user_id": parts[1]
        })

    else:
        payload["scope"] = "unknown"

    sns.publish(
        TopicArn=SNS_TOPIC_ARN,
        Message=json.dumps(payload)
    )

    print("sns notification sent:", payload)

    return {"ok": True}
