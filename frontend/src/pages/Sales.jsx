import { useState, useEffect } from 'react';
import { getProducts, createSale } from '../services/api';
import './Sales.css';

function Sales() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastSaleTotal, setLastSaleTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const paymentMethods = ['Cash', 'Card', 'Mobile'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      // Only show products with stock
      setProducts(data.filter(p => p.stock_quantity > 0));
      setLoading(false);
    } catch (err) {
      console.error('Failed to load products:', err);
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    // Check if product already in cart
    const existingItem = cart.find(item => item.productId === product.id);

    if (existingItem) {
      // Increase quantity if less than stock
      if (existingItem.quantity < product.stock_quantity) {
        setCart(cart.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        alert(`Only ${product.stock_quantity} in stock!`);
      }
    } else {
      // Add new item to cart
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: 1,
        maxStock: product.stock_quantity
      }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    const item = cart.find(i => i.productId === productId);

    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else if (newQuantity > item.maxStock) {
      alert(`Only ${item.maxStock} in stock!`);
    } else {
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    setProcessing(true);

    // Calculate total BEFORE clearing cart
    const saleTotal = calculateTotal();

    try {
      // Format cart data for API
      const saleData = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        payment_method: paymentMethod
      };

      await createSale(saleData);

      // Save the total for the success message
      setLastSaleTotal(saleTotal);

      // Show success message
      setSuccess(true);

      // Clear cart and reset payment method
      setCart([]);
      setPaymentMethod('Cash');

      // Refresh products (stock will be updated)
      await fetchProducts();

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Failed to complete sale: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  const total = calculateTotal();

  return (
    <div className="sales-page">
      <h2>Checkout / Point of Sale</h2>

      {success && (
        <div className="success-message">
          ✅ Sale completed successfully! Total: ${lastSaleTotal.toFixed(2)}
        </div>
      )}

      <div className="sales-container">
        {/* Products Section */}
        <div className="products-section card">
          <h3>Available Products</h3>

          {products.length === 0 ? (
            <p className="empty-state">No products with stock available.</p>
          ) : (
            <div className="product-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <p className="price">${parseFloat(product.price).toFixed(2)}</p>
                    <p className="stock">Stock: {product.stock_quantity}</p>
                  </div>
                  <button
                    className="btn-add"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Section */}
        <div className="cart-section card">
          <h3>Shopping Cart</h3>

          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>Cart is empty</p>
              <p className="hint">Add products from the left to start a sale</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.productId} className="cart-item">
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p className="item-price">${item.price.toFixed(2)} each</p>
                    </div>

                    <div className="item-controls">
                      <div className="quantity-control">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
                          min="1"
                          max={item.maxStock}
                        />
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      <div className="item-subtotal">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>

                      <button
                        className="btn-remove"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-total">
                <h3>Total: ${total.toFixed(2)}</h3>

                {/* Payment Method Selector */}
                <div className="payment-method-selector">
                  <label className="payment-label">Payment Method:</label>
                  <div className="payment-buttons">
                    {paymentMethods.map(method => (
                      <button
                        key={method}
                        className={`payment-btn ${paymentMethod === method ? 'active' : ''}`}
                        onClick={() => setPaymentMethod(method)}
                        type="button"
                      >
                        {method === 'Cash' && '💵'}
                        {method === 'Card' && '💳'}
                        {method === 'Mobile' && '📱'}
                        {' '}{method}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  className="btn-complete-sale"
                  onClick={handleCompleteSale}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Complete Sale'}
                </button>
                <button
                  className="btn-clear"
                  onClick={() => setCart([])}
                  disabled={processing}
                >
                  Clear Cart
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sales;
