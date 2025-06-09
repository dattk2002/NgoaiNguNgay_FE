import Banner from '../components/Banner';
import HowItWork from '../components/HowItWork';
import RecommendTutorList from '../components/tutors/RecommendTutorList';

function HomePage({ user, onRequireLogin }) {
    return (
      <>
        <Banner />
        <RecommendTutorList user={user} onRequireLogin={onRequireLogin} />
        <HowItWork />
      </>
    );
  }

  export default HomePage;