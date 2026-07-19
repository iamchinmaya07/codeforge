import { useState } from 'react';
import { createOrder, verifyPayment } from '../utils/paymentApi';

function GoPremium() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Step 1: Create order on our backend (which calls Razorpay's API)
      const orderData = await createOrder();

      // Step 2: Configure and open Razorpay's checkout modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'CodeForge Premium',
        description: 'Unlock solution videos and premium features',
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            const result = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (result.success) {
              alert('Payment successful! You are now a premium member.');
              window.location.reload();
            }
          }
          catch (err) {
            console.error('Verification failed:', err);
            alert('Payment could not be verified. Please contact support if money was deducted.');
          }
        },
        prefill: {
          // Optional: prefill user's name/email if you have it in Redux state
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function () {
            console.log('Checkout closed by user without paying');
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    }
    catch (err) {
      console.error('Error creating order:', err);
      setError('Something went wrong. Please try again.');
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg">
      <h3 className="text-xl font-bold mb-2">Go Premium</h3>
      <p className="mb-4 text-sm text-gray-600">
        Unlock solution and premium features for ₹9.
      </p>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <button
        onClick={handlePayment}
        disabled={loading}
        className="btn btn-primary"
      >
        {loading ? 'Processing...' : 'Upgrade Now'}
      </button>
    </div>
  );
}

export default GoPremium;