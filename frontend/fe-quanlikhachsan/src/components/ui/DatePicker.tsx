import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './DatePicker.module.css';

interface DatePickerProps {
  id?: string;
  selected: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholderText?: string;
  dateFormat?: string;
  required?: boolean;
}

export function DatePicker({
  id,
  selected,
  onChange,
  minDate,
  maxDate,
  placeholderText,
  dateFormat = 'dd/MM/yyyy',
  required
}: DatePickerProps) {
  return (
    <div className={styles.wrapper}>
      <ReactDatePicker
        id={id}
        selected={selected}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        placeholderText={placeholderText}
        dateFormat={dateFormat}
        required={required}
        className={styles.datePicker}
        calendarClassName={styles.calendar}
        showPopperArrow={false}
        popperPlacement="bottom-start"
      />
    </div>
  );
} 