import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const CardProductoSkeleton = ({ cards }) => {
    return Array(cards)
    .fill(0)
    .map((item, i) => (
        <div key={i}>
            <Skeleton height={120} />
        </div>
    ))

}

export default CardProductoSkeleton