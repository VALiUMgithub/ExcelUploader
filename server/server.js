const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const sql = require('mssql');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// Database configuration
const config = {
  user: 'sa',
  password: 'Axcend123',
  server: 'your_server',
  database: 'your_database',
  options: {
    encrypt: true, // Use this if you're on Windows Azure
    trustServerCertificate: true // Use this if you're using a self-signed certificate
  }
};

// Endpoint to handle file upload and reading
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const workbook = xlsx.readFile(req.file.path);
  const result = {};

  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    result[sheetName] = xlsx.utils.sheet_to_json(sheet);
  });

  res.json(result);
});

// Endpoint to save data to database
app.post('/save', async (req, res) => {
  try {
    await sql.connect(config);
    const data = req.body;

    // Assuming your table is named 'ExcelData' and has columns 'SheetName' and 'Data'
    for (const sheetName in data) {
      const request = new sql.Request();
      const jsonData = JSON.stringify(data[sheetName]);
      await request.query`INSERT INTO ExcelData (SheetName, Data) VALUES (${sheetName}, ${jsonData})`;
    }

    res.send('Data saved successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving data to database');
  } finally {
    await sql.close();
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));