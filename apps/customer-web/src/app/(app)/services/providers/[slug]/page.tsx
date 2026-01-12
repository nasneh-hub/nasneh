interface ServiceProviderPageProps {
  params: { slug: string };
}
export default function ServiceProviderPage({ params }: ServiceProviderPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Service Provider: {params.slug}</h1>
    </div>
  );
}
