import React, { useState } from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';
import { ReportTypes } from '../constants/application-constant';
import AnticipatedEAOSchedule from './anticipatedEAOSchedule';
export default function ReportSelector({ ...props }) {
    const [selectedReport, setSelectedReport] = useState<string>();
    const apiUrl = props.apiUrl;
    const reportTypeOptions = ReportTypes.map((p, index) => (<option key={index + 1} value={p.Value}>{p.Text}</option>))
    return (
        <>
            <Container>
                <Form>
                    <Form.Group as={Row} className="mb-3" controlId="formHorizontalEmail">
                        <Form.Label column sm={2}>
                            Report
                        </Form.Label>
                        <Col sm={5}>
                            <Form.Select onChange={(event) => setSelectedReport(event.target.value)}>
                                <option key={0}>Select Report</option>
                                {reportTypeOptions}
                            </Form.Select>
                        </Col>
                    </Form.Group>
                </Form>
            </Container>
            <Container>
                {selectedReport === 'ea_anticipated_schedule' && <AnticipatedEAOSchedule apiUrl={apiUrl} />}
            </Container>
        </>
    );
}