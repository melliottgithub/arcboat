echo Processing $1
URL=https://<INSTANCE-ID>.execute-api.us-east-1.amazonaws.com/logupload
curl -X POST -H "Content-Type: application/json" \
-d '{"action":"summarize","filename":"'$1'"}' $URL