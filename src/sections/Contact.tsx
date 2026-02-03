import { Container } from "../components/ui/Container";
import { SectionTitle } from "../components/ui/SectionTitle";
import { author } from "../data/author";

export function Contact() {
  return (
    <section id="contact" className="py-16">
      <Container>
        <SectionTitle
          title="Contacto"
          subtitle="Para consultas, colaboraciones o prensa."
        />

        <div className="flex flex-wrap gap-4">
          {author.links.instagram && (
            <a
              href={author.links.instagram}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 text-neutral-700 hover:text-neutral-900"
            >
              Instagram
            </a>
          )}

          {author.links.amazon && (
            <a
              href={author.links.amazon}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 text-neutral-700 hover:text-neutral-900"
            >
              Amazon
            </a>
          )}

          {author.links.X && (
            <a
              href={author.links.X}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 text-neutral-700 hover:text-neutral-900"
            >
              X
            </a>
          )}
        </div>
      </Container>
    </section>
  );
}
