export default function MarketVendorsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Market Vendors</h1>
      <p className="text-lg mb-8">
        Discover vendors selling honey, dates, spices, and traditional products.
      </p>
      {/* TODO: Fetch and display market vendors */}
      {/* API: GET /api/v1/products?categoryId=market (grouped by vendor) */}
    </div>
  );
}
