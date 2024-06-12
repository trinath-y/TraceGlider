# Use the official AWS Lambda image for Python
FROM public.ecr.aws/lambda/python:3.9

# Copy the requirements file and install dependencies
COPY app/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY app/ .

# Set the CMD to your handler (Lambda entry point)
CMD ["main.handler"]
