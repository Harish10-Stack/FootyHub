import React, { useState, useEffect } from "react";

const ProductData = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://footyhub-backend-cqir.onrender.com/api/products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map((product) => (
        <div key={product._id} className="border p-4 rounded">
          <img src={`https://footyhub-backend-cqir.onrender.com${product.img}`} alt={product.name} className="w-full" />
          <h2 className="text-lg font-semibold">{product.name}</h2>
          <p>₹{product.price}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductData;



