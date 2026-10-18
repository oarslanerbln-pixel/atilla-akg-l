import Image from "next/image";
import styles from "./BookCover.module.css";

/** The cover file's intrinsic size; the share card and structured data use it too. */
export const BOOK_COVER = { src: "/roadmap/book-cover.webp", width: 1000, height: 1600 } as const;

/**
 * The Travel Creator Roadmap, shown as the hardback it reads as: the flat
 * cover artwork with a spine crease and light along its left edge, a block
 * of pages behind its right edge, and a soft shadow where it stands. All of
 * it is CSS over the one image, so nothing else is downloaded.
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
      <span className={styles.pages} aria-hidden="true" />
      <div className={styles.cover}>
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
  );
}
