import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Example",
  robots: { index: false, follow: false },
};

/** A deliberately blank page for building example templates during demos. Clear it out afterwards. */
export default function ExamplePage() {
  return (
    <main id="main" className="example-page">
      <h1 className="sr-only">Example</h1>
    </main>
  );
}
