import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductContext';
import { useBanner } from '../context/BannerContext';
import './Home.css';

export default function Home() {
  const { products } = useProducts();
  const { banner } = useBanner();

  return (
    <div className="home">
      {banner.image && (
        <div className="banner">
          <img src={banner.image} alt="banner" className="banner-img" />
        </div>
      )}
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
