import { Hero } from "../sections/Hero";
import { Books } from "../sections/Books";
import { Contact } from "../sections/Contact";

export function HomePage() {
  return (
    <>
      <>
  <Hero />
  <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
    <div className="h-px bg-black/10" />
  </div>
  <Books />
  <Contact />
</>

    </>
  );
}
