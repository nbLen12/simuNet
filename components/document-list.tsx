import type { JobDocument } from "@/types/domain";

export function DocumentList({ documents }: { documents: JobDocument[] }): React.ReactElement {
  if (!documents.length) {
    return <p className="meta">No documents available.</p>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Version</th>
          <th>Hash</th>
          <th>Uploaded</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((document) => (
          <tr key={document.id}>
            <td>{document.name}</td>
            <td>{document.type}</td>
            <td>v{document.version}</td>
            <td>
              <code>{document.sha256.slice(0, 10)}...</code>
            </td>
            <td>{new Date(document.uploadedAt).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
