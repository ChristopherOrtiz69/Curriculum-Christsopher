const pdfParse = require('pdf-parse');
const fs = require('fs');

const buf = fs.readFileSync('C:/Users/Christopher Ortiz/Downloads/ChristopherOrtiz-CV..pdf_2025_12_10.pdf');

pdfParse(buf).then(data => {
  console.log(data.text);
}).catch(err => {
  console.error('Error:', err.message);
});
