import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//import components
import Navbar from "./components/Navbar";

//import pages
import Home from './pages/Home';
import SingleCountry from './pages/SingleCountry';

import { Container } from 'react-bootstrap';

const App = () => {
    return (
        <Container>
        <Router>
            <Navbar />
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/country/:name' element={<SingleCountry />} />
            </Routes>
        </Router>
        </Container>
    );
};

export default App;
