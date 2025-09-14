import { getProductReviews } from '@/lib/actions/product';
import CollapsibleSection from '@/components/CollapsibleSection';
import { Star } from 'lucide-react';

interface ReviewsListProps {
  productId: string;
}

export async function ReviewsList({ productId }: ReviewsListProps) {
  const reviews = await getProductReviews(productId);

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  return (
    <>
      <div className="flex items-center mt-4">
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.round(averageRating) ? 'text-orange-400 fill-orange-400' : 'text-dark-500'}`} />
            ))}
        </div>
        <p className="ml-2 text-sm text-dark-700">({reviews.length} Reviews)</p>
      </div>

      <div className="mt-12">
        <CollapsibleSection title={`Reviews (${reviews.length})`}>
            {reviews.length === 0 ? (
                <p className="text-sm text-dark-700">No reviews yet.</p>
            ) : (
                <div className="space-y-8">
                    {reviews.slice(0, 10).map((review) => (
                    <div key={review.id} className="border-b border-light-300 pb-8 last:border-b-0">
                        <div className="flex items-center">
                        {/* Placeholder for avatar */}
                        <div className="w-10 h-10 rounded-full bg-light-300 flex items-center justify-center text-dark-700 font-bold">
                            {review.author.charAt(0)}
                        </div>
                        <div className="ml-4">
                            <p className="text-base font-medium text-dark-900">{review.author}</p>
                            <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-orange-400 fill-orange-400' : 'text-dark-500'}`} />
                            ))}
                            </div>
                        </div>
                        </div>
                        {review.title && <h3 className="mt-4 text-base font-medium text-dark-900">{review.title}</h3>}
                        <p className="mt-2 text-sm text-dark-700">{review.content}</p>
                    </div>
                    ))}
                </div>
            )}
        </CollapsibleSection>
      </div>
    </>
  );
}
