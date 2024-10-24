import { Card, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

const CountryCard = (props) => {
    const { name, flag, region } = props;

    return (
        <Col md={4} className="mb-3">
            <Card className="h-100">
                <Card.Img className='h-100 w-100' src={flag} variant='top' />
                <Card.Body>
                    <Card.Title>
                        <Link to={`/country/${name}`}>{name}</Link>
                    </Card.Title>
                    <p>{region}</p>
                </Card.Body>
            </Card>
        </Col>
    );
}

export default CountryCard;
