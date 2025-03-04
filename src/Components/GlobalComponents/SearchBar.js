import React, { useState } from "react";
import Icon from "../../Assets/Icons/AllIcons";

const SearchBar = ({ onSearch }) => {
  const [searchText, setSearchText] = useState("");

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    onSearch(value); // Pass search text up to Header
  };

  return (
    <div className="search-bar">
      <div className="search-bar-item">
        <span className="search-icon">
          <Icon name="search" />
        </span>
        <input
          type="text"
          placeholder="Search"
          value={searchText}
          onChange={handleSearch}
        />
      </div>
    </div>
  );
};

export default SearchBar;
