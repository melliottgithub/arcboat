import { Button } from "primereact/button";
import { FileEntry } from "./types";

type FileEntrySummaryProps = {
  entry: FileEntry;
  onValidate: (filename: string) => void;
};

export default function FileEntrySummary(props: FileEntrySummaryProps) {
  const round = (n: number) => Math.round(n * 10) / 10;
  const { entry, onValidate } = props;
  return (
    <div className="flex flex-column line-height-3">
      <div>
        <span className="text-900">Size</span>: {entry.size} bytes
      </div>
      {!entry.error && (
        <>
          {entry.elapsedSeconds && (<div>
            <span className="text-900">Elapsed seconds</span>
            : {round(entry.elapsedSeconds)}
          </div>)}
          {entry.topMessageIds && (
            <div><span className="text-900">Top message ids:</span>
              <ul>
                {entry.topMessageIds?.map((id, index) => (
                  <li key={index}>{id[0]}: {id[1]}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
      {entry.isValidated && entry.error && <div><span className="text-900">Error</span>: {entry.error}</div>}
      {!entry.isValidated && (<div className="mt-3">
        <Button label="Validate" onClick={() => onValidate(entry.filename)} />
      </div>)}
    </div>
  );
}
