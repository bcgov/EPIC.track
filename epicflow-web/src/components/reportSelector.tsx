import React, { useState } from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';
import { REPORT_TYPES, REPORT_TYPE } from '../constants/application-constant';
import AnticipatedEAOSchedule from './reports/eaReferral/anticipatedEAOSchedule';
import ResourceForecast from './reports/resourceForecast/resourceForecast';

export default function ReportSelector({ ...props }) {
    const [selectedReport, setSelectedReport] = useState<string>();
    const apiUrl = props.apiUrl;
    const reportTypeOptions = REPORT_TYPES.map((p, index) => (<option key={index + 1} value={p.Value}>{p.Text}</option>))
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
                {selectedReport === REPORT_TYPE.EA_REFERRAL && <AnticipatedEAOSchedule apiUrl={apiUrl} />}
                {selectedReport === REPORT_TYPE.RESOURCE_FORECAST && <ResourceForecast apiUrl={apiUrl} />}
            </Container>
        </>
    );
}