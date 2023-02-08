import React, { useEffect, useState } from "react";
import { Form, Col, Row, Button, Container, Accordion, Tabs, Tab, Table } from 'react-bootstrap';
import AccordionItem from "react-bootstrap/esm/AccordionItem";
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import ReportService from "../services/reportService";

export default function AnticipatedEAOSchedule({ ...props }) {
    const [reports, setReports] = useState({});
    const [tabKey, setTabKey] = useState('basic');
    const [reportDate, setReportDate] = useState();
    const fetchReportData = async () => {
        const reportData = await ReportService.fetchReportData(props.apiUrl, 'ea_anticipated_schedule', {
            report_date: '2023-02-07'
        });

        if (reportData.status === 200) {
            Object.keys(reportData.data as {}).forEach(key => {
                console.log((reportData.data as any)[key]);
            })
            setReports(reportData.data as never);
        }

    }
    const downloadPDFReport = async() =>{
        const binaryReponse = await ReportService.downloadPDF(props.apiUrl, 'ea_anticipated_schedule', {
            report_date: '2023-02-07'
        });
        const url = window.URL.createObjectURL(new Blob([(binaryReponse as any).data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "file.pdf");
        document.body.appendChild(link);
        link.click();
    }
    return (
        <Container>
            <Form id="reportParams">
                <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
                    <Form.Label column sm="2">
                        Report Date
                    </Form.Label>
                    <Col sm="4">
                        <Form.Control type="date" data-date-format="YYYY MMMM DD" id="ReportDate" value={reportDate} />
                    </Col>
                    <Col sm="4"></Col>
                    <Col sm="1">
                        <Button onClick={fetchReportData}>Submit</Button>
                    </Col>
                    <Col sm="1">
                        <Button onClick={downloadPDFReport}>Download</Button>
                    </Col>
                </Form.Group>
            </Form>
            <Accordion defaultActiveKey="0">
                {
                    Object.keys(reports).map((key, index) => {
                        return <Accordion.Item eventKey={index.toString()}>
                            <Accordion.Header>{key}</Accordion.Header>
                            <Accordion.Body>
                                {
                                    ((reports as any)[key] as []).map((item, itemIndex) => {
                                        return <Accordion>
                                            <AccordionItem eventKey={itemIndex.toString()}>
                                                <Accordion.Header>{item['project_name']}</Accordion.Header>
                                                <Accordion.Body>
                                                    <Tabs
                                                        id={itemIndex.toString()}
                                                        activeKey={tabKey}
                                                        onSelect={(k:any)=>setTabKey(k)}
                                                        className="mb-3"
                                                    >
                                                        <Tab eventKey="basic" title="Basic">
                                                            <Table striped="columns">
                                                                <tbody>
                                                                    <tr> 
                                                                        <td>Proponent</td>
                                                                        <td>{item['proponent']}</td>
                                                                    </tr>
                                                                    <tr> 
                                                                        <td>Region</td>
                                                                        <td>{item['region']}</td>
                                                                    </tr>
                                                                    <tr> 
                                                                        <td>Location</td>
                                                                        <td>{item['location']}</td>
                                                                    </tr>
                                                                    <tr> 
                                                                        <td>EA Type</td>
                                                                        <td>
                                                                            {item['ea_act']}
                                                                            {item['substitution_act']?', '+item['substitution_act']:''}
                                                                        </td>
                                                                    </tr>
                                                                    <tr> 
                                                                        <td>Responsible Minister</td>
                                                                        <td>{item['ministry_name']}</td>
                                                                    </tr>
                                                                    <tr> 
                                                                        <td>Decision to be made by</td>
                                                                        <td>{item['decision_by']}</td>
                                                                    </tr>
                                                                </tbody>
                                                            </Table>
                                                        </Tab>
                                                        <Tab eventKey="description" title="Project Description">
                                                            {item['project_description']}
                                                        </Tab>
                                                        <Tab eventKey="decision" title="Anticipated Referral Date/Next PCP/Additional Information">
                                                        <Table striped="columns">
                                                                <tbody>
                                                                    <tr> 
                                                                        <td>Referral Date</td>
                                                                        <td>{item['referral_date']}</td>
                                                                    </tr>
                                                                    <tr> 
                                                                        <td>Updated Date</td>
                                                                        <td>{item['date_updated']}</td>
                                                                    </tr>
                                                                    <tr> 
                                                                        <td>Additional Info</td>
                                                                        <td>{item['additional_info']}</td>
                                                                    </tr>
                                                                </tbody>
                                                            </Table>
                                                        </Tab>
                                                    </Tabs>
                                                </Accordion.Body>
                                            </AccordionItem>
                                        </Accordion>
                                    })
                                }
                            </Accordion.Body>
                        </Accordion.Item>
                    })
                }

            </Accordion>
        </Container>
    )
}