const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;
const AUTHOR = "Mariia Flidermoiz";

const locations = {
  Polska: {
    Warszawa: { latitude: 52.2297, longitude: 21.0122 },
    Lublin: { latitude: 51.2465, longitude: 22.5684 },
    Krakow: { latitude: 50.0647, longitude: 19.9450 }
  },
  Ukraina: {
    Kijow: { latitude: 50.4501, longitude: 30.5234 },
    Lwow: { latitude: 49.8397, longitude: 24.0297 },
    Odessa: { latitude: 46.4825, longitude: 30.7233 }
  },
  Niemcy: {
    Berlin: { latitude: 52.52, longitude: 13.405 },
    Hamburg: { latitude: 53.5511, longitude: 9.9937 },
    Monachium: { latitude: 48.1351, longitude: 11.5820 }
  }
};

function getWeatherDescription(code) {
  const descriptions = {
    0: "Bezchmurnie",
    1: "Przeważnie bezchmurnie",
    2: "Częściowe zachmurzenie",
    3: "Całkowite zachmurzenie",
    45: "Mgła",
    48: "Mgła osadzająca szadź",
    51: "Lekka mżawka",
    53: "Umiarkowana mżawka",
    55: "Gęsta mżawka",
    61: "Słaby deszcz",
    63: "Umiarkowany deszcz",
    65: "Silny deszcz",
    71: "Słabe opady śniegu",
    73: "Umiarkowane opady śniegu",
    75: "Silne opady śniegu",
    80: "Przelotne opady deszczu",
    95: "Burza"
  };

  return descriptions[code] || "Nieznane warunki pogodowe";
}

function renderPage(content) {
  return `
    <!DOCTYPE html>
    <html lang="pl">
    <head>
      <meta charset="UTF-8">
      <title>Aplikacja pogodowa</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #f2f5f8;
          padding: 40px;
          color: #222;
        }
        .container {
          max-width: 720px;
          margin: 0 auto;
          background: white;
          padding: 30px;
          border-radius: 14px;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
        }
        select, button {
          width: 100%;
          padding: 10px;
          margin-top: 8px;
          margin-bottom: 18px;
          font-size: 16px;
        }
        button {
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        .weather-box {
          background: #eef6ff;
          padding: 18px;
          border-radius: 10px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${content}
      </div>
    </body>
    </html>
  `;
}

app.get("/", (req, res) => {
  const content = `
    <h1>Aplikacja pogodowa</h1>
    <p>Autor: ${AUTHOR}</p>

    <form action="/weather" method="GET">
      <label for="country">Kraj:</label>
      <select id="country" name="country" required>
        <option value="Polska">Polska</option>
        <option value="Ukraina">Ukraina</option>
        <option value="Niemcy">Niemcy</option>
      </select>

      <label for="city">Miasto:</label>
      <select id="city" name="city" required>
        <option value="Warszawa">Warszawa</option>
        <option value="Lublin">Lublin</option>
        <option value="Krakow">Kraków</option>
        <option value="Kijow">Kijów</option>
        <option value="Lwow">Lwów</option>
        <option value="Odessa">Odessa</option>
        <option value="Berlin">Berlin</option>
        <option value="Hamburg">Hamburg</option>
        <option value="Monachium">Monachium</option>
      </select>

      <button type="submit">Pokaż pogodę</button>
    </form>
  `;

  res.send(renderPage(content));
});

app.get("/weather", async (req, res) => {
  const { country, city } = req.query;

  if (!country || !city || !locations[country] || !locations[country][city]) {
    return res.status(400).send(renderPage(`
      <h1>Błąd</h1>
      <p>Wybrano nieprawidłowy kraj lub miasto.</p>
      <a href="/">Powrót</a>
    `));
  }

  const { latitude, longitude } = locations[country][city];

  try {
    const apiUrl =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${latitude}` +
      `&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error("Błąd API");
    }

    const data = await response.json();
    const current = data.current;

    const content = `
      <h1>Aktualna pogoda</h1>
      <div class="weather-box">
        <p><strong>Kraj:</strong> ${country}</p>
        <p><strong>Miasto:</strong> ${city}</p>
        <p><strong>Temperatura:</strong> ${current.temperature_2m} °C</p>
        <p><strong>Wilgotność:</strong> ${current.relative_humidity_2m} %</p>
        <p><strong>Prędkość wiatru:</strong> ${current.wind_speed_10m} km/h</p>
        <p><strong>Warunki:</strong> ${getWeatherDescription(current.weather_code)}</p>
      </div>
      <p><a href="/">Powrót</a></p>
    `;

    res.send(renderPage(content));
  } catch {
    res.status(500).send(renderPage(`
      <h1>Błąd</h1>
      <p>Nie udało się pobrać danych pogodowych.</p>
      <a href="/">Powrót</a>
    `));
  }
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(`Application started at: ${new Date().toISOString()}`);
  console.log(`Author: ${AUTHOR}`);
  console.log(`Application listening on TCP port: ${PORT}`);
});