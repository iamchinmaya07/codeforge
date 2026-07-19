import axiosClient from './axiosClient';

export const createOrder = async () => {
  const response = await axiosClient.post('/payment/create-order');
  return response.data;
};

export const verifyPayment = async (paymentData) => {
  const response = await axiosClient.post('/payment/verify', paymentData);
  return response.data;
};