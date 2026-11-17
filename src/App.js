import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import "./App.css";

function App() {
  return (
    <>
      {/* nav sits outside Routes so it shows on every page */}
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;