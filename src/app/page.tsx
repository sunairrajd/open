'use client';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import CSSCircularGallery from "@/components/ui/CSSCircularGallery";


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
    <div className="min-h-screen bg-white overflow-y-auto overflow-x-hidden">
      {/* Header and Hero Section with Gradient */}
      <div style={{ background: 'linear-gradient(to bottom, #FEF1FF, #FFFFFF)' }}>
        {/* Header */}
        <header className="relative" style={{ zIndex: 1000 }}>
          <div className="container-fluid mx-auto px-4 h-16 flex items-center justify-between gap-2">
            {/* Logo/Title */}
            <div className="flex items-center ">
              <a href="https://openproperty.in" target="_blank" rel="noopener noreferrer" className="flex items-center">
                <Image className="block md:hidden" src="/moblogo.svg" alt="Open Property" height={32} width={32} />
                <Image className="hidden md:block" src="/open.svg" alt="Open Property" height={26} width={98} />
              </a>
            </div>

            {/* Empty space where button was */}
            <div></div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-10 pb-4 text-center">
          <div className="relative inline-block items-center">
           
            <h1 className="lg:text-5xl md:text-4xl text-4xl font-bold mb-0 max-w-2xl mx-auto leading-[1.05] tracking-tight">
              Real Properties. Real Walkthroughs.
              <br />
              Curated for You.
            </h1>

           
          </div>
          <p className="text-muted-foreground  mt-6 max-w-xl mx-auto  tracking-tight">
            Save hours of site visits and endless browsing. Watch walkthrough videos of verified properties — all in one place.
          </p>
          <Button 
            className="group rounded-xl mt-6 text-sm text-white transition-all duration-300 ease-in-out hover:scale-102 hover:shadow-xl hover:shadow-pink-300/50 relative overflow-hidden"
            style={{ backgroundColor: 'var(--pinkbrand)' }}
            asChild
          >
            <Link href="/map" className="flex items-center gap-1 px-12 py-6">
              <span className="relative z-10 ">Browse properties in Bengaluru</span>
              <ArrowRight className="w-2 h-4 transition-transform duration-300 group-hover:translate-x-1 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
            <span className="animate-pulse">🔥</span>
            New properties added daily
          </p>
        </section>
      </div>

      {/* Scrolling Properties */}
      <div className="relative w-full lg:w-full mx-auto h-[450px] mb-8">
        {/* Edge Gradients */}
        <div className="absolute left-0 top-0 w-[40%] h-full z-10" style={{ background: 'linear-gradient(to right, white 30%, transparent 100%)' }}></div>
        <div className="absolute right-0 top-0 w-[40%] h-full z-10" style={{ background: 'linear-gradient(to left, white 30%, transparent 100%)' }}></div>
        
        <CSSCircularGallery 
          items={[
            {
              image: "/property-1.jpg",
              text: "₹2.4 Crore • JP Nagar"
            },
            {
              image: "/property-1.jpg",
              text: "₹3.1 Crore • Indiranagar"
            },
            {
              image: "/property-1.jpg",
              text: "₹1.8 Crore • Koramangala"
            },
            {
              image: "/property-1.jpg",
              text: "₹4.2 Crore • Whitefield"
            },
            {
              image: "/property-1.jpg",
              text: "₹2.9 Crore • HSR Layout"
            },
            {
              image: "/property-1.jpg",
              text: "₹3.5 Crore • Richmond Town"
            },
            {
              image: "/property-1.jpg",
              text: "₹2.2 Crore • Jayanagar"
            },
            {
              image: "/property-1.jpg",
              text: "₹1.9 Crore • Electronic City"
            }
          ]}
          bend={3}
          textColor="#000000"
          borderRadius={0.05}
          font="bold 16px DM Sans"
          imageWidth={300}
          imageHeight={533}
        />
      </div>

      {/* Features Section */}
      <section className="container mx-auto px-4 pt-10 pb-4 mb-16">
        <h2 className="text-3xl font-bold text-center mb-2 tracking-tight">
          Built for Serious Home Seekers
        </h2>
        <p className="text-center text-muted-foreground mb-8 max-w-xl mx-auto tracking-tight">
          Every listing on Open Property is hand-checked by our team to ensure it meets quality, relevance, and authenticity standards.
          We verify that each video showcases a real property, includes accurate details, and reflects current availability.
        </p>

        {/* Map Preview Section */}
        <div className="relative">
          <div className="grid grid-cols-12 gap-4">
            <div className="relative rounded-2xl overflow-hidden mb-0 col-span-12 lg:col-span-8 lg:col-start-3">
              <Image
                src="/map-preview.jpg"
                alt="Map Interface"
                width={1200}
                height={600}
                className="w-full pt-6"
              />
              <Badge 
                variant="secondary" 
                className="absolute top-3 left-1 bg-white text-green-900 border-green-300 px-2 py-1 text-sm font-semibold shadow-lg flex items-center gap-2 z-20 transform -rotate-12"
              >
                <span className="w-2 h-2 bg-green-800 rounded-full animate-pulse" style={{ animationDuration: '1s' }}></span>
                
                Live
              </Badge>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-48" style={{ background: 'linear-gradient(to top, white 10%, transparent 100%)' }}></div>
        </div>

        {/* Features Grid */}
        <div className="flex flex-col lg:flex-row justify-center items-stretch gap-8 mb-8">
          <Card className="bg-accent/5 w-full lg:w-1/5 h-[200px] flex flex-col transition-all duration-300 ease-in-out hover:scale-102 hover:shadow-lg">
            <CardHeader className="flex-1 flex flex-col">
              <span className="text-4xl mb-4">🔍</span>
              <CardTitle className="font-semibold">Handpicked Youtube videos</CardTitle>
              <CardDescription className="flex-1">
                We track hundreds of broker channels and pull only high-quality walkthroughs.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-accent/5 w-full lg:w-1/5 h-[200px] flex flex-col transition-all duration-300 ease-in-out hover:scale-102 hover:shadow-lg">
            <CardHeader className="flex-1 flex flex-col">
              <span className="text-4xl mb-4">📍</span>
              <CardTitle className="font-semibold">Mapped, Tagged, Organized</CardTitle>
              <CardDescription className="flex-1">
                Every property is titled with price, area, and key highlights.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-accent/5 w-full lg:w-1/5 h-[200px] flex flex-col transition-all duration-300 ease-in-out hover:scale-102 hover:shadow-lg">
            <CardHeader className="flex-1 flex flex-col">
              <span className="text-4xl mb-4">📱</span>
              <CardTitle className="font-semibold">Contact the agent Directly</CardTitle>
              <CardDescription className="flex-1">
                We don't get in the way. Just click and connect.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center border-t">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>trustopenproperty@gmail.com</span>
          <span>© 2025 Open Property. All rights reserved.</span>
          <div className="space-x-4">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms of service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
