import { NavLink } from "react-router-dom";

function Nav() {
  return (
    <nav className="nav">
      <span className="nav-title">Wildfire Smoke Map</span>
      <div className="nav-links">
        {/* "end" stops Home from counting as active on every page, since every url starts with "/" */}
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/map">Map</NavLink>
      </div>
    </nav>
  );
}

export default Nav;