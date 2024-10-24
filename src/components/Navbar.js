import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const Navbar = () => {
    return (
        <div className='mb-4'>
             <Link to='/' >
            <Button variant="secondary">Home</Button>
            </Link>
        </div>
    );
};

export default Navbar;