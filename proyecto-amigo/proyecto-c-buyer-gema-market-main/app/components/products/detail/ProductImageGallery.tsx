"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Icon } from "@/app/components/ui";
import FavoriteButton from "../../features/favorites/FavoriteButton";

interface ProductImageGalleryProps {
  images: string[];
  title: string;
  productId: string;
  initialFavorite?: boolean;
}

export default function ProductImageGallery({
  images,
  title,
  productId,
  initialFavorite = false,
}: ProductImageGalleryProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);

  const total = images.length;
  const hasImages = total > 0;
  const canNavigate = total > 1;
  const currentImage = hasImages ? images[index] : null;

  const goPrev = () => setIndex((i) => (i - 1 + total) % total);
  const goNext = () => setIndex((i) => (i + 1) % total);

  return (
    <div className="lgx:sticky lgx:top-6">
      <div className="aspect-square max-h-130 flex items-center justify-center relative min-[600px]:max-w-140 min-[600px]:mx-auto min-[600px]:rounded-r3 min-[600px]:overflow-hidden min-[600px]:border min-[600px]:border-line lgx:max-w-none lgx:rounded-r3 lgx:overflow-hidden lgx:border lgx:border-line lgx:shadow-sh-1 bg-bone">
        {currentImage ? (
          <Image
            key={currentImage}
            src={currentImage}
            alt={`${title} — imagen ${index + 1} de ${total}`}
            fill
            priority
            loading="eager"
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <Icon name="box" size={64} className="text-ink-3/30" />
        )}

        {/* Botones superiores: volver y favorito */}
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
          <button
            onClick={() => router.back()}
            aria-label="Volver"
            className="w-10 h-10 rounded-full bg-paper/95 flex items-center justify-center shadow-sh-1 active:scale-90 transition-transform"
          >
            <Icon name="arrowLeft" size={18} />
          </button>
          <div className="flex gap-2">
            <FavoriteButton
              productId={productId}
              initialFavorite={initialFavorite}
              className="w-10 h-10 rounded-full bg-paper/95 shadow-sh-1 active:scale-90"
            />
          </div>
        </div>

        {/* Flechas de navegación del carrusel */}
        {canNavigate && (
          <>
            <button
              onClick={goPrev}
              aria-label="Imagen anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-paper/95 flex items-center justify-center shadow-sh-1 active:scale-90 transition-transform z-10"
            >
              <Icon name="arrowLeft" size={18} />
            </button>
            <button
              onClick={goNext}
              aria-label="Imagen siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-paper/95 flex items-center justify-center shadow-sh-1 active:scale-90 transition-transform z-10"
            >
              <Icon name="arrowLeft" size={18} className="rotate-180" />
            </button>

            {/* Indicadores (dots) */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Ir a la imagen ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? "w-5 bg-ink" : "w-2 bg-paper/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
