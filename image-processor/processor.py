import os
import boto3
from PIL import Image
from datetime import datetime
import io

s3 = boto3.client("s3")
rekognition = boto3.client(
    "rekognition",
    region_name="eu-west-1"
)
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("RecipeImageTags")

def tag_image(bucket, key):
    response = rekognition.detect_labels(
        Image={
            "S3Object": {
                "Bucket": bucket,
                "Name": key
            }
        },
        MaxLabels=10,
        MinConfidence=80
    )

    labels = [
        {
            "name": l["Name"],
            "confidence": round(l["Confidence"], 2)
        }
        for l in response["Labels"]
    ]

    image_id = key.split("/")[-1]

    table.put_item(
        Item={
            "image_id": image_id,
            "tag_type": "LABEL",
            "labels": labels,
            "created_at": datetime.utcnow().isoformat()
        }
    )

    print(f"saved {len(labels)} tags for {image_id}")

    print(f"saved resized to s3://{bucket}/{resized_key}")

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

    resized_key = f"resized/{key.split('/')[-1]}"

    s3.put_object(
        Bucket=bucket,
        Key=resized_key,
        Body=buffer,
        ContentType=obj["ContentType"]
    )
    
    tag_image(bucket, resized_key)

if __name__ == "__main__":
    main()
