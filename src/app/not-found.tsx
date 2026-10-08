import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="error-page">
      <div className="container narrow">
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist or has moved.</p>
        <p><Link className="btn btn-primary" href="/">See all demo brands</Link></p>
      </div>
    </main>
  );
}
