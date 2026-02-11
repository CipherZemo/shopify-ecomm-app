import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="border p-4 rounded shadow"
          >
            <h2 className="text-xl font-semibold">
              {product.name}
            </h2>
            <p className="text-gray-600">
              {product.description}
            </p>
            <p className="mt-2 font-bold">
              ₹ {product.price}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
