interface KitchensVendorPageProps {
  params: { slug: string };
}
export default function KitchensVendorPage({ params }: KitchensVendorPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Kitchen: {params.slug}</h1>
    </div>
  );
}
