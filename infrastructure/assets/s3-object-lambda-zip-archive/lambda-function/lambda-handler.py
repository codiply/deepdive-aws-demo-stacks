import os
import boto3
import zipfile
from io import BytesIO
from urllib.parse import urlparse

ACCOUNT_ID = os.environ['ACCOUNT_ID']
ACCESS_POINT_ALIAS = os.environ['ACCESS_POINT_ALIAS']

s3_client = boto3.client('s3')
s3_resource = boto3.resource('s3')
s3_paginator = s3_client.get_paginator('list_objects')

def main(event, context):
    print(event)

    object_get_context = event["getObjectContext"]

    print(object_get_context)
    
    request_route = object_get_context["outputRoute"]
    request_token = object_get_context["outputToken"]
    s3_url = object_get_context["inputS3Url"]
    
    prefix = urlparse(s3_url).path[1:]
    
    in_memory_zip = BytesIO()

    with zipfile.ZipFile(in_memory_zip, mode='w', compression=zipfile.ZIP_DEFLATED) as zip:
        page_iterator = s3_paginator.paginate(Bucket=ACCESS_POINT_ALIAS, Prefix=prefix)
        for page in page_iterator:
            if 'Contents' in page:
                for entry in page['Contents']:
                    key = entry['Key']
                    body = s3_resource.Object(ACCESS_POINT_ALIAS, key).get()['Body'].read()
                    zip.writestr(key, body)

    s3_client.write_get_object_response(
        Body=in_memory_zip.getvalue(),
        RequestRoute=request_route,
        RequestToken=request_token)

    return {'status_code': 200}
