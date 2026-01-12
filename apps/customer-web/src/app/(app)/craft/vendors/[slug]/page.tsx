interface CraftVendorPageProps {
  params: { slug: string };
}
export default function CraftVendorPage({ params }: CraftVendorPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Craft Vendor: {params.slug}</h1>
    </div>
  );
}
