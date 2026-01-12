interface FoodTrucksVendorPageProps {
  params: { slug: string };
}
export default function FoodTrucksVendorPage({ params }: FoodTrucksVendorPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Food Truck: {params.slug}</h1>
    </div>
  );
}
