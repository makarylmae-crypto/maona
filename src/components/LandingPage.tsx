import { useApp } from '../context/AppContext';
import { useState, useEffect } from 'react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

interface Product {
  id: number;
  name: string;
  image: string;
  description: string;
  price: number;
  unit: string;
  stock: number;
  farmName: string;
  farmerName?: string;
  location?: string;
  category?: string;
  organic?: boolean;
}

interface ProductCategory {
  label: string;
  value: string;
  icon: string;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const { state, addToCart } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [showAll, setShowAll] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  useEffect(() => {
    // fetch products dynamically
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data.rows || []))
      .catch(console.error);

    // fetch categories dynamically
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.rows || []))
      .catch(console.error);
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (category ? p.category === category : true)
  );

  const displayedProducts = showAll ? filteredProducts : filteredProducts.slice(0, 8);

  const { isAuthenticated, currentUser } = state;

  return (
    <div className="bg-[#0a0a1a] text-[#e8eaf6]">
      {/* Categories */}
      <section className="bg-[#0a0a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-3">
            Browse by <span className="text-gradient">Category</span>
          </h2>
          <p className="text-center text-[#6b708d] mb-10 max-w-lg mx-auto">
            Find exactly what you're looking for
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setCategory(cat.value);
                  onNavigate('market');
                }}
                className="bg-[#1a1a2e] hover:bg-[#282845] rounded-2xl p-5 text-center border border-[#2a2a4a] hover:border-[#00c853]/30 hover:-translate-y-1 transition-all group"
              >
                <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-sm font-medium text-[#a0a4b8] group-hover:text-[#e8eaf6] transition-colors">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="bg-[#0d0d24] border-t border-[#1a1a2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold">
                Fresh <span className="text-gradient">Produce</span>
              </h2>
              <p className="text-[#6b708d] text-sm mt-1">Directly from local farms</p>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b708d] text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl pl-9 pr-4 py-2.5 text-sm w-48 md:w-56 focus:outline-none focus:border-[#00c853] focus:ring-1 focus:ring-[#00c853]/30"
              />
            </div>
          </div>

          {displayedProducts.length === 0 ? (
            <div className="text-center py-20 bg-[#1a1a2e] rounded-2xl border border-[#2a2a4a]">
              <span className="text-6xl block mb-4">🔍</span>
              <p className="text-[#6b708d] text-lg">No products found</p>
              <button
                onClick={() => { setSearch(''); setCategory(''); }}
                className="mt-4 text-[#00c853] hover:text-[#00e676] text-sm"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-[#1a1a2e] rounded-2xl border border-[#2a2a4a] overflow-hidden shadow-lg shadow-black/20 hover:shadow-[#00c853]/5 hover:border-[#00c853]/20 hover:-translate-y-1.5 transition-all group"
                  >
                    <div className="relative h-48 overflow-hidden bg-[#0d0d24]">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-[#e8eaf6] mb-1">{product.name}</h3>
                      <p className="text-sm text-[#6b708d] line-clamp-2 mb-3 leading-relaxed">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-[#00e676]">₱{product.price}</span>
                        {state.isAuthenticated && state.currentUser?.role === 'resident' && product.stock > 0 && (
                          <button
                            onClick={() => addToCart(product, 1)}
                            className="bg-[#00c853] hover:bg-[#00a844] text-[#0a0a1a] px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                          >
                            + Add
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-[#6b708d] mt-2">
                        {product.stock > 0 ? `${product.stock} ${product.unit} available` : 'Out of stock'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {filteredProducts.length > 8 && (
                <div className="text-center mt-10">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="bg-[#1a1a2e] hover:bg-[#282845] text-[#00c853] border border-[#00c853]/30 hover:border-[#00c853]/50 px-8 py-3 rounded-xl font-medium transition-all"
                  >
                    {showAll ? 'Show Less' : `View All Products (${filteredProducts.length})`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
