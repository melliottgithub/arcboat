URL=https://<INSTANCE-ID>.execute-api.us-east-1.amazonaws.com/logupload
base64_content=$(base64 $1)
echo '{"action":"upload","filename":"'$1'","fileContent":"'$base64_content'"}' > ./upload.json
curl -X POST -H "Content-Type: application/json" -d @upload.json $URL