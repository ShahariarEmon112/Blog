import Hero from '@/components/Hero/Hero';
import Categories from '@/components/Categories/Categories';
import FeaturedBlog from '@/components/FeaturedBlog/FeaturedBlog';
import RecentBlog from '@/components/RecentBlog/RecentBlog';

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedBlog />
      <RecentBlog />
    </>
  );
}
