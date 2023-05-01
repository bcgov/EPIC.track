import React from 'react';
import WCBaseELement from './wcBase';
import StaffList from '../../components/staff/list/staffList';

export class StaffListWC extends WCBaseELement {
  constructor() {
    super(StaffList);
  }
}
customElements.define('staff-list-wc', StaffListWC);