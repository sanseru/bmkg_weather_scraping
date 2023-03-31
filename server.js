import express from "express";
import axios from "axios";
import cors from "cors";


import getLocation from "./getLocation.js";
import getWeather from "./getWeather.js";

const app = express();
// app.use(cors);
// app.use(express.json());

const port = 3000;

// Mengambil data lokasi untuk menu dropdown
app.use("/getLocation", getLocation); // Menentukan route '/getLocation'
app.use('/getWeather', getWeather);

// Menampilkan halaman HTML dengan menu dropdown
app.get("/", (req, res) => {
  axios
    .get("http://localhost:3000/getLocation") // Mengambil data lokasi dari route '/getLocation'
    .then((response) => {
      const locations = response.data;
      const options = locations
        .map((loc) => `<option value="${loc.id}">${loc.Kota}</option>`)
        .join("");
      const html = `
          <html>
            <head>
              <title>Weather App</title>
            </head>
            <body>
              <h1>Weather App</h1>
              <select id="location">${options}</select>
              <button id="search">Get Weather</button>
              <div id="result"></div>
              <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
              <script>
              const searchBtn = document.getElementById('search');
              searchBtn.addEventListener('click', () => {
                const location = document.getElementById('location').value;
                axios.get('http://localhost:3000/getWeather/')
                  .then(response => {
                    document.getElementById('result').innerHTML = JSON.stringify(response.data);
                  })
                  .catch(error => {
                    console.log(error);
                    document.getElementById('result').innerHTML = 'Error';
                  });
              });
              </script>
            </body>
          </html>
        `;

      res.send(html);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Error");
    });
});

// Menjalankan server pada port tertentu
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
