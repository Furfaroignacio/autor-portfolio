import { Helmet } from "react-helmet-async";
import { Hero } from "../sections/Hero";
import { Books } from "../sections/Books";
import { Contact } from "../sections/Contact";

export function HomePage() {
  return (
    <>
      <Helmet>
        <title>Guido Maria Furfaro — Escritor</title>
        <meta
          name="description"
          content="Sitio oficial de Guido Maria Furfaro. Escritor de narrativa contemporánea. Libros publicados, blog y proceso creativo."
        />
      </Helmet>

      <Hero />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-black/10" />
      </div>

      <Books />
      <Contact />
    </>
  );
}
