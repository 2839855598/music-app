import axios from 'axios';

const instance = axios.create({
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;',
  },
});
export default instance;
