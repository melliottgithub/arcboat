import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { FileUpload, FileUploadHandlerEvent, FileUploadProgressEvent } from 'primereact/fileupload';
import { SummarizeResponse, UploadResponse, summarize, uploadFile } from '../services';

type FileEntry = UploadResponse & Partial<SummarizeResponse> & {
  isValidated: boolean
};

const defaultFiles: FileEntry[] = [
  { filename: 'sample-log.txt', size: 128, elapsedSeconds: 1, topMessageIds: [["14EF1E11", 603], ["14EF1F11", 602], ["0A100101", 302], ["0A100201", 302], ["0A1002F1", 302]], isValidated: true },
  { filename: 'bad-log.txt', size: 128, error: 'Negative elapsed time', isValidated: false },
]

function FileEntrySummary(props: { entry: FileEntry }) {
  const round = (n: number) => Math.round(n * 10) / 10;
  const { entry } = props;
  return (
    <div>
      <div>Size: {entry.size} bytes</div>
      {!entry.error && (
        <>
          {entry.elapsedSeconds && <div>Elapsed seconds: {round(entry.elapsedSeconds)} {entry.elapsedSeconds}</div>}
          {entry.topMessageIds && (
          <div>Top message ids:
            <ul>
              {entry.topMessageIds?.map((id, index) => (
                <li key={index}>{id[0]}: {id[1]}</li>
              ))}
            </ul>
          </div>
          )}
        </>
      )}
      {entry.isValidated && entry.error && <div>Error: {entry.error}</div>}
    </div>
  );
}

function Page() {
  const [message, setMessage] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState<number | null>(null);
  const [files, setFiles] = React.useState<FileEntry[]>(defaultFiles);
  const fileUploadRef = React.useRef<FileUpload>(null);

  const uploadHandler = async (event: FileUploadHandlerEvent) => {
    if (event.files.length > 0) {
      try {
        const file = await uploadFile(event.files[0]);
        fileUploadRef.current?.clear();
        const entry = {
          ...file,
          isValidated: false
        }
        setFiles([entry, ...files]);
      } catch (error) {
        const err = error as Error;
        setMessage(err?.toString() || 'Error uploading file');
      }
    }
  }

  const validateFile = async (filename: string) => {
    const file = files.find(file => file.filename === filename);
    if (file) {
      const resp = await summarize(filename);
      const entry = {
        ...file,
        ...resp,
        isValidated: true
      };
      setFiles(files.map(file => file.filename === filename ? entry : file));
    }
  }

  const onProgressUpdate = (event: FileUploadProgressEvent) => {
    console.log('onProgressUpdate', event);
    setProgress(event.progress);
  }

  return (
    <Card title="Upload logs">
      <p className="m-0">
        {message}
      </p>

      <FileUpload mode="basic" name="demo[]"
        ref={fileUploadRef}
        accept="text/*"
        customUpload={true}
        maxFileSize={5500000}
        uploadHandler={uploadHandler}
        onProgress={onProgressUpdate}
      />
      {progress != null && <ProgressBar value={progress}></ProgressBar>}
      <div>
      {files.map((file, index) => (
        <Card key={index} title={file.filename}>
          <FileEntrySummary entry={file} />
          {!file.isValidated && <div><Button label="Validate" onClick={() => validateFile(file.filename)} /></div>}
        </Card>
      ))}
      </div>
    </Card>
  );
}

export default Page;