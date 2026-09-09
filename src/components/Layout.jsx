import Navbar from "./Navbar";
import MobileNav from "./MobileNav";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="container-app pb-24 pt-6 lg:pb-14">{children}</main>
      <MobileNav />
    </div>
  );
}
