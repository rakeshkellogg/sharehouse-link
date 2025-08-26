import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const SampleListing = () => {
  return (
    <div className="min-h-screen bg-real-estate-light py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-real-estate-neutral">
              Sample Property Listing
            </h1>
            <p className="text-lg md:text-xl text-real-estate-neutral/70">
              This is how your listings will look when shared
            </p>
          </div>
        </div>

        {/* Sample Property */}
        <PropertyCard
          title="Beautiful Modern 2BR Apartment"
          price="$2,800/month"
          location="Downtown, San Francisco, CA"
          lat={37.7749}
          lng={-122.4194}
          bedrooms="2"
          bathrooms="2"
          size="1,200"
          description="Stunning modern apartment in the heart of downtown with floor-to-ceiling windows, hardwood floors, and amazing city views. Walking distance to public transportation, restaurants, and shopping. Features include in-unit laundry, modern kitchen with stainless steel appliances, and a private balcony."
          ownerName="Sarah Johnson"
        />

        {/* CTA Section */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg p-6 shadow-card">
            <h3 className="text-2xl md:text-3xl font-semibold text-real-estate-neutral mb-2">
              Ready to create your own listing?
            </h3>
            <p className="text-lg text-real-estate-neutral/70 mb-4">
              Get started in under 2 minutes and share across all your social platforms
            </p>
            <Link to="/create">
              <Button className="bg-gradient-hero text-white shadow-hero">
                Create Your Listing Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SampleListing;