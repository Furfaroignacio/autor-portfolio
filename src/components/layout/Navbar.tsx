import { Container } from "../ui/Container";
import { author } from "../../data/author";

const links = [
  { label: "Libros", href: "/#books" },
  { label: "Blog", href: "/blog" },
];


export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[rgb(var(--paper))]/80 backdrop-blur">

      <Container>
        <div className="flex h-14 items-center justify-between">
          <a href="/" className="font-serif text-lg tracking-tight text-[rgb(var(--ink))]">
  {author.name}
</a>


          <nav className="flex items-center gap-6">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-black/70 hover:text-black transition tracking-wide"
                
              >
                {l.label}
              </a>
            ))}
            <a
    href="/#contact"
    className="
      rounded-xl
      bg-[rgb(var(--accent))]
      px-4 py-2
      text-sm font-medium
      text-white
      shadow-sm
      transition
      hover:opacity-90
      active:opacity-100
      whitespace-nowrap
    "
  >
    Contactar
  </a>
          </nav>
        </div>
      </Container>
    </header>
  );
}
