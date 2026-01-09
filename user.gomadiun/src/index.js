import React from 'react';
import { createRoot } from "react-dom/client";
import { BrowserRouter} from "react-router-dom";
import ScrollToTop from './ScrollTop';
import App from './App';
import './index.css';
import './Pages/assets/css/styles.css';
import './modal/assets/styles.css'
import axios from 'axios';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


axios.defaults.withCredentials = true;


const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <BrowserRouter>
    <ScrollToTop />
    <App />
  </BrowserRouter>
);