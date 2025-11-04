import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import './Products.css';

function Products({ currentUser }) {
  const isAdmin = currentUser?.role === 'admin';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock_quantity: '',
    category: 'Other'
  });

  // Available categories
  const categories = ['Drinks', 'Snacks', 'Candy', 'Food', 'Household', 'Other'];

  // Fetch products when component loads
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load products. Make sure your backend is running!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        // Update existing product
        await updateProduct(editingProduct.id, formData);
      } else {
        // Create new product
        await createProduct(formData);
      }

      // Reset form and refresh products
      setFormData({ name: '', price: '', stock_quantity: '' });
      setShowForm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      alert('Failed to save product: ' + err.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      stock_quantity: product.stock_quantity,
      category: product.category || 'Other'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (err) {
        alert('Failed to delete product: ' + err.message);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({ name: '', price: '', stock_quantity: '', category: 'Other' });
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get low stock products (stock < 10)
  const lowStockProducts = filteredProducts.filter(product => product.stock_quantity < 10);

  return (
    <div className="products-page">
      <div className="page-header">
        <h2>Product Management</h2>
        {!showForm && isAdmin && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + Add Product
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search products by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button
            className="btn-clear-search"
            onClick={() => setSearchTerm('')}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <span className="filter-label">Filter by Category:</span>
        <div className="category-buttons">
          {['All', ...categories].map(category => (
            <button
              key={category}
              className={`category-btn ${categoryFilter === category ? 'active' : ''}`}
              onClick={() => setCategoryFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="low-stock-alert">
          <div className="alert-header">
            <span className="alert-icon">⚠️</span>
            <strong>{lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} running low on stock!</strong>
          </div>
          <div className="alert-products">
            {lowStockProducts.map(product => (
              <span key={product.id} className="alert-product-badge">
                {product.name} ({product.stock_quantity} left)
              </span>
            ))}
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="card product-form">
          <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g. Coca Cola"
              />
            </div>

            <div className="form-group">
              <label>Price ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
                placeholder="e.g. 1.50"
              />
            </div>

            <div className="form-group">
              <label>Stock Quantity</label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleInputChange}
                min="0"
                required
                placeholder="e.g. 100"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="category-select"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-success">
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Inventory ({filteredProducts.length} of {products.length} products)</h3>

        {filteredProducts.length === 0 ? (
          <p className="empty-state">
            {searchTerm ? `No products found matching "${searchTerm}"` : 'No products yet. Add your first product above!'}
          </p>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>
                    <span className="category-badge">{product.category || 'Other'}</span>
                  </td>
                  <td>${parseFloat(product.price).toFixed(2)}</td>
                  <td>
                    <span className={product.stock_quantity < 10 ? 'low-stock' : ''}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td className="actions">
                    {isAdmin ? (
                      <>
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(product.id)}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <span className="read-only-badge">View Only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Products;
