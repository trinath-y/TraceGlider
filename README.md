# TraceGlider: Open-Source Tracker

## Introduction
TraceGlider is my version of a low cost , privacy focused implementation of server side tracking so that the data can be stored in S3 and subsequently used for any analytic platforms.

## Why TraceGlider?
I strongly believe most of the web analytics software is built as a blackbox where most of the pieces are not needed, so instead of building yet another web analytic software- i decided to build modular componenets with leveraging the pricing economics of cloud and you can pick and choose which component you want. In a nutshell you get:
- Cost-Effective: Low operational costs with serverless infrastructure and scalable cloud storage.
- Lightweight and Fast: Minimal impact on website performance with simple integration.
- Full Control: Own your data with customizable tracking and transparent pricing.
## Features
- Real-time interaction tracking
- Detailed navigation analysis
- Extensive device and environment profiling
- Throttled and debounced event handling for performance optimization
- Compliance with global privacy standards

## Getting Started
Please include the insertTracker.js in the website so that it can be sent to the FastAPI server side tracker which will insert the data directly to S3

Replace 'https://your-fastapi-server.com' with the actual URL of your Server side instance so that tracking information is sent.
Add the following line inside the DOMContentLoaded event listener to set the tracking cookie when the page loads:



# FastAPI Server-Side Tracking

This project is a FastAPI application for server-side tracking, designed to handle events and navigation data from client websites, such as Shopify. It also sets and manages tracking cookies. The application is containerized using Docker and can be deployed as an AWS Lambda function to scale with workload increases.

## Prerequisites

- Docker
- AWS CLI
- AWS account with necessary permissions

## Setup and Deployment

### Step 1: Update Dockerfile for AWS Lambda

Ensure your `Dockerfile` is compatible with AWS Lambda:

```dockerfile
# Use the official AWS Lambda image for Python
FROM public.ecr.aws/lambda/python:3.9

# Copy the requirements file and install dependencies
COPY app/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY app/ .

# Set the CMD to your handler (Lambda entry point)
CMD ["main.handler"]
```

### Step 2: Build and Push Docker Image to AWS ECR
Authenticate Docker with your ECR:

```
aws ecr get-login-password --region your-region | docker login --username AWS --password-stdin your-account-id.dkr.ecr.your-region.amazonaws.com
Create a repository in ECR:
```
Create a repository in ECR:
```
aws ecr create-repository --repository-name your-repo-name
```

Build your Docker image:
```
docker build -t your-repo-name .
```

Tag your Docker image:
```
docker tag your-repo-name:latest your-account-id.dkr.ecr.your-region.amazonaws.com/your-repo-name:latest
```

Push your Docker image to ECR:

```docker push your-account-id.dkr.ecr.your-region.amazonaws.com/your-repo-name:latest```
### Step 3: Deploy Docker Image to AWS Lambda

Create a Lambda function:

```
aws lambda create-function \
  --function-name your-lambda-function-name \
  --package-type Image \
  --code ImageUri=your-account-id.dkr.ecr.your-region.amazonaws.com/your-repo-name:latest \
  --role arn:aws:iam::your-account-id:role/your-lambda-execution-role
```

Update the Lambda function to use the latest image when necessary:

```
aws lambda update-function-code \
  --function-name your-lambda-function-name \
  --image-uri your-account-id.dkr.ecr.your-region.amazonaws.com/your-repo-name:latest
```

### Step 4: Create an API Gateway
Create a new API:

```
aws apigatewayv2 create-api \
  --name your-api-name \
  --protocol-type HTTP
```

Create an integration with your Lambda function:

```
aws apigatewayv2 create-integration \
  --api-id your-api-id \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:your-region:your-account-id:function:your-lambda-function-name
```

Create a route for your API:

```
aws apigatewayv2 create-route \
  --api-id your-api-id \
  --route-key "ANY /{proxy+}" \
  --target integrations/your-integration-id
```

Deploy your API:
```
aws apigatewayv2 create-deployment \
  --api-id your-api-id \
  --stage-name prod
```

### Step 5: Test Your Setup
You should now have an API Gateway URL that you can use to access your FastAPI application running in AWS Lambda. Test it by making requests to this URL.
You should now have an API Gateway URL that you can use to access your FastAPI application running in AWS Lambda. Test it by making requests to this URL.

Additional Considerations
AWS Permissions: Ensure that your Lambda execution role has the necessary permissions to interact with API Gateway and S3.
Environment Variables: Set environment variables in your Lambda function for AWS credentials and other configuration settings.
Monitoring and Logging: Use CloudWatch to monitor logs and performance of your Lambda function.



## Roadmap
- **Short-Term**: Improve error handling and expand privacy controls.
- **Mid-Term**: Implement Docker support for easy deployment and develop APIs for system integration.
- **Long-Term**: Launch a front-end dashboard for visual analytics and encourage community contributions to expand functionality.

## Contributing
Details on how developers can contribute to the TraceGlider project, including coding standards, pull request guidelines, and how to propose feature enhancements or bug fixes.

## License
Information about the open-source license and optional commercial licensing options.
