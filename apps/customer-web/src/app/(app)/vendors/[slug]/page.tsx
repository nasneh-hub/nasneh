interface GlobalVendorPageProps {
  params: { slug: string };
}
export default function GlobalVendorPage({ params }: GlobalVendorPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Vendor: {params.slug}</h1>
      <p className="text-lg mb-8">All products and services from this vendor (all categories)</p>
    </div>
  );
}
