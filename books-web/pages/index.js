import { Bookshelf } from '../components/Bookshelf';

const Home = () => {
  const books = [
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      date: "1925",
      rating: 4.5,
      coverImage: "/path/to/great-gatsby.jpg", // Ensure you have an image here
      spineColor: "#1b1b1b",
      textColor: "#fff",
      slug: "the-great-gatsby",
      summary: "A novel about the American dream...",
    },
    // Add more book objects here
  ];

  return (
    <div>
      <Bookshelf books={books} />
    </div>
  );
}

export default Home;