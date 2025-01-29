import AboutContainer from "./AboutContainer";
import { AboutProvider } from "./AboutContext";

const About = () => {
  return (
    <AboutProvider>
      <AboutContainer />
    </AboutProvider>
  );
};

export default About;
