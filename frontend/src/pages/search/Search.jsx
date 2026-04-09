// Search Page
export default function Search() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Search
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <input
            type="text"
            placeholder="Search schools, NGOs, startups, products..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-center">
            Search results will appear here
          </p>
        </div>
      </div>
    </div>
  )
}
