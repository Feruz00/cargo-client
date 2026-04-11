import http from '../../utils/http';

const createFieldApi = (data = {}) => {
  return new Promise((resolve, reject) => {
    http
      .post('/field/', data)
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

const getFieldApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/field/${id}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getFieldsApi = (params = {}) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/field/`, {
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

const updateFieldApi = (id, data = {}) => {
  return new Promise((resolve, reject) => {
    http
      .patch(`/field/${id}`, data)
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

const updateOrdersApi = (data = {}) => {
  return new Promise((resolve, reject) => {
    http
      .put(`/field`, data)
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

const deleteFieldApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/field/${id}`)
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

const deleteFieldsApi = (data) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/field/`, {
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
  createFieldApi,
  deleteFieldApi,
  getFieldApi,
  getFieldsApi,
  updateFieldApi,
  deleteFieldsApi,
  updateOrdersApi,
};
