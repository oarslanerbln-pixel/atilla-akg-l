import Image from "next/image";
import styles from "./BookCover.module.css";

/** The cover file's intrinsic size; the share card and structured data use it too. */
export const BOOK_COVER = { src: "/roadmap/book-cover.webp", width: 1000, height: 1600 } as const;

/**
 * The Travel Creator Roadmap as a closed hardback.
 *
 * The cover artwork with a spine crease, a page block and a cast shadow, all
 * CSS around the one image. It stays closed: the cover is the product, and
 * the owner wants it seen, not turned away (October 2026).
 */
export default function BookCover({
  alt,
  sizes,
  priority = false,
}: {
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <div className={styles.book}>
      <div className={styles.stage}>
        <div className={styles.volume}>
          <span className={styles.pages} aria-hidden="true" />
          <div className={styles.front}>
            <Image
              src={BOOK_COVER.src}
              alt={alt}
              width={BOOK_COVER.width}
              height={BOOK_COVER.height}
              priority={priority}
              sizes={sizes}
              className={styles.image}
            />
            <span className={styles.spine} aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}
