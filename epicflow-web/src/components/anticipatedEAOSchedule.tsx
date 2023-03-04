import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Col, Row, Button, Accordion, Tabs, Tab, Table, Container, Alert, Placeholder } from 'react-bootstrap';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import ReportService from '../services/reportService';
import { ResultStatus, DateFormat } from '../constants/application-constant';
import moment from 'moment';

export default function AnticipatedEAOSchedule({ ...props }) {
    const [reports, setReports] = useState({});
    const [tabKey, setTabKey] = useState('basic');
    const [reportDate, setReportDate] = useState();
    const [resultStatus, setResultStatus] = useState<string>();
    const { register, trigger, formState: { errors, isValid } } = useForm({
        mode: 'onChange'
    });
    const formatDate = (date: string) => {
        return moment(date).format(DateFormat);
    }
    const fetchReportData = async () => {
        trigger();
        if(isValid) {
            setResultStatus(ResultStatus.LOADING);
            try {
                const reportData = await ReportService.fetchReportData(props.apiUrl, 'ea_anticipated_schedule', {
                    report_date: reportDate
                });
                setResultStatus(ResultStatus.LOADED);
                if (reportData.status === 200) {
                    setReports(reportData.data as never);
                }
    
                if (reportData.status === 204) {
                    setResultStatus(ResultStatus.NO_RECORD);
                }
            } catch (error) {
                setResultStatus(ResultStatus.ERROR);
            }
        }
    }
    const downloadPDFReport = async () => {
        trigger();
        if(isValid){
            try{
                const binaryReponse = await ReportService.downloadPDF(props.apiUrl, 'ea_anticipated_schedule', {
                    report_date: reportDate
                });
                const url = window.URL.createObjectURL(new Blob([(binaryReponse as any).data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Anticipated_EA_Referral_Schedule-${formatDate(reportDate?reportDate:new Date().toISOString())}.pdf`);
                document.body.appendChild(link);
                console.log((binaryReponse as any));
                link.click();
            }catch(error){
                setResultStatus(ResultStatus.ERROR);
            }
        }
    }
    return (
        <>
            <Form id="reportParams" onSubmit={(e)=>e.preventDefault()}>
                <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
                    <Form.Label column sm="2">
                        Report Date
                    </Form.Label>
                    <Col sm="4">
                        <Form.Control type="date" data-date-format="YYYY MMMM DD" id="ReportDate"
                            {...register('ReportDate', { required: 'Report date is required' })}
                            onChangeCapture={(e: any) => setReportDate(e.target.value)} />
                        <Form.Control.Feedback type='invalid'>
                            Please select the report date
                        </Form.Control.Feedback>
                        {errors.ReportDate && <div style={{color:'red'}}>Please select the report date</div>}
                    </Col>
                    <Col sm="4"></Col>
                    <Col sm="1">
                        <Button type='submit'  onClick={fetchReportData}>Submit</Button>
                    </Col>
                    <Col sm="1">
                        {resultStatus === ResultStatus.LOADED &&  <Button onClick={downloadPDFReport}>Download</Button> }
                    </Col>
                </Form.Group>
            </Form>
            {resultStatus === ResultStatus.LOADED && <Accordion defaultActiveKey="0">
                {
                    Object.keys(reports).map((key, index) => {
                        return <Accordion.Item key={index} eventKey={index.toString()}>
                            <Accordion.Header>{key}</Accordion.Header>
                            <Accordion.Body>
                                {
                                    ((reports as any)[key] as []).map((item, itemIndex) => {
                                        return <Accordion key={itemIndex}>
                                            <Accordion.Item eventKey={itemIndex.toString()}>
                                                <Accordion.Header>{item['project_name']}</Accordion.Header>
                                                <Accordion.Body>
                                                    <Tabs
                                                        id={itemIndex.toString()}
                                                        activeKey={tabKey}
                                                        onSelect={(k: any) => setTabKey(k)}
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
                                                                            {item['substitution_act'] ? ', ' + item['substitution_act'] : ''}
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
                                                                        <td>{item['milestone_type'] === 4 ? 'Referral Date' : 'Decision Date'}</td>
                                                                        <td>{formatDate(item['referral_date'])}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>Updated Date</td>
                                                                        <td>{formatDate(item['date_updated'])}</td>
                                                                    </tr>
                                                                    {
                                                                        item['next_pecp_date'] !== null &&
                                                                        <tr>
                                                                            <td>Next PECP Date</td>
                                                                            <td>{formatDate(item['next_pecp_date'])}</td>
                                                                        </tr>
                                                                    }
                                                                    {
                                                                        item['next_pecp_title'] !== null &&
                                                                        <tr>
                                                                            <td>PECP Title</td>
                                                                            <td>{item['next_pecp_title']}</td>
                                                                        </tr>
                                                                    }
                                                                    {
                                                                        item['next_pecp_short_description'] !== null &&
                                                                        <tr>
                                                                            <td>PECP Description</td>
                                                                            <td>{item['next_pecp_short_description']}</td>
                                                                        </tr>
                                                                    }
                                                                    <tr>
                                                                        <td>Additional Info</td>
                                                                        <td>{item['additional_info']}</td>
                                                                    </tr>
                                                                </tbody>
                                                            </Table>
                                                        </Tab>
                                                    </Tabs>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        </Accordion>
                                    })
                                }
                            </Accordion.Body>
                        </Accordion.Item>
                    })
                }

            </Accordion>}
            {resultStatus === ResultStatus.NO_RECORD &&
                <Container>
                    <Alert>
                        No Records Found
                    </Alert>
                </Container>}
            {resultStatus === ResultStatus.ERROR &&
                <Container>
                    <Alert variant='danger'>
                        Error occured during processing. Please try again after some time.
                    </Alert>
                </Container>}
            {resultStatus === ResultStatus.LOADING &&
                <Container>
                    <Placeholder as="p" animation="glow">
                        <Placeholder xs={12} />
                    </Placeholder>
                    <Placeholder as="p" animation="wave">
                        <Placeholder xs={12} />
                    </Placeholder>
                </Container>}
        </>
    )
}