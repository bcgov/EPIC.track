import React, { useEffect, useState } from "react";
// import { Form, Col, Row, Button, Container, Accordion, Tabs, Tab, Table } from 'react-bootstrap';
import { Form, Label, GridColumn, GridRow, Button, Container, Accordion, Tab, Table } from 'semantic-ui-react';
import AccordionItem from "react-bootstrap/esm/AccordionItem";
// import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../../node_modules/semantic-ui-css/semantic.min.css';
import ReportService from "../services/reportService";

export default function AnticipatedEAOScheduleSemantic({ ...props }) {
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
    const downloadPDFReport = async () => {
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
    const renderTabs = (item: any) => {
        return [
            {
                menuItem: 'Basic',
                render: () => 
                    <Tab.Pane active>
                        <Table celled>
                            <Table.Body>
                                <Table.Row>
                                    <Table.Cell active>Proponent</Table.Cell>
                                    <Table.Cell>{item['proponent']}</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell active>Region</Table.Cell>
                                    <Table.Cell>{item['region']}</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell active>Location</Table.Cell>
                                    <Table.Cell>{item['location']}</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell active>EA Type</Table.Cell>
                                    <Table.Cell>{item['ea_act']}
                                        {item['substitution_act'] ? ', ' + item['substitution_act'] : ''}</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell active>Responsible Minister</Table.Cell>
                                    <Table.Cell>{item['ministry_name']}</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell active>Decision to be made by</Table.Cell>
                                    <Table.Cell>{item['decision_by']}</Table.Cell>
                                </Table.Row>
                            </Table.Body>
                        </Table>
                    </Tab.Pane>
                
            },
            {
                menuItem: 'Project Description',
                render: () => 
                    <Tab.Pane>
                            {item['project_description']}
                        </Tab.Pane>
                
            },
            {
                menuItem: 'Anticipated Referral Date/Next PCP/Additional Information',
                render: ()=>
                    <Tab.Pane>
                            <Table celled>
                                <Table.Body>
                                    <Table.Row>
                                        <Table.Cell active>Referral Date</Table.Cell>
                                        <Table.Cell>{item['referral_date']}</Table.Cell>
                                    </Table.Row>
                                    <Table.Row>
                                        <Table.Cell active>Updated Date</Table.Cell>
                                        <Table.Cell>{item['date_updated']}</Table.Cell>
                                    </Table.Row>
                                    <Table.Row>
                                        <Table.Cell active>Additional Info</Table.Cell>
                                        <Table.Cell>{item['additional_info']}</Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table>
                        </Tab.Pane>
                }
            
        ]
    }
    const renderProjectPanels = (key: string) => {
        const projectPanels = ((reports as any)[key] as []).map((item, itemIndex) => {
            return {
                key: itemIndex,
                title: item['project_name'],
                content: {content: <Tab panes={renderTabs(item)}></Tab>}
            }
        });
        return <div><Accordion.Accordion panels={projectPanels}></Accordion.Accordion></div>
    }
    const renderAccordion = () => {
        const rows = Object.keys(reports).map((key, index) => {
            return {
                key: index,
                title: {content: <Label color='blue' content={key}/>},
                content: { content: renderProjectPanels(key) }
            }
        })
        return rows;
    }
    return (
        <Container>
            <Form id="reportParams">
                <Form.Group inline>
                    <label>Report Date</label>
                    <Form.Input type="date" data-date-format="YYYY MMMM DD" id="ReportDate" value={reportDate} />
                </Form.Group>
                <Button onClick={fetchReportData}>Get Report</Button>
            </Form>
            <Accordion panels={renderAccordion()}>

            </Accordion>
        </Container>
    )
}