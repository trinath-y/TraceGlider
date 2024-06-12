from fastapi import FastAPI, Response, Request
from fastapi.middleware.cors import CORSMiddleware
import uuid
import boto3
import json
from mangum import Mangum

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure AWS S3
s3 = boto3.client('s3')
bucket_name = 'your-bucket-name'


@app.post("/api/events")
async def handle_event(request: Request):
    event_data = await request.json()
    tracking_id = request.cookies.get('tracking_id')
    if not tracking_id:
        tracking_id = str(uuid.uuid4())
        response = Response(status_code=200)
        response.set_cookie(
            key="tracking_id",
            value=tracking_id,
            max_age=365 * 24 * 60 * 60,  # 1 year expiration
            httponly=True,
            secure=True,
            samesite="None",
        )
        response.body = json.dumps({"status": "success"})
        return response

    # Upload event data to S3
    s3_key = f"events/{tracking_id}/{uuid.uuid4()}.json"
    s3.put_object(
        Body=json.dumps(event_data),
        Bucket=bucket_name,
        Key=s3_key
    )

    return {"status": "success"}


@app.post("/api/navigation")
async def handle_navigation(request: Request):
    navigation_data = await request.json()
    tracking_id = request.cookies.get('tracking_id')
    if not tracking_id:
        tracking_id = str(uuid.uuid4())
        response = Response(status_code=200)
        response.set_cookie(
            key="tracking_id",
            value=tracking_id,
            max_age=365 * 24 * 60 * 60,  # 1 year expiration
            httponly=True,
            secure=True,
            samesite="None",
        )
        response.body = json.dumps({"status": "success"})
        return response

    # Upload navigation data to S3
    s3_key = f"navigation/{tracking_id}/{uuid.uuid4()}.json"
    s3.put_object(
        Body=json.dumps(navigation_data),
        Bucket=bucket_name,
        Key=s3_key
    )

    return {"status": "success"}


@app.get("/api/tracking-cookie")
def set_tracking_cookie(response: Response):
    tracking_id = str(uuid.uuid4())
    response.set_cookie(
        key="tracking_id",
        value=tracking_id,
        max_age=365 * 24 * 60 * 60,  # 1 year expiration
        httponly=True,
        secure=True,
        samesite="None",
    )
    return {"tracking_id": tracking_id}


# Create the Lambda handler
handler = Mangum(app)
