import { site } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

type Props = {
  title?: string;
  body?: string;
  href?: string;
};

export function CtaBand({
  title = "See your price in about a minute.",
  body = "No account and no payment. Set the rooms, check the breakdown, and request a date that works for you.",
  href = "/quote",
}: Props) {
  return (
    <section className="border-t border-line bg-sage-light/45">
      <Container className="grid gap-8 py-16 md:grid-cols-12 md:items-end md:py-24">
        <div className="md:col-span-8">
          <h2 className="type-h1 max-w-[18ch] text-navy">{title}</h2>
          <p className="type-lead prose-measure mt-5">{body}</p>
        </div>
        <div className="flex flex-col gap-3 md:col-span-4 md:items-end">
          <ButtonLink href={href} chevron>
            Get an estimate
          </ButtonLink>
          <a href={site.phone.href} className="text-sm text-muted hover:text-navy">
            Or call {site.phone.display} (demo number)
          </a>
        </div>
      </Container>
    </section>
  );
}
