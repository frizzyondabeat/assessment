import Body from '@/components/layout/body';
import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';

export default function Page() {
  return (
    <div className="flex h-screen max-h-screen flex-col bg-[#f8f9fb]">
      <Navbar />
      <Body />
      <Footer />
    </div>
  );
}
