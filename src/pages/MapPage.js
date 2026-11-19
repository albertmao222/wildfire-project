import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// [latitude, longitude], roughly the middle of LA County
const LA_CENTER = [34.1, -118.25];

// the key lives in .env so it stays out of the repo
const CARTO_KEY = process.env.REACT_APP_CARTO_KEY;

// income scale: dark red -> yellow -> bright green
const LOW = 40000; // this and anything below is full red
const MID = 95000; // yellow, close to the median zip in our data
const HIGH = 150000; // this and anything above is full green
const RED = [163, 21, 26];
const YELLOW = [250, 224, 60];
const GREEN = [46, 230, 107];
const NO_DATA = "#444444";

// where yellow sits along the legend bar, as a percent
const MID_PCT = ((MID - LOW) / (HIGH - LOW)) * 100;
// putting an array inside a template string turns it into "163,21,26"
const GRADIENT = `linear-gradient(to right, rgb(${RED}), rgb(${YELLOW}) ${MID_PCT}%, rgb(${GREEN}))`;

// slide between two [r, g, b] colors, t=0 gives a, t=1 gives b
function mix(a, b, t) {
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

function incomeColor(income) {
  // == null catches both null and undefined, zips the census had nothing for
  if (income == null) return NO_DATA;
  // clamp, so outliers can't run past the ends of the scale
  const x = Math.min(Math.max(income, LOW), HIGH);
  if (x <= MID) return mix(RED, YELLOW, (x - LOW) / (MID - LOW));
  return mix(YELLOW, GREEN, (x - MID) / (HIGH - MID));
}

function MapPage() {
  // starts empty, fills in once the file has loaded
  const [zips, setZips] = useState(null);
  // which zip is clicked right now, null means none
  const [selectedZip, setSelectedZip] = useState(null);

  useEffect(() => {
    // files in public/ are served from the site root
    fetch(process.env.PUBLIC_URL + "/data/la_zips.geojson")
      .then((res) => res.json())
      .then((data) => setZips(data))
      .catch((err) => console.error("couldn't load zips", err));
  }, []); // empty array = run once, when the page first shows

  // every polygon is colored by its income, the clicked one also gets a white outline
  function styleZip(feature) {
    const selected = feature.properties.zip === selectedZip;
    return {
      color: selected ? "#ffffff" : "#0a0a0a",
      weight: selected ? 3 : 0.5,
      fillColor: incomeColor(feature.properties.median_income),
      fillOpacity: 0.85,
    };
  }

  // runs once per polygon when it's first drawn
  function onEachZip(feature, layer) {
    const { zip, median_income } = feature.properties;

    const label =
      median_income == null
        ? `${zip}: no income data`
        : `${zip}: $${median_income.toLocaleString()}`;
    // sticky makes the label follow the cursor instead of sitting in the center
    layer.bindTooltip(label, { sticky: true });

    layer.on("click", (e) => {
      // clicking the selected zip again clears it
      setSelectedZip((prev) => (prev === zip ? null : zip));
      // draw this one on top so neighbors don't cover its border
      e.target.bringToFront();
    });
  }

  return (
    <div className="map-wrap">
      <MapContainer center={LA_CENTER} zoom={9} className="map">
        <TileLayer
          // dark_all is carto's dark basemap, {r} gives sharper tiles on retina screens
          url={`https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution/">CARTO</a>'
        />
        {/* wait until the data is here before drawing it */}
        {zips && <GeoJSON data={zips} style={styleZip} onEachFeature={onEachZip} />}
      </MapContainer>

      <div className="legend">
        <div className="legend-title">Median household income</div>
        <div className="legend-bar" style={{ background: GRADIENT }} />
        <div className="legend-scale">
          <span>≤ ${LOW / 1000}k</span>
          <span>${MID / 1000}k</span>
          <span>${HIGH / 1000}k+</span>
        </div>
        <div className="legend-row">
          <span className="legend-swatch" style={{ background: NO_DATA }} />
          No data
        </div>
      </div>
    </div>
  );
}

export default MapPage;