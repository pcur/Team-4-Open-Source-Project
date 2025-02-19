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
  const [searchQuery, setSearchQuery] = useState("");
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

  // Filter records based on search query and level
  const filteredRecords = records.filter((record) =>
    (record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.position.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <h3 className="text-lg font-semibold p-4">Employee Records</h3>

      {/* Search & Filter Section */}
      <div className="p-4 flex gap-4">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by Name or Position"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border px-4 py-2 rounded-md w-2/3"
        />

        {/* Dropdown Filter by Level */}
        <select
          className="border px-4 py-2 rounded-md w-1/3"
        >
          <option value="All">All Levels</option>
          <option value="Intern">Intern</option>
          <option value="Junior">Junior</option>
          <option value="Senior">Senior</option>
        </select>
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
          <tbody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <Record
                  record={record}
                  deleteRecord={record._id}
                  key={record._id}
                />
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-4">No records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </>
  );
}
