import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar({ currentUser, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Wi_POS</h1>
        <p>Family Store System</p>
      </div>
      <div className="navbar-links">
        <Link to="/products" className="nav-link">Products</Link>
        <Link to="/sales" className="nav-link">Checkout</Link>
        <Link to="/history" className="nav-link">History</Link>
      </div>
      <div className="navbar-user">
        <span className="user-name">
          {currentUser?.username}
          {currentUser?.role === 'admin' && <span className="admin-badge">Admin</span>}
        </span>
        <button onClick={onLogout} className="logout-button">Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
