import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx'; // Library to handle Excel file operations

// Component to display each individual record
const Record = ({ record, deleteRecord, toggleSelect, selected }) => (
  <tr className="border-b transition-colors hover:bg-muted/50">
    <td className="p-4 align-middle">
      {/* Checkbox to select a record */}
      <input type="checkbox" checked={selected} onChange={() => toggleSelect(record._id)} />
    </td>
    <td className="p-4 align-middle">{record.name}</td>
    <td className="p-4 align-middle">{record.position}</td>
    <td className="p-4 align-middle">{record.level}</td>
    <td className="p-4 align-middle">
      <div className="flex gap-2">
        {/* Link to edit the record */}
        <Link className="border bg-background hover:bg-slate-100 rounded-md px-3 h-9" to={`/edit/${record._id}`}>Edit</Link>
        {/* Button to delete the record */}
        <button
          className="border bg-background hover:bg-red-100 rounded-md px-3 h-9"
          type="button"
          onClick={() => deleteRecord(record._id)}
        >
          Delete
        </button>
      </div>
    </td>
  </tr>
);

export default function RecordList() {
  // State to hold the list of records from the database
  const [records, setRecords] = useState([]);
  // State to hold data extracted from the Excel file
  const [fileData, setFileData] = useState([]);

  // Fetch existing records from the server when the component mounts
  useEffect(() => {
    fetchRecords();
  }, []);

  // Function to fetch records from the backend
  const fetchRecords = async () => {
    const response = await fetch(`${process.env.REACT_APP_YOUR_HOSTNAME}/record/`);
    if (response.ok) {
      setRecords(await response.json());
    }
  };

  // Function to handle file upload event and read Excel data
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: "binary" });
      const sheetName = workbook.SheetNames[0]; // Read the first sheet from Excel
      const worksheet = workbook.Sheets[sheetName];
      // Convert Excel sheet data into JSON format
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 0 });
      setFileData(data);
    };

    reader.readAsBinaryString(file);
  };

  // Function to import records from fileData into the database individually
  const importRecords = async () => {
    for (const record of fileData) {
      const response = await fetch(`${process.env.REACT_APP_YOUR_HOSTNAME}/record/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record), // Send each record as JSON
      });

      if (!response.ok) {
        console.error(`Error adding record: ${response.statusText}`);
      }
    }

    setFileData([]); // Clear the imported data after uploading
    fetchRecords(); // Refresh the record list
  };

  // Function to delete a record from the database
  const deleteRecord = async (id) => {
    await fetch(`${process.env.REACT_APP_YOUR_HOSTNAME}/${id}`, { method: "DELETE" });
    setRecords(records.filter(record => record._id !== id)); // Update the UI after deletion
  };

  return (
    <div>
      {/* File input for uploading Excel files */}
      <input type="file" onChange={handleFileUpload} />
      <button onClick={importRecords}>Import Data</button>

      {/* Preview first ten records from uploaded file data */}
      {fileData.length > 0 && (
        <div>
          <h3>Preview of Uploaded Data:</h3>
          <table>
            <thead>
              <tr>
                {Object.keys(fileData[0]).map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fileData.slice(0, 10).map((record, index) => (
                <tr key={index}>
                  {Object.values(record).map((value, idx) => (
                    <td key={idx}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Table displaying the records */}
      <table>
        <tbody>
          {records.map(record => (
            <Record
              key={record._id}
              record={record}
              deleteRecord={deleteRecord}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
