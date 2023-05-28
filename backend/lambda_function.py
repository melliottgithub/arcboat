import os
import json
import boto3
import base64
from logs import Log

s3 = boto3.client('s3')
BUCKET_NAME = os.environ.get('BUCKET_NAME')

def upload_logfile(fileContent, filename):
    file_content_decoded = base64.b64decode(fileContent)
    resp = s3.put_object(Bucket=BUCKET_NAME, Body=file_content_decoded, Key=filename)
    if (resp['ResponseMetadata']['HTTPStatusCode'] == 200):
        return {
            'filename': filename,
            'size': len(file_content_decoded),
        }
    return {
        'error': 'Error uploading file to S3'
    }

def summarize_file(filename):
    s3.download_file(BUCKET_NAME, filename, '/tmp/' + filename)
    try:
        log = Log('/tmp/' + filename)
        log.validate()
        return log.summarize()
    except Exception as e:
        return {
            'error': str(e)
        }

def lambda_handler(event, context):
    params = event.get('body')
    if type(params) == str:
        params = json.loads(event.get('body'))

    response = None

    action = params.get('action')
    if (action == 'upload'):
        response = upload_logfile(params.get('fileContent'), params.get('filename'))
    elif (action == 'summarize'):
        response = summarize_file(params.get('filename'))
    else:
        response = {
            'error': 'Invalid action'
        }

    return {
        'statusCode': 200,
        'body': json.dumps(response),
        'headers': {
            'Access-Control-Allow-Origin': '*',
        }
    }
