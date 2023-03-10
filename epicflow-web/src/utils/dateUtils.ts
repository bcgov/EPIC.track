import moment from 'moment';
import { DATE_FORMAT } from '../constants/application-constant';

/**
 * 
 * @param date Input date string
 * @param format Valid date format
 * @returns Formatted date string
 */
const formatDate = (date: string, format?: string) => {
    return moment(date).format(format || DATE_FORMAT);
}

export default {
    formatDate
}