import React from 'react';
import { Panel } from 'primereact/panel';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { ProgressBar } from 'primereact/progressbar';
import { FileUpload, FileUploadHandlerEvent, FileUploadProgressEvent } from 'primereact/fileupload';
import { summarize, uploadFile } from '../services';
import { FileEntry } from './types';
import FileEntrySummary from './FileEntrySummary';

const defaultFiles: FileEntry[] = [
  { filename: 'sample-log.txt', size: 128, elapsedSeconds: 1, topMessageIds: [["14EF1E11", 603], ["14EF1F11", 602], ["0A100101", 302], ["0A100201", 302], ["0A1002F1", 302]], isValidated: true },
  { filename: 'bad-log.txt', size: 128, error: 'Negative elapsed time', isValidated: false },
]

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
        setMessage(null);
      } catch (error) {
        const err = error as Error;
        setMessage(err?.toString() || 'Error uploading file');
      }
    }
  }

  const validateFile = async (filename: string) => {
    const file = files.find(file => file.filename === filename);
    if (file) {
      try {
        const resp = await summarize(filename);
        const entry = {
          ...file,
          ...resp,
          isValidated: true
        };
        setFiles(files.map(file => file.filename === filename ? entry : file));
        setMessage(null);
      } catch (error) {
        const err = error as Error;
        setMessage(err?.toString() || 'Error uploading file');
      }
    }
  }

  const onProgressUpdate = (event: FileUploadProgressEvent) => {
    console.log('onProgressUpdate', event);
    setProgress(event.progress);
  }

  return (
    <div className="flex flex-column p-3">
      {message && <Message text={message} className="mb-2" />}

      <Panel header="Add a log file" className="mb-4">
        <FileUpload mode="basic" name="demo[]"
          ref={fileUploadRef}
          accept="text/*"
          customUpload={true}
          maxFileSize={5500000}
          uploadHandler={uploadHandler}
          onProgress={onProgressUpdate}
        />
        {progress != null && <ProgressBar value={progress}></ProgressBar>}
      </Panel>
      <div className="flex flex-row p-2 flex-wrap">
        {files.map((file, index) => (
          <Card key={index} title={file.filename} className="mr-4 mb-4">
            <FileEntrySummary entry={file} onValidate={validateFile} />
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Page;