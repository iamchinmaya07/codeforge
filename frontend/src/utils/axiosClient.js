import axios from "axios"

const axiosClient = axios.create({
  baseURL: 'https://codeforge-backend-iys9.onrender.com',
  withCredentials: true,
});

export default axiosClient;