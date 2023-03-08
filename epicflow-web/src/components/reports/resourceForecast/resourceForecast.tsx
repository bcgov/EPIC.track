import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Row, Table } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { RESULT_STATUS, REPORT_TYPE } from '../../../constants/application-constant';
import ReportService from '../../../services/reportService';
import rf_data from '../../rf.json';
// import Select from 'react-select';

export default function ResourceForecast({ ...props }) {
    const [reportDate, setReportDate] = useState();
    const [resultStatus, setResultStatus] = useState<string>();
    const [rfData, setRFData] = useState<any[]>([]);

    const { register, trigger, formState: { errors, isValid } } = useForm({
        mode: 'onChange'
    });

    const fetchReportData = async () => {
        trigger();
        if (isValid) {
            setResultStatus(RESULT_STATUS.LOADING);
            try {
                const reportData = await ReportService.fetchReportData(props.apiUrl, REPORT_TYPE.RESOURCE_FORECAST, {
                    report_date: reportDate
                    // filters: {
                    //     exclude: filter
                    // }
                });
                setResultStatus(RESULT_STATUS.LOADED);
                if (reportData.status === 200) {
                    setRFData((reportData.data as never)['data']);
                }
                console.log(rfData);
                if (reportData.status === 204) {
                    setResultStatus(RESULT_STATUS.NO_RECORD);
                }
            } catch (error) {
                setResultStatus(RESULT_STATUS.ERROR);
            }
        }
    }
    return (
        <>
            <Form id="reportParams" onSubmit={(e) => e.preventDefault()}>
                <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
                    <Form.Label column sm={2}>
                        Report Date
                    </Form.Label>
                    <Col sm="2">
                        <Form.Control type="date" data-date-format="YYYY MMMM DD" id="ReportDate"
                            {...register('ReportDate', { required: 'Report date is required' })}
                            onChangeCapture={(e: any) => setReportDate(e.target.value)} />
                        <Form.Control.Feedback type='invalid'>
                            Please select the report date
                        </Form.Control.Feedback>
                        {errors.ReportDate && <div style={{ color: 'red' }}>Please select the report date</div>}
                    </Col>
                    {/* <Form.Label column sm={2}>
                        Filters
                    </Form.Label> */}
                    <Col sm="4">
                    </Col>
                    <Col sm="1">
                        <Button type='submit' onClick={fetchReportData}>Submit</Button>
                    </Col>
                    <Col sm="1">
                        {/* {resultStatus === RESULT_STATUS.LOADED && <Button onClick={downloadPDFReport}>Download</Button>} */}
                    </Col>
                </Form.Group>
            </Form>
            {rfData && rfData.length > 0 && <Table responsive bordered striped>
                <thead>
                    <tr>
                        <th>Project</th>
                        <th>EA Type</th>
                        <th>Project Phase</th>
                        <th>EA Act</th>
                        <th>IAAC</th>
                        <th>Sector (Sub)</th>
                        <th>ENV Region</th>
                        <th>NRS Region</th>
                        <th>EPD Lead</th>
                        {
                            (rfData[0]['months'] as []).map((rfMonth, rfMonthIndex) => (
                                <th key={rfMonthIndex}>
                                    {rfMonth['label']}
                                </th>
                            ))
                        }
                    </tr>
                </thead>
                <tbody>
                    {rfData.map((rf, rfIndex) => (
                        <tr key={rfIndex}>
                            <td>
                                {rf['project_name']}
                            </td>
                            <td>
                                {rf['ea_type']}
                            </td>
                            <td>
                                {rf['project_phase']}
                            </td>
                            <td>
                                {rf['ea_act']}
                            </td>
                            <td>
                                {rf['iaac']}
                            </td>
                            <td>
                                {`${rf['type']} (${rf['sub_type']})`}
                            </td>
                            <td>
                                {rf['env_region']}
                            </td>
                            <td>
                                {rf['nrs_region']}
                            </td>
                            <td>
                                {rf['work_lead']}
                            </td>
                            <td style={{ background: rf['months'][0]['color'] }}>
                                {rf['months'][0]['phase']}
                            </td>
                            <td style={{ background: rf['months'][0]['color'] }}>
                                {rf['months'][1]['phase']}
                            </td>
                            <td style={{ background: rf['months'][0]['color'] }}>
                                {rf['months'][2]['phase']}
                            </td>
                            <td style={{ background: rf['months'][0]['color'] }}>
                                {rf['months'][3]['phase']}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>}
        </>
    );
}