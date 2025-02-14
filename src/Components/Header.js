import React from "react";
import Icon from "../Assets/Icons/AllIcons";
import SearchBar from "./SearchBar";
import Logo from "../Assets/Images/logo-xz.png";

const Header = ({ onSearch }) => {
  return (
    <div className="header">
      <div className="logo">
        <img src={Logo} alt="logo" width={80} />
      </div>
      <SearchBar onSearch={onSearch} />
      <div className="refresh">
        <Icon name="refresh" />
      </div>
    </div>
  );
};

export default Header;
