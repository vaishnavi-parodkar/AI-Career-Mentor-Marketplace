import Navbar from "./Navbar";
import MobileNav from "./MobileNav";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="container-app pb-[calc(6rem+env(safe-area-inset-bottom))] pt-7 lg:pb-14 lg:pt-8">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
