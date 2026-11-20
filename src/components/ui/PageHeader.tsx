import type { ReactNode } from "react";
import { Container } from "./Container";

type Props = {
  title: string;
  intro?: ReactNode;
  /** Small breadcrumb-like context, e.g. "Services". Only when it helps orientation. */
  context?: ReactNode;
  children?: ReactNode;
};

export function PageHeader({ title, intro, context, children }: Props) {
  return (
    <Container className="pb-12 pt-14 md:pb-16 md:pt-20">
      {context && <div className="mb-6 text-sm text-muted">{context}</div>}
      <h1 className="type-h1 max-w-[20ch] text-navy">{title}</h1>
      {intro && <div className="type-lead prose-measure mt-6">{intro}</div>}
      {children}
    </Container>
  );
}
