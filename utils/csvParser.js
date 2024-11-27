const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");

// /**
//  * Parses a CSV file and returns the data as an array of objects.
//  * @param {string} filePath - Path to the CSV file to parse.
//  * @returns {Promise<Array>} - Resolves with parsed CSV data, rejects with an error message.
//  */
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];

    // Validate if the file exists and is a CSV file
    if (!fs.existsSync(filePath)) {
      return reject(new Error("File not found"));
    }

    const extname = path.extname(filePath).toLowerCase();
    if (extname !== ".csv") {
      return reject(new Error("The file must be a CSV"));
    }

    const readStream = fs.createReadStream(filePath);

    // Handle file read stream errors
    readStream.on("error", (err) => {
      return reject(new Error(`File read error: ${err.message}`));
    });

    // Parse the CSV file
    readStream
      .pipe(csv())
      .on("data", (data) => {
        results.push(data); // Collect each row as an object
      })
      .on("end", () => {
        resolve(results); // Return the array of parsed data when finished
      })
      .on("error", (err) => {
        reject(new Error(`CSV parsing error: ${err.message}`)); // Reject on CSV parsing error
      });
  });
};

module.exports = parseCSV;
