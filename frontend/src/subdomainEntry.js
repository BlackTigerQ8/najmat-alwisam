import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import SearchArchive from "./scenes/SearchArchive";

ReactDOM.render(
  <BrowserRouter basename="/archive">
    <SearchArchive />
  </BrowserRouter>,
  document.getElementById("root")
);
