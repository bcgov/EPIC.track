import React from "react";
import { Form, Col, Row, Button, Container } from 'react-bootstrap';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';

export default function AnticipatedEAOSchedule({props}) {
    
    return (
        <Container>
            <Form>
                <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
                    <Form.Label column sm="2">
                        Report Date
                    </Form.Label>
                    <Col sm="4">
                        <Form.Control type="date" id="ReportDate" />
                    </Col>
                    <Col sm="4"></Col>
                    <Col sm="1">
                        <Button>Submit</Button>
                    </Col>
                    <Col sm="1">
                        <Button>Download</Button>
                    </Col>
                </Form.Group>
            </Form>
        </Container>
    )
}