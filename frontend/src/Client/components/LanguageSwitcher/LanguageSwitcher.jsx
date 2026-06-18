import React from "react";
import { useTranslation } from "react-i18next";
import "./LanguageSwitcher.css";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  const handleLanguageChange = (event) => {
    changeLanguage(event.target.value);
  };

  return (
    <div className="lang-toggle">
      <select
        className="lang-select"
        value={i18n.language}
        onChange={handleLanguageChange}
      >
        <option value="en">EN</option>
        <option value="vi">VI</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
