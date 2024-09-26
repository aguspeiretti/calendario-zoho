import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

window.ZOHO.embeddedApp.on("PageLoad", function (data) {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<App data={data} />);
});
window.ZOHO.embeddedApp.init();

/*const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);*/
