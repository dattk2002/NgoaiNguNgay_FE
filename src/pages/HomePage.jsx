import Banner from '../components/Banner';
import HowItWork from '../components/HowItWork';
import RecommendTutorList from '../components/tutors/RecommendTutorList';

function HomePage({ user }) {
    return (
      <>
        <Banner />
        <RecommendTutorList />
        <HowItWork />
      </>
    );
  }

  export default HomePage;