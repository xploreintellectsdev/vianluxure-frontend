"use client";

const collectionGalleryImages = [
  {
    id: 1,
    imageUrl: "/images/collections/gallery-1.webp",
    alt: "White Collar Detail",
  },
  {
    id: 2,
    imageUrl: "/images/collections/gallery-2.webp",
    alt: "White Shirt Flat Lay",
  },
  {
    id: 4,
    imageUrl: "/images/collections/gallery-4.webp",
    alt: "Folded Tan Shirt",
  },
  {
    id: 5,
    imageUrl: "/images/collections/gallery-5.webp",
    alt: "Green Hanging Shirt",
  },
  {
    id: 6,
    imageUrl: "/images/collections/gallery-6.webp",
    alt: "Green Chest Detail",
  },
  {
    id: 7,
    imageUrl: "/images/collections/gallery-7.webp",
    alt: "Green Collar Detail",
  },
];

export default function LatestProducts() {
  return (
<section className="bg-page-bg py-2 md:py-4 w-screen max-w-screen ml-[calc(-50vw+50%)] overflow-hidden">
        <div className="w-full px-5 md:px-5">
        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            lg:grid-rows-[1.08fr_0.92fr_1.18fr]
            gap-3
            md:gap-4
            w-full
            aspect-auto
            lg:aspect-[2.12/1]
          "
        >
          {/* Top Left */}
          <div className="lg:col-start-1 lg:row-start-1 overflow-hidden rounded-xl h-[13.75rem] lg:h-full w-full">
            <img
              src={collectionGalleryImages[0].imageUrl}
              alt={collectionGalleryImages[0].alt}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Middle Left */}
          <div
            className="
              lg:col-start-1
              lg:row-start-2
              grid
              grid-cols-[1fr_1.15fr]
              gap-3
              md:gap-4
              h-[12.5rem]
              lg:h-full
              w-full
            "
          >
            <div className="overflow-hidden rounded-xl w-full h-full">
              <img
                src={collectionGalleryImages[1].imageUrl}
                alt={collectionGalleryImages[1].alt}
                className="w-full h-full object-cover object-center"
              />
            </div>

            <div className="overflow-hidden rounded-xl w-full h-full">
              <img
                src={collectionGalleryImages[2].imageUrl}
                alt={collectionGalleryImages[2].alt}
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>

          {/* Bottom Left */}
          <div className="lg:col-start-1 lg:row-start-3 overflow-hidden rounded-xl h-[16.25rem] lg:h-full w-full">
            <img
              src={collectionGalleryImages[3].imageUrl}
              alt={collectionGalleryImages[3].alt}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Right Large */}
          <div
            className="
              lg:col-start-2
              lg:row-start-1
              lg:row-span-2
              overflow-hidden
              rounded-xl
              h-[23.75rem]
              lg:h-full
              w-full
            "
          >
            <img
              src={collectionGalleryImages[4].imageUrl}
              alt={collectionGalleryImages[4].alt}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Right Bottom */}
          <div
            className="
              lg:col-start-2
              lg:row-start-3
              overflow-hidden
              rounded-xl
              h-[13.125rem]
              lg:h-full
              w-full
            "
          >
            <img
              src={collectionGalleryImages[5].imageUrl}
              alt={collectionGalleryImages[5].alt}
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}