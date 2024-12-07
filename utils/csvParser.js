const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");


const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];

    // the file exists and is a CSV file
    if (!fs.existsSync(filePath)) {
      return reject(new Error("File not found"));
    }

    const extname = path.extname(filePath).toLowerCase();
    if (extname !== ".csv") {
      return reject(new Error("The file must be a CSV"));
    }

    const readStream = fs.createReadStream(filePath);

    // Handle file read 
    readStream.on("error", (err) => {
      return reject(new Error(`File read error: ${err.message}`));
    });

    // Parse the CSV file
    readStream
      .pipe(csv())
      .on("data", (data) => {


        //  Remove extra spaces 
        const sanitizedData = Object.keys(data).reduce((acc, key) => {
          acc[key.trim()] = data[key].trim();
          return acc;
        }, {});

        results.push(sanitizedData); // row as an object
      })
      .on("end", () => {
        resolve(results); //  Array of parsed 
      })
      .on("error", (err) => {
        reject(new Error(`CSV parsing error: ${err.message}`)); // Reject on CSV 
      });
  });
};


module.exports = parseCSV;
