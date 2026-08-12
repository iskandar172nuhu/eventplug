interface PortfolioImage {
  id: string
  url: string
  caption?: string | null
}

interface PortfolioGalleryProps {
  images: PortfolioImage[]
}

export function PortfolioGallery({ images }: PortfolioGalleryProps) {
  if (images.length === 0) return null

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Portfolio</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((image) => (
          <div key={image.id} className="group relative overflow-hidden rounded-lg">
            <img
              src={image.url}
              alt={image.caption || "Portfolio image"}
              className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
            />
            {image.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-xs text-white line-clamp-2">{image.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
