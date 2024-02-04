import React from 'react';

export const ToastContainer = (favtext = "Successfully added text to My Favourite", errortext = "Maximum 2 Dimensions") => {
  return (
    <div className="toast-container position-fixed bottom-0 end-0 p-3" id="toast-container">
      {/* Favorite toast */}
      <div id="fav-toast" className="toast align-items-center text-bg-secondary border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div className="d-flex">
          <div className="toast-body" id="toast-text">
          Successfully added text to My Favourite
          </div>
          <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
      {/* Error toast */}
      <div id="error-toast" className="toast align-items-center text-bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div className="d-flex">
          <div className="toast-body" id="error-toast-text">
          Maximum 2 Dimensions
          </div>
          <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    </div>
  );
};

export default ToastContainer;
