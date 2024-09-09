import React from "react";

export const Footer = () => {
  return (
    <div className="flex justify-center items-center h-[120px]">
      <div>Sigmund Frost © {new Date().getFullYear()}</div>
    </div>
  );
};
