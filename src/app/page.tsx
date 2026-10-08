import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>Opal Contentful Sandbox</h1>
      <p>
        Six fictional brands, each built around one conversion funnel. The brand directory
        arrives in Phase 7.
      </p>
      <p className={styles.note}>Fictional companies. Sample content for illustration only.</p>
    </main>
  );
}
