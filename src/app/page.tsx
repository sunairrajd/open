'use client';

// Import galleries with no SSR since they use browser APIs
// const CircularGallery = dynamic(() => import('@/components/ui/CircularGallery'), {
//   ssr: false,
//   loading: () => <div>Loading gallery...</div>
// });

// const RollingGallery = dynamic(() => import('@/components/ui/RollingGallery'), {
//   ssr: false,
//   loading: () => <div>Loading gallery...</div>
// });

// const galleryItems = [
//   {
//     image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fill=true&w=2400&q=80',
//     text: 'Modern Villa in Indiranagar'
//   },
//   {
//     image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fill=true&w=2400&q=80',
//     text: 'Luxury Apartment in Koramangala'
//   },
//   {
//     image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fill=true&w=2400&q=80',
//     text: 'Penthouse in Whitefield'
//   },
//   {
//     image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fill=true&w=2400&q=80',
//     text: 'Garden House in JP Nagar'
//   },
//   {
//     image: 'https://images.unsplash.com/photo-1600566753851-c3f970f9decf?auto=format&fill=true&w=2400&q=80',
//     text: 'Smart Home in HSR Layout'
//   },
//   {
//     image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fill=true&w=2400&q=80',
//     text: 'Contemporary Villa in Richmond Town'
//   },
//   {
//     image: 'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?auto=format&fill=true&w=2400&q=80',
//     text: 'Eco-Friendly Home in Whitefield'
//   },
//   {
//     image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fill=true&w=2400&q=80',
//     text: 'Luxury Penthouse in CBD'
//   },
//   {
//     image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fill=true&w=2400&q=80',
//     text: 'Modern Apartment in Marathahalli'
//   },
//   {
//     image: 'https://images.unsplash.com/photo-1600047508788-786f3865b4b9?auto=format&fill=true&w=2400&q=80',
//     text: 'Designer Home in Electronic City'
//   },
//   {
//     image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fill=true&w=2400&q=80',
//     text: 'Spacious Villa in Sadashivanagar'
//   },
//   {
//     image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fill=true&w=2400&q=80',
//     text: 'Garden Apartment in Jayanagar'
//   },
//   {
//     image: 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fill=true&w=2400&q=80',
//     text: 'Riverside Home in Ulsoor'
//   },
//   {
//     image: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fill=true&w=2400&q=80',
//     text: 'Modern Complex in Bellandur'
//   },
//   {
//     image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fill=true&w=2400&q=80',
//     text: 'Luxury Villa in Dollars Colony'
//   }
// ];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
      {/* Header */}
      <header className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-2 font-lexend">Open Property</h1>
        <p className="text-center text-muted-foreground">Discover Your Dream Home in Bangalore</p>
      </header>

      {/* Main Content */}
      <main className="container-fluid mx-auto px-4 py-8 space-y-16">
        {/* Circular Gallery Section */}
        <section>
          <h2 className="text-2xl font-bold mb-8 text-center font-lexend">Featured Properties</h2>
          <div className="h-[70vh] w-full relative">
            {/* <CircularGallery
              items={galleryItems}
              bend={2}
              textColor="#000000"
              borderRadius={0.05}
              font="bold 24px var(--font-sans)"
            /> */}
          </div>
        </section>

        {/* Rolling Gallery Section */}
        <section className="py-8">
          <h2 className="text-2xl font-bold mb-8 text-center font-lexend">Latest Listings</h2>
          {/* <RollingGallery
            items={galleryItems}
            direction="left"
            speed={40}
          /> */}
        </section>

        {/* CTA Section */}
        <section className="text-center py-8">
          <a
            href="/map"
            className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-primary rounded-full hover:bg-primary/90 transition-colors"
          >
            Explore All Properties
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <p>© 2024 Open Property. All rights reserved.</p>
      </footer>
    </div>
  );
}
