import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// [latitude, longitude], roughly the middle of LA County
const LA_CENTER = [34.1, -118.25];

// the key lives in .env so it stays out of the repo
const CARTO_KEY = process.env.REACT_APP_CARTO_KEY;

// resting look for every zip
const baseStyle = {
  color: "#ff7a1a",
  weight: 1,
  fillColor: "#ff7a1a",
  fillOpacity: 0.2,
};

// the clicked zip gets a thick bright outline
const selectedStyle = {
  color: "#ffffff",
  weight: 3,
  fillColor: "#ff7a1a",
  fillOpacity: 0.4,
};

function MapPage() {
  // starts empty, fills in once the file has loaded
  const [zips, setZips] = useState(null);
  // which zip is clicked right now, null means none
  const [selectedZip, setSelectedZip] = useState(null);

  useEffect(() => {
    // files in public/ are served from the site root
    fetch(process.env.PUBLIC_URL + "/data/la_zcta.geojson")
      .then((res) => res.json())
      .then((data) => setZips(data))
      .catch((err) => console.error("couldn't load zips", err));
  }, []); // empty array = run once, when the page first shows

  // leaflet calls this for every polygon, so each one can pick its own look
  function styleZip(feature) {
    return feature.properties.zip === selectedZip ? selectedStyle : baseStyle;
  }

  // runs once per polygon when it's first drawn
  function onEachZip(feature, layer) {
    const zip = feature.properties.zip;

    // sticky makes the label follow the cursor instead of sitting in the center
    layer.bindTooltip(zip, { sticky: true });

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
    </div>
  );
}

export default MapPage;