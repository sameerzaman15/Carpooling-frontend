import React from 'react';
import Groups from './Groups'; 
import './Home.css'; 

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <div className="home-sidebar">
        <Groups /> 
      </div>
    </div>
  );
};

export default Home;
