import http from '../../utils/http';

const getValuesApi = (params = {}) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/value/`, {
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
const getValuesChartApi = (params = {}) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/value/chart`, {
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
const getValueApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .get(`value/${id}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
const createValueApi = (data = {}) => {
  return new Promise((resolve, reject) => {
    http
      .post('value/', data)
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
const importExcelApi = (formData) => {
  return new Promise((resolve, reject) => {
    http
      .post('value/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
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
const updateValueApi = (id, data = {}) => {
  return new Promise((resolve, reject) => {
    http
      .patch(`value/${id}`, data)
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

const deleteValueApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`value/${id}`)
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

const deleteValuesApi = (data) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`value/`, {
        data: {
          ids: data,
        },
      })
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

export {
  createValueApi,
  deleteValueApi,
  getValueApi,
  updateValueApi,
  deleteValuesApi,
  getValuesApi,
  importExcelApi,
  getValuesChartApi,
};
