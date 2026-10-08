"use client";

// A generic message only: error details stay in the server logs.
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="error-page">
      <div className="container narrow">
        <h1>Something went wrong</h1>
        <p>This page could not be loaded right now. Please try again.</p>
        <p><button type="button" className="btn btn-primary" onClick={() => reset()}>Try again</button></p>
      </div>
    </main>
  );
}
