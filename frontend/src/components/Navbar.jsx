import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Wi_POS</h1>
        <p>Family Store System</p>
      </div>
      <div className="navbar-links">
        <Link to="/" className="nav-link">Products</Link>
        <Link to="/sales" className="nav-link">Checkout</Link>
        <Link to="/history" className="nav-link">History</Link>
      </div>
    </nav>
  );
}

export default Navbar;
