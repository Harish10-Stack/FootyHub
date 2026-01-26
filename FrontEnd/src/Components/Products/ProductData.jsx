import React, { useState, useEffect } from "react";
import api from "../../utils/api"; // ✅ use your backend API instance

const ProductData = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products"); // fetch from FootyHub backend
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <div key={product._id} className="border p-4 rounded hover:shadow-lg transition-shadow">
          <img
            src={`https://footyhub-backend-hrqm.onrender.com${product.img}`} // ✅ direct backend path
            alt={product.name}
            className="w-full h-48 object-cover rounded mb-2"
          />
          <h2 className="text-lg font-semibold text-gray-800">{product.name}</h2>
          <p className="text-green-500 font-semibold">₹{product.price}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductData;


export default ProductData;



