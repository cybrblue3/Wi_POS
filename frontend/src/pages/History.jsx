import { useState, useEffect } from 'react';
import { getSales, getSaleById } from '../services/api';
import './History.css';

function History() {
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const data = await getSales();
      setSales(data);
    } catch (err) {
      console.error('Failed to load sales:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (saleId) => {
    try {
      setLoadingDetails(true);
      const saleDetails = await getSaleById(saleId);
      setSelectedSale(saleDetails);
    } catch (err) {
      alert('Failed to load sale details: ' + err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateStats = () => {
    console.log('Sales data:', sales); // DEBUG: Check what sales we have

    const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);
    const today = new Date().toDateString();
    const todaySales = sales.filter(sale => new Date(sale.date).toDateString() === today);
    const todayRevenue = todaySales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);

    const stats = {
      totalSales: sales.length,
      totalRevenue,
      todaySales: todaySales.length,
      todayRevenue
    };

    console.log('Calculated stats:', stats); // DEBUG: Check calculated values

    return stats;
  };

  if (loading) {
    return <div className="loading">Loading sales history...</div>;
  }

  const stats = calculateStats();

  return (
    <div className="history-page">
      <h2>Sales History & Reports</h2>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-label">Total Sales</div>
          <div className="stat-value">{stats.totalSales}</div>
        </div>

        <div className="stat-card card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">${stats.totalRevenue.toFixed(2)}</div>
        </div>

        <div className="stat-card card">
          <div className="stat-label">Today's Sales</div>
          <div className="stat-value">{stats.todaySales}</div>
        </div>

        <div className="stat-card card">
          <div className="stat-label">Today's Revenue</div>
          <div className="stat-value">${stats.todayRevenue.toFixed(2)}</div>
        </div>
      </div>

      <div className="history-container">
        {/* Sales List */}
        <div className="sales-list card">
          <h3>All Sales</h3>

          {sales.length === 0 ? (
            <p className="empty-state">No sales yet. Start making sales from the Checkout page!</p>
          ) : (
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Sale ID</th>
                  <th>Date & Time</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>#{sale.id}</td>
                    <td>{formatDate(sale.date || sale.createdAt)}</td>
                    <td>
                      <span className={`payment-badge ${(sale.payment_method || 'Cash').toLowerCase()}`}>
                        {sale.payment_method === 'Cash' && '💵'}
                        {sale.payment_method === 'Card' && '💳'}
                        {sale.payment_method === 'Mobile' && '📱'}
                        {' '}{sale.payment_method || 'Cash'}
                      </span>
                    </td>
                    <td className="total-amount">${parseFloat(sale.total_amount).toFixed(2)}</td>
                    <td>
                      <button
                        className="btn-view"
                        onClick={() => handleViewDetails(sale.id)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Sale Details Panel */}
        {selectedSale && (
          <div className="sale-details card">
            <div className="details-header">
              <h3>Sale #{selectedSale.id} Details</h3>
              <button
                className="btn-close"
                onClick={() => setSelectedSale(null)}
              >
                ✕
              </button>
            </div>

            {loadingDetails ? (
              <div className="loading-details">Loading details...</div>
            ) : (
              <>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span>{formatDate(selectedSale.date || selectedSale.createdAt)}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Payment Method:</span>
                  <span className={`payment-badge ${(selectedSale.payment_method || 'Cash').toLowerCase()}`}>
                    {selectedSale.payment_method === 'Cash' && '💵'}
                    {selectedSale.payment_method === 'Card' && '💳'}
                    {selectedSale.payment_method === 'Mobile' && '📱'}
                    {' '}{selectedSale.payment_method || 'Cash'}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Total Amount:</span>
                  <span className="detail-total">${parseFloat(selectedSale.total_amount).toFixed(2)}</span>
                </div>

                <h4>Items Sold:</h4>

                {selectedSale.SaleItems && selectedSale.SaleItems.length > 0 ? (
                  <div className="items-list">
                    {selectedSale.SaleItems.map((item, index) => (
                      <div key={index} className="item-row">
                        <div className="item-info">
                          <strong>{item.Product?.name || 'Unknown Product'}</strong>
                          <span className="item-price">
                            ${parseFloat(item.price).toFixed(2)} × {item.quantity}
                          </span>
                        </div>
                        <div className="item-subtotal">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-items">No items found for this sale.</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
