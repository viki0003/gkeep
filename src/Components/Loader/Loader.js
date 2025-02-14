import React from "react";
import "./loader.css";

const Loader = () => {
  return (
    <div className="loader-ui">
      <div id="container">
        <span className="loading-circle sp1">
          <span className="loading-circle sp2">
            <span className="loading-circle sp3"></span>
          </span>
        </span>
        <label className="loading-title">Loading ...</label>
      </div>
      <div className="loader-overlay"></div>
    </div>
  );
};

export default Loader;
