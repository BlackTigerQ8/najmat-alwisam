import React, { forwardRef } from "react";
import { PrintLogo } from "./PrintLogo";
import styles from "./Print.module.css";
import "./basePrint.css";
import { useTranslation } from "react-i18next";

const PrintableTable = forwardRef(
  ({ rows, columns, orientation = "portrait", summary, page }, ref) => {
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

      if (value === undefined || value === null) {
        return "";
      }

      // Handle numeric values
      if (column.type === "number") {
        const num = Number(value);
        if (!isNaN(num)) {
          return formatNegativeNumber(num);
        }
      }

      if (column.valueFormatter) {
        return column.valueFormatter({ value });
      }

      return value;
    };

    const printableColumns = columns.filter(
      (column) => column.field !== "actions"
    );

    // Define signatures based on page type
    const pettyCashSignatures = [
      {
        ar: t("pettyCashManagerSignature"),
        en: t("pettyCashManagerSignature"),
      },
      { ar: t("pettyCashOfficeSignature"), en: t("pettyCashOfficeSignature") },
      {
        ar: t("pettyCashApplicantSignature"),
        en: t("pettyCashApplicantSignature"),
      },
    ];

    const defaultSignatures = [
      { ar: t("managerSignature"), en: t("managerSignature") },
      { ar: t("AccountantSignature"), en: t("AccountantSignature") },
    ];

    const signatures =
      page === "pettyCash" ? pettyCashSignatures : defaultSignatures;

    const formatNegativeNumber = (value) => {
      // Handle undefined, null, or empty values
      if (value === undefined || value === null || value === "") {
        return "";
      }

      // Convert to number, handling string numbers
      const num = typeof value === "string" ? parseFloat(value) : Number(value);

      // Check if the conversion resulted in a valid number
      if (isNaN(num)) {
        return value; // Return original value if not a valid number
      }

      // Format negative numbers
      if (num < 0) {
        return (
          <span className={styles.negativeNumber}>
            ({Math.abs(num).toLocaleString()})
          </span>
        );
      }

      // Format positive numbers
      return num.toLocaleString();
    };

    return (
      <div
        ref={ref}
        className={`${styles.table} ${
          orientation === "landscape" ? styles.printLandscape : ""
        }`}
      >
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
                {printableColumns.map((column) => {
                  // Debug log
                  console.log(
                    "Column:",
                    column.field,
                    "Value:",
                    row[column.field]
                  );

                  return (
                    <td key={column.field} style={{ textAlign: "center" }}>
                      {column.renderCell
                        ? column.renderCell({
                            row: row, // Pass the full row
                            value: row[column.field], // And the specific value
                          })
                        : typeof row[column.field] === "number"
                        ? formatNegativeNumber(row[column.field])
                        : getColumnValue(row, column)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary Section */}
        {summary && (
          <div className={styles.summary}>
            <div className={styles.summaryBox}>
              {/* For BankStatement page */}
              {page === "bankStatement" && (
                <>
                  <div className={styles.summaryItem}>
                    <span>{t("totalWithdrawals")}: </span>
                    <strong>
                      {summary.totalSpends}
                      <span> {t("kd")} </span>
                    </strong>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>{t("totalDeposits")}: </span>
                    <strong>
                      {summary.totalDeposits}
                      <span> {t("kd")} </span>
                    </strong>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>{t("currentBalance")}: </span>
                    <strong>
                      {summary.totalBalance}
                      <span> {t("kd")} </span>
                    </strong>
                  </div>
                </>
              )}

              {/* For PettyCash page */}
              {page === "pettyCash" && (
                <>
                  <div className={styles.summaryItem}>
                    <span>{t("totalAmountOnWorkers")}: </span>
                    <strong>
                      {summary.totalAmountOnWorker}
                      <span> {t("kd")} </span>
                    </strong>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>{t("totalAmountOnCompany")}: </span>
                    <strong>
                      {summary.totalAmountOnCompany}
                      <span> {t("kd")} </span>
                    </strong>
                  </div>
                </>
              )}
              {/* For EmployeesSalary page */}
              {summary.netEmployeesSalaries !== undefined && (
                <div className={styles.summaryItem}>
                  <span>{t("employeesTotalNetSalary")}: </span>
                  <strong>
                    {summary.netEmployeesSalaries}
                    <span> {t("kd")} </span>
                  </strong>
                </div>
              )}

              {/* For DriversSalary page */}
              {summary.totalMonthlySalary !== undefined && (
                <>
                  <div className={styles.summaryItem}>
                    <span>{t("carDriversTotalNetSalary")}: </span>
                    <strong>
                      {summary.netCarDriversSalary}
                      <span> {t("kd")} </span>
                    </strong>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>{t("bikeDriversTotalNetSalary")}: </span>
                    <strong>
                      {summary.netBikeDriversSalary}
                      <span> {t("kd")} </span>
                    </strong>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>{t("totalMonthlySalary")}: </span>
                    <strong>
                      {summary.totalMonthlySalary}
                      <span> {t("kd")} </span>
                    </strong>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>{t("totalMonthlyDeduction")}: </span>
                    <strong>
                      {summary.totalMonthlyDeduction}
                      <span> {t("kd")} </span>
                    </strong>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>{t("totalNetSalary")}: </span>
                    <strong>
                      {summary.totalNetSalary}
                      <span> {t("kd")} </span>
                    </strong>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Signatures Section */}
        <div className={styles.signatures}>
          {signatures.map((signature, index) => (
            <div key={index} className={styles.signature}>
              <div className={styles.signatureLine}></div>
              <div>
                {t("currentLanguage") === "ar" ? signature.ar : signature.en}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

export default PrintableTable;
