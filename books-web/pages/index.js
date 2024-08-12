
import dynamic from 'next/dynamic';

const ImageViewer = dynamic(() => import('../components/BookshelfView'), { ssr: false });


const Home = () => {

  return (
    <div>
      <ImageViewer />
    </div>
  );
}

export default Home;