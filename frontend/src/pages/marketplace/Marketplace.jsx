// Marketplace - Product Listing
export default function Marketplace() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Marketplace
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Placeholder product cards */}
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-4xl">📦</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Product {item}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Product description goes here...
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-blue-600">$99.99</span>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
