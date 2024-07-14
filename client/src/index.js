import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import { applyMiddleware, compose } from 'redux';
import { createStore } from 'redux';
import thunk from "redux-thunk";
import Reducers from "./Reducers";
import { PointsProvider } from "./context/pointsContext";

const store = createStore(Reducers, compose(applyMiddleware(thunk)));

ReactDOM.render(
  <Provider store={store}>
    <React.StrictMode>
      <PointsProvider>
        <App />
      </PointsProvider>
    </React.StrictMode>
  </Provider>,
  document.getElementById("root")
);

reportWebVitals();
