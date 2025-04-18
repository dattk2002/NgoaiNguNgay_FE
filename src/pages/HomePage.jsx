import Banner from '../components/Banner';
import HowItWork from '../components/HowItWork';
import TutorList from '../components/tutors/TutorList';

function HomePage({ user }) {
    return (
      <>
        <Banner />
        <TutorList />
        <HowItWork />
      </>
    );
  }

  export default HomePage;