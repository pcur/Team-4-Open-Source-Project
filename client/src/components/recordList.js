import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";

const Record = (props) => (
  <tr className="border-b transition-colors hover:bg-muted/50">
    <td className="p-4 align-middle">
      <input
        type="checkbox"
        checked={props.selected}
        onChange={() => props.toggleSelect(props.record._id)}
      />
    </td>
    <td className="p-4 align-middle">{props.record.name}</td>
    <td className="p-4 align-middle">{props.record.position}</td>
    <td className="p-4 align-middle">{props.record.level}</td>
    <td className="p-4 align-middle">
      <div className="flex gap-2">
        <Link className="border bg-background hover:bg-slate-100 rounded-md px-3 h-9" to={`/edit/${props.record._id}`}>
          Edit
        </Link>
        <button
          className="border bg-background hover:bg-red-100 rounded-md px-3 h-9"
          type="button"
          onClick={() => props.deleteRecord(props.record._id)}
        >
          Delete
        </button>
      </div>
    </td>
  </tr>
);

export default function RecordList() {
  const [records, setRecords] = useState([]);
  const [fileData, setFileData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    async function getRecords() {
      const response = await fetch(`${process.env.REACT_APP_YOUR_HOSTNAME}/record/`);
      if (!response.ok) {
        console.error(`An error occurred: ${response.statusText}`);
        return;
      }
      setRecords(await response.json());
    }
    getRecords();
  }, [records.length]);



  // Handle Excel Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      setFileData(jsonData.slice(0, 10)); // Show only first 10 rows for preview
      setShowPreview(true);
    };
    reader.readAsArrayBuffer(file);
  };

  // Insert Data into DB
  const handleConfirmUpload = async () => {
    if (fileData.length === 0) return;

    const response = await fetch(`${process.env.REACT_APP_YOUR_HOSTNAME}/record/add`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify(fileData),
    });

    if (response.ok) {
      console.error("Success")
      setRecords([...records, ...fileData]);
      setShowPreview(false);
      setFileData([]);
    } else {
      console.error("Error inserting data");
    }
  };

  return (
    <>
      <h3 className="text-lg font-semibold p-4">Employee Records</h3>

      {/* Upload Excel File */}
      <div className="p-4">
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="border px-4 py-2 rounded-md" />
      </div>

      {/* Preview Table */}
      {showPreview && (
        <div className="p-4">
          <h4 className="font-semibold">Preview (First 10 Records)</h4>
          <table className="border w-full text-sm mt-2">
            <thead>
              <tr className="border-b">
                <th className="p-2">Name</th>
                <th className="p-2">Position</th>
                <th className="p-2">Level</th>
              </tr>
            </thead>
            <tbody>
              {fileData.map((row, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{row.name}</td>
                  <td className="p-2">{row.position}</td>
                  <td className="p-2">{row.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md" onClick={handleConfirmUpload}>
            Confirm Insert
          </button>
        </div>
      )}

      {/* Employee Records Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Position</th>
              <th className="px-4 py-2 text-left">Level</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
        </table>
      </div>

    </>
  );
}
