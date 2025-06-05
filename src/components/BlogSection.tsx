import Image from 'next/image';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  author: {
    name: string;
    avatar: string;
  };
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Future of AI in Business Operations',
    excerpt: 'Discover how AI is transforming business operations and what it means for your company.',
    image: '/blog-1.jpg',
    date: 'March 15, 2024',
    author: {
      name: 'Sarah Johnson',
      avatar: '/user-avatar.svg'
    }
  },
  {
    id: '2',
    title: 'Building Custom AI Solutions: A Guide',
    excerpt: 'Learn the key steps to building and implementing custom AI solutions for your business.',
    image: '/blog-2.jpg',
    date: 'March 10, 2024',
    author: {
      name: 'Michael Chen',
      avatar: '/user-avatar.svg'
    }
  },
  {
    id: '3',
    title: 'AI Ethics and Responsible Development',
    excerpt: 'Understanding the importance of ethical considerations in AI development and deployment.',
    image: '/blog-3.jpg',
    date: 'March 5, 2024',
    author: {
      name: 'Emily Rodriguez',
      avatar: '/user-avatar.svg'
    }
  }
];

export function BlogSection() {
  return (
    <section id="blog" className="w-full py-24 bg-[#0B0C10]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Latest Insights
          </h2>
          <p className="text-gray-300">
            Stay updated with the latest trends and insights in AI technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {blogPosts.map((post) => (
            <article key={post.id} className="bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300">
              <div className="relative h-48">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill={true}
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 mr-3">
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-300">{post.author.name}</div>
                    <div className="text-xs text-gray-400">{post.date}</div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  <Link href={`/blog/${post.id}`} className="hover:text-[#00AFFF] transition-colors">
                    {post.title}
                  </Link>
                </h3>
                <p className="text-gray-300 mb-4">
                  {post.excerpt}
                </p>
                <Link
                  href={`/blog/${post.id}`}
                  className="text-[#00AFFF] hover:text-[#0090cc] transition-colors inline-flex items-center"
                >
                  Read More
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 bg-[#00AFFF] text-white font-medium rounded-lg hover:bg-[#0090cc] transition-colors"
          >
            View All Articles
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
} 