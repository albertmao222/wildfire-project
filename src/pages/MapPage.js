import { MapContainer, TileLayer } from "react-leaflet";
// leaflet needs its own stylesheet or the tiles scatter around the page
import "leaflet/dist/leaflet.css";

// [latitude, longitude], roughly the middle of LA County
const LA_CENTER = [34.1, -118.25];

function MapPage() {
  return (
    <div className="map-wrap">
      {/* center and zoom only get read the first time the map renders */}
      <MapContainer center={LA_CENTER} zoom={9} className="map">
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
        />
      </MapContainer>
    </div>
  );
}

export default MapPage;