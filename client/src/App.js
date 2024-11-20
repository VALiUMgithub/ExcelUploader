import React, { useState } from 'react';
import axios from 'axios';

export default function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:3001/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setData(response.data);
    } catch (err) {
      setError('Error uploading file');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!data) {
      setError('No data to save');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post('http://localhost:3001/save', data);
      alert('Data saved successfully');
    } catch (err) {
      setError('Error saving data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Excel File Uploader</h1>
      <input type="file" onChange={handleFileChange} className="mb-4" accept=".xlsx,.xls" />
      <button onClick={handleUpload} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
        Upload
      </button>
      <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded">
        Save to Database
      </button>
      {loading && <p className="mt-4">Loading...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {data && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Excel Data:</h2>
          {Object.entries(data).map(([sheetName, sheetData]) => (
            <div key={sheetName} className="mb-4">
              <h3 className="text-lg font-medium mb-2">{sheetName}</h3>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    {Object.keys(sheetData[0]).map((header) => (
                      <th key={header} className="border border-gray-300 p-2">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sheetData.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((cell, cellIndex) => (
                        <td key={cellIndex} className="border border-gray-300 p-2">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}