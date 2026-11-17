import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// [latitude, longitude], roughly the middle of LA County
const LA_CENTER = [34.1, -118.25];

// the key lives in .env so it stays out of the repo
const CARTO_KEY = process.env.REACT_APP_CARTO_KEY;

function MapPage() {
  return (
    <div className="map-wrap">
      <MapContainer center={LA_CENTER} zoom={9} className="map">
        <TileLayer
          // dark_all is carto's dark basemap, {r} gives sharper tiles on retina screens
          url={`https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution/">CARTO</a>'
        />
      </MapContainer>
    </div>
  );
}

export default MapPage;