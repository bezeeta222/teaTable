import { createAxios } from '@teable/openapi';

export const getAxios = () => {
  const axios = createAxios();
  // Use PUBLIC_ORIGIN for backend API calls (defaults to port 3000)
  const backendUrl = process.env.PUBLIC_ORIGIN || `http://localhost:${process.env.PORT || 3000}`;
  axios.defaults.baseURL = `${backendUrl}/api`;
  return axios;
};

export const axios = getAxios();
