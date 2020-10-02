import { axios } from '@getgreenline/homi-shared'

require('dotenv').config()

class AxiosInstance {
  axios

  constructor() {
    this.axios = axios
    
    this.axios.defaults.baseURL = 'http://localhost:4000'
    this.axios.defaults.headers.common['Authorization'] = process.env.REACT_APP_USER_AUTH_TOKEN
  }
}

const axiosInstance = new AxiosInstance()

export default axiosInstance.axios
