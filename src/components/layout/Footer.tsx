import { Container } from "../ui/Container";
import { author } from "../../data/author";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 py-8">
      <Container>
        <p className="text-sm text-neutral-500">
          © {new Date().getFullYear()} {author.name}. Todos los derechos reservados.
        </p>
      </Container>
    </footer>
  );
}
