import { Container } from "../components/ui/Container";
import { author } from "../data/author";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="py-20">
      <Container>
        <h1 className="font-serif text-4xl">{author.name}</h1>
        <p className="mt-4 text-neutral-600">{author.bio}</p>

        <div className="mt-6">
          <Link
            to="/blog"
            className="underline underline-offset-4"
          >
            Leer el blog →
          </Link>
        </div>
      </Container>
    </section>
  );
}
