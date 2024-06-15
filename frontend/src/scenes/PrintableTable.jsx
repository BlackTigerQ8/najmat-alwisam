import React, { forwardRef } from 'react';
import {PrintLogo} from './PrintLogo';
import styles from './Print.module.css'
import './basePrint.css';

const PrintableTable = forwardRef(({ rows, columns }, ref) => {

    const getColumnValue = (row, column) =>{

        const value =  row[column.field]

        if(column.valueFormatter){
            return column.valueFormatter({value})
        }

        return value
    }

  return (
    <div ref={ref} className={styles.table}>
        <PrintLogo />
      <table>
        <thead>
          <tr style={{backgroundColor: '#8298c0'}}>
            {columns.map((column) => (
              <th key={column.field} >{column.headerName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row._id}>
              {columns.map((column) => (
                <td key={column.field} style={{textAlign:  'center'}}>
                  {column.renderCell ? column.renderCell({ row }) : getColumnValue(row, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default PrintableTable;
