import React, { forwardRef } from "react";
import { PrintLogo } from "./PrintLogo";
import styles from "./Print.module.css";
import "./basePrint.css";
import { useTranslation } from "react-i18next";

const PrintableTable = forwardRef(
  (
    {
      rows,
      columns,
      orientation = "portrait",
      summary,
      page,
      availableAccounts,
    },
    ref
  ) => {
    const { t } = useTranslation();

    // Current date formatting
    const currentDate = new Date().toLocaleDateString("ar-KW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const formatPhoneNumber = (phone) => {
      if (!phone) return "";
      return phone.toString().replace(/[,\s]/g, "");
    };

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
      if (column.field === "id") {
        return row.identification || row.idNumber || "";
      }

      if (column.field === "phone") {
        const phoneValue = row[column.field];
        if (!phoneValue) return "";
        // Remove any commas, spaces, or other formatting
        return phoneValue.toString().replace(/[\s,.-]/g, "");
      }

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

    if (page === "bankStatement") {
      // Filter rows to only include existing accounts
      const validRows = rows.filter((row) =>
        availableAccounts?.some(
          (account) => account.accountNumber === row.bankAccountNumber
        )
      );

      // Group rows by bank account
      const accountGroups = validRows.reduce((groups, row) => {
        const accountNumber = row.bankAccountNumber;
        if (!groups[accountNumber]) {
          groups[accountNumber] = [];
        }
        groups[accountNumber].push(row);
        return groups;
      }, {});

      return (
        <div
          ref={ref}
          className={`${styles.table} ${
            orientation === "landscape" ? styles.printLandscape : ""
          }`}
        >
          {/* Map through only available accounts */}
          {Object.entries(accountGroups).map(([accountNumber, accountRows]) => {
            // Find account name from available accounts
            const account = availableAccounts?.find(
              (acc) => acc.accountNumber === Number(accountNumber)
            );

            // Skip if account doesn't exist
            if (!account) return null;

            const accountName = t(account.accountName);

            // Calculate account totals
            const accountTotals = {
              deposits: accountRows.reduce(
                (sum, row) => sum + Number(row.deposits || 0),
                0
              ),
              spends: accountRows.reduce(
                (sum, row) => sum + Number(row.spends || 0),
                0
              ),
              balance: accountRows.reduce(
                (sum, row) =>
                  sum + (Number(row.deposits || 0) - Number(row.spends || 0)),
                0
              ),
            };

            return (
              <div key={accountNumber} className={styles.pageContainer}>
                <div className={styles.headerSection}>
                  <PrintLogo />
                  <div className={styles.companyTitle}>
                    مؤسسة نجمة الوسام لتوصيل الطلبات
                  </div>
                  <div className={styles.currentDate}>{currentDate}</div>
                </div>
                <h2 className={styles.accountTitle}>{accountName}</h2>
                <table>
                  <thead>
                    <tr style={{ backgroundColor: "#8298c0" }}>
                      {printableColumns.map((column) => (
                        <th key={column.field}>{column.headerName}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {accountRows.map((row) => (
                      <tr key={row._id}>
                        {printableColumns.map((column) => (
                          <td
                            key={column.field}
                            style={{ textAlign: "center" }}
                          >
                            {column.renderCell
                              ? column.renderCell({
                                  row: row,
                                  value: row[column.field],
                                })
                              : typeof row[column.field] === "number"
                              ? column.field === "phone" ||
                                column.field === "رقم الهاتف" ||
                                column.field === "رقم الموظف" // Add all possible field names
                                ? formatPhoneNumber(row[column.field])
                                : formatNegativeNumber(row[column.field])
                              : getColumnValue(row, column)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Account Summary */}
                <div className={styles.summary}>
                  <div className={styles.summaryBox}>
                    <div className={styles.summaryItem}>
                      <span>{t("totalWithdrawals")}: </span>
                      <strong>
                        {formatNegativeNumber(accountTotals.spends)}
                        <span> {t("kd")} </span>
                      </strong>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>{t("totalDeposits")}: </span>
                      <strong>
                        {formatNegativeNumber(accountTotals.deposits)}
                        <span> {t("kd")} </span>
                      </strong>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>{t("currentBalance")}: </span>
                      <strong>
                        {formatNegativeNumber(accountTotals.balance)}
                        <span> {t("kd")} </span>
                      </strong>
                    </div>
                  </div>
                </div>

                <div className={styles.signatures}>
                  {signatures.map((signature, index) => (
                    <div key={index} className={styles.signature}>
                      <div className={styles.signatureLine}></div>
                      <div>
                        {t("currentLanguage") === "ar"
                          ? signature.ar
                          : signature.en}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`${styles.table} ${
          orientation === "landscape" ? styles.printLandscape : ""
        }`}
      >
        <div className={styles.headerSection}>
          <PrintLogo />
          <div className={styles.companyTitle}>
            مؤسسة نجمة الوسام لتوصيل الطلبات
          </div>
          <div className={styles.currentDate}>{currentDate}</div>
        </div>
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
                      ? column.renderCell({
                          row: row,
                          value: row[column.field],
                        })
                      : typeof row[column.field] === "number"
                      ? column.field === "phone" ||
                        column.field === "رقم الهاتف" ||
                        column.field === "رقم الموظف" // Add all possible field names
                        ? formatPhoneNumber(row[column.field])
                        : formatNegativeNumber(row[column.field])
                      : getColumnValue(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary Section */}
        <div className={styles.bottomSection}>
          {summary && (
            <div className={styles.summary}>
              <div className={styles.summaryBox}>
                {/* Add Salary Report summary section */}
                {summary.totalSalary !== undefined && (
                  <>
                    <div className={styles.summaryItem}>
                      <span>{t("totalSalary")}: </span>
                      <strong>
                        {Number(summary.totalSalary || 0).toFixed(3)}
                        <span> {t("kd")} </span>
                      </strong>
                    </div>
                  </>
                )}

                {/* For CoSpends main summary */}
                {page === "coSpends" && (
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
                    <div className={styles.summaryItem}>
                      <span>{t("totalSpends")}: </span>
                      <strong>
                        {summary.totalSpends}
                        <span> {t("kd")} </span>
                      </strong>
                    </div>
                  </>
                )}

                {/* For CoSpends details */}
                {page === "coSpendsDetails" && (
                  <>
                    <div className={styles.summaryItem}>
                      <span>{t("spendType")}: </span>
                      <strong>{summary.spendTypeName}</strong>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>{t("totalAmount")}: </span>
                      <strong>
                        {summary.totalAmount}
                        <span> {t("kd")} </span>
                      </strong>
                    </div>
                  </>
                )}

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
                    <div className={styles.summaryItem}>
                      <span>{t("totalSpends")}: </span>
                      <strong>
                        {summary.totalSpends}
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
                        {(summary.netCarDriversSalary || 0).toFixed(3)}
                        <span> {t("kd")} </span>
                      </strong>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>{t("bikeDriversTotalNetSalary")}: </span>
                      <strong>
                        {(summary.netBikeDriversSalary || 0).toFixed(3)}
                        <span> {t("kd")} </span>
                      </strong>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>{t("totalMonthlySalary")}: </span>
                      <strong>
                        {(summary.totalMonthlySalary || 0).toFixed(3)}
                        <span> {t("kd")} </span>
                      </strong>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>{t("totalMonthlyDeduction")}: </span>
                      <strong>
                        {(summary.totalMonthlyDeduction || 0).toFixed(3)}
                        <span> {t("kd")} </span>
                      </strong>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>{t("totalNetSalary")}: </span>
                      <strong>
                        {(summary.totalNetSalary || 0).toFixed(3)}
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
      </div>
    );
  }
);

export default PrintableTable;
