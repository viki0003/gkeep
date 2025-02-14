import React from "react";
import "./loader.css";

const Loader = () => {
  return (
    <div className="loader-ui">
      <div id="container">
        <span class="loading-circle sp1">
          <span class="loading-circle sp2">
            <span class="loading-circle sp3"></span>
          </span>
        </span>
        <label class="loading-title">Loading ...</label>
      </div>
      <div className="loader-overlay"></div>
    </div>
  );
};

export default Loader;
