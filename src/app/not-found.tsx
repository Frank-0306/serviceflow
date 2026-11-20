import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="py-24 md:py-32">
      <p className="font-serif text-lg text-moss">404</p>
      <h1 className="type-h1 mt-4 max-w-[18ch] text-navy">This page isn&apos;t here.</h1>
      <p className="type-lead mt-6 max-w-[46ch]">The link may be old or mistyped. Try the services list, or start an estimate.</p>
      <div className="mt-10 flex flex-wrap items-center gap-6">
        <ButtonLink href="/quote">Get an estimate</ButtonLink>
        <Link href="/services" className="link-underline text-navy">
          See services
        </Link>
      </div>
    </Container>
  );
}
