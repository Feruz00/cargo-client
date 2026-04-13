import http from '../../utils/http';

const getChartsApi = (params = {}) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/charts/`, {
        params,
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getChartApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/charts/${id}`, {
        params,
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const createChartApi = (data = {}) => {
  return new Promise((resolve, reject) => {
    http
      .post('charts/', data)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Something went wrong';

        reject(message);
      });
  });
};

const deleteChartApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`charts/${id}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Something went wrong';

        reject(message);
      });
  });
};

export { createChartApi, getChartApi, getChartsApi, deleteChartApi };
