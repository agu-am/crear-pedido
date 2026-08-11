import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const CardProductoSkeleton = () => (
    <div className="rounded-3xl bg-canvas p-4 shadow-card">
        <Skeleton height={14} width="90%" baseColor="#e8ebe6" highlightColor="#f4f4f4" />
        <div className="mt-2">
            <Skeleton height={10} width="40%" baseColor="#e8ebe6" highlightColor="#f4f4f4" />
        </div>
        <div className="mt-4 flex items-center justify-between">
            <Skeleton height={22} width={52} baseColor="#e8ebe6" highlightColor="#f4f4f4" />
            <Skeleton circle height={36} width={36} baseColor="#e8ebe6" highlightColor="#f4f4f4" />
        </div>
    </div>
)

export default CardProductoSkeleton
