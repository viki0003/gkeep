import React from "react";
import Icon from "../Assets/Icons/AllIcons";
import SearchBar from "./SearchBar";

const Header = ({ onSearch }) => {
  return (
    <div className="header">
      <div className="logo">GKeep</div>
      <SearchBar onSearch={onSearch} />
      <div className="refresh">
        <Icon name="refresh" />
      </div>
    </div>
  );
};

export default Header;
