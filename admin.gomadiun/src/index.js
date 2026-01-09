import React from 'react';
import { createRoot } from "react-dom/client";
import { BrowserRouter} from "react-router-dom";
import App from './App';
import './assets/css/vertical-layout-light/style.css';
import './App.css'
import axios from 'axios';
axios.defaults.withCredentials = true;

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <BrowserRouter>
    <App />
    <div class="theme-setting-wrapper">
      <div id="settings-trigger"><i class="ti-settings"></i></div>
      <div id="theme-settings" class="settings-panel">
        <i class="settings-close ti-close"></i>
        <p class="settings-heading">SIDEBAR SKINS</p>
        <div class="sidebar-bg-options selected" id="sidebar-light-theme"><div class="img-ss rounded-circle bg-light border mr-3"></div>Light</div>
        <div class="sidebar-bg-options" id="sidebar-dark-theme"><div class="img-ss rounded-circle bg-dark border mr-3"></div>Dark</div>
        <p class="settings-heading mt-2">HEADER SKINS</p>
        <div class="color-tiles mx-0 px-4">
          <div class="tiles default selected"></div>
          <div class="tiles dark"></div>
        </div>
      </div>
    </div>
  </BrowserRouter>
);