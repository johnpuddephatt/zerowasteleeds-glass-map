const axios  = require('axios');
const seed   = require('./save-seed.js');
const fs = require("fs");
let cachePath = `${__dirname}/../cache/sheet.json`;
var slugify = require('slugify');

// Once a googel sheet is "published to the web" we can access its JSON
// via a URL of this form. We just need to pass in the ID of the sheet
// which we can find in the URL of the document.

module.exports = (sheetID, documentID, columns) => {
  let cachePath = `${__dirname}/../data/cache/${documentID}_${sheetID}.json`;

  return new Promise((resolve, reject) => {


    if (fs.existsSync(cachePath) && (process.env.ELEVENTY_ENV == 'development')) {
      console.log(`Hitting cache: ${ cachePath }`);
      resolve(fs.readFileSync(cachePath, 'utf8'));
    }

    else {
      console.log(`Fetching data from https://sheets.googleapis.com/v4/spreadsheets/${documentID}/values/${sheetID}?alt=json&key=AIzaSyDKG8NODyTNED_cjD0aMh0M2NFfH6Wn6FY`);
      axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${documentID}/values/${sheetID}?alt=json&key=AIzaSyDKG8NODyTNED_cjD0aMh0M2NFfH6Wn6FY`)
        .then(response => {

          // massage the data from the Google Sheets API into
          // a shape that will more convenient for us in our SSG.
          var data = [];
          let headers = response.data.values[0];
          response.data.values.shift();

          response.data.values.forEach((row,index) => {
            let outputRow = {};
            outputRow.id = index;
            columns.forEach(column => {
              outputRow[column] = row[headers.indexOf(column)];
            });
            data.push(outputRow);
          });

          // stash the data locally for developing without
          // needing to hit the API each time.
          seed(JSON.stringify(data), cachePath);

          // resolve the promise and return the data
          resolve(JSON.stringify(data));

        })

        // uh-oh. Handle any errrors we might encounter
        .catch(error => {
          console.log('Error :', error);
          reject(error);
        });
      }
  })

}
