export type Callback = (args?) => void;

export const handleSuccess = (data, cb: Callback): void => {
  cb({ status: 'success', payload: data });
};

export const handleFail = (reason, cb: Callback): void => {
  cb({ status: 'fail', payload: reason });
};

export const handleError = (err, cb: Callback): void => {
  cb({ status: 'error', message: err.message });
};
