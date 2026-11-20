import Link from "next/link";
import { site } from "@/config/site";

export function DemoBar() {
  return (
    <div className="bg-navy text-ivory/80">
      <p className="mx-auto max-w-[78rem] px-5 py-2 text-center text-[0.78rem] leading-snug sm:px-8 lg:px-12">
        {site.demoNotice}{" "}
        <Link href="/faq#about-this-site" className="text-ivory underline decoration-ivory/40 underline-offset-2 hover:decoration-ivory">
          About this demo
        </Link>
      </p>
    </div>
  );
}
