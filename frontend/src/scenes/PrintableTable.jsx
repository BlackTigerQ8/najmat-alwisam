import React, { forwardRef } from "react";
import { PrintLogo } from "./PrintLogo";
import styles from "./Print.module.css";
import "./basePrint.css";
import { useTranslation } from "react-i18next";

const PrintableTable = forwardRef(
  ({ rows, columns, orientation = "portrait" }, ref) => {
    const { t } = useTranslation();

    React.useEffect(() => {
      document.documentElement.style.setProperty(
        "--print-orientation",
        orientation
      );
      return () => {
        document.documentElement.style.removeProperty("--print-orientation");
      };
    }, [orientation]);

    const getColumnValue = (row, column) => {
      const value = row[column.field];

      if (column.valueFormatter) {
        return column.valueFormatter({ value });
      }

      return value;
    };

    const printableColumns = columns.filter(
      (column) => column.field !== "actions"
    );

    return (
      <div ref={ref} className={styles.table}>
        <PrintLogo />
        <table>
          <thead>
            <tr style={{ backgroundColor: "#8298c0" }}>
              {printableColumns.map((column) => (
                <th key={column.field}>{column.headerName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row._id}>
                {printableColumns.map((column) => (
                  <td key={column.field} style={{ textAlign: "center" }}>
                    {column.renderCell
                      ? column.renderCell({ row })
                      : getColumnValue(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.signatures}>
          <div className={styles.signature}>
            <div className={styles.signatureLine}></div>
            <div>{t("AccountantSignature")}</div>
          </div>
          <div className={styles.signature}>
            <div className={styles.signatureLine}></div>
            <div>{t("managerSignature")}</div>
          </div>
        </div>
      </div>
    );
  }
);

export default PrintableTable;
