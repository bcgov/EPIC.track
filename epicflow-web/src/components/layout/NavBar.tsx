import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link } from 'react-router-dom';
export default function NavBar() {
    return (
        <Navbar bg="light" expand="lg">
            <Container>
                <Navbar.Brand href="#home">EPIC FLOW - Reports</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="#home">Home</Nav.Link>
                        <NavDropdown title="Reports" id="basic-nav-dropdown">
                            <Link to="/anticipated-eao-schedule">Referral</Link>
                            <NavDropdown.Item href="/anticipated-eao-schedule-sm">Referal Schedule-SM</NavDropdown.Item>
                            <NavDropdown.Item href="/report-selector">Select Report</NavDropdown.Item>
                            <NavDropdown.Item href="/staff">Staff</NavDropdown.Item>
                            <NavDropdown.Item as={Link}  to="/staff-list">Staff List</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}