import Navbar from '@/components/Header/Navbar';
import Footer from '@/components/Footer/Footer';

export default function UserLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header style={{ borderBottom: '1px solid var(--mantine-color-gray-3)', height: 60, display: 'flex', alignItems: 'center' }}>
        <Navbar />
      </header>
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}
