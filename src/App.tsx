import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";

import { HomePage } from "./pages/HomePage";
import { BlogPage } from "./pages/BlogPage";
import { PostPage } from "./pages/PostPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[rgb(var(--paper))] text-[rgb(var(--ink))] antialiased">

        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<PostPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
