import React from 'react';
import ReportSelector from '../../components/reportSelector';
import WCBaseELement from './wcBase';

export class ReportSelectorWC extends WCBaseELement {
  constructor() {
    super(ReportSelector);
  }
}
customElements.define('report-selector-wc', ReportSelectorWC);