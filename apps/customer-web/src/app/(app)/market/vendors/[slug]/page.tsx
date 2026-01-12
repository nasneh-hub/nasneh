interface MarketVendorPageProps {
  params: {
    slug: string;
  };
}

export default function MarketVendorPage({ params }: MarketVendorPageProps) {
  const { slug } = params;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Market Vendor: {slug}</h1>
      <p className="text-lg mb-8">
        View this vendor's market products (honey, dates, spices, etc.)
      </p>
      {/* TODO: Fetch vendor profile and their market products */}
      {/* API: GET /api/v1/products?vendorId={slug}&categoryId=market */}
    </div>
  );
}
