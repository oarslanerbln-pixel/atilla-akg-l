/**
 * One block of structured data. The payload is built from the site's own
 * lists and translations, never from a visitor; `<` is escaped anyway, so a
 * string that ever contains "</script>" cannot end the tag early.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
