import { HelmetProvider } from "react-helmet-async";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";




ReactDOM.createRoot(document.getElementById("root")!).render(
<HelmetProvider>
    <App />
</HelmetProvider>
);
