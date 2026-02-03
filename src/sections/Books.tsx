import { Container } from "../components/ui/Container";
import { SectionTitle } from "../components/ui/SectionTitle";
import { author } from "../data/author";

export function Books() {
  return (
    <section id="books" className="py-14 sm:py-16 bg-white/30">

      <Container>
        <SectionTitle
          title="Libros"
          subtitle="Obras publicadas y proyectos literarios."
        />

        <div className="grid gap-6 sm:grid-cols-2">
          {author.books.map((book) => (
            <div
              key={book.title}
              className="rounded-2xl border border-neutral-200 bg-white p-6"
            >
              <h3 className="text-lg font-semibold text-neutral-900">
                {book.title}
              </h3>

              <p className="mt-1 text-sm text-neutral-500">
                {book.year}
              </p>

              <p className="mt-3 text-neutral-700">
                {book.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
