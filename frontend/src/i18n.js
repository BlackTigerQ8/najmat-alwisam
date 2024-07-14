import i18n, { changeLanguage } from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          welcome: "Welcome",
          pages: "Pages",
          dashboard: "Dashboard",
          DHASBOARD: "DASHBOARD",
          dashboardSubtitle: "Welcome to your dashboard",
          TEAM: "TEAM",
          DRIVERS: "DRIVERS",
          driverFormTitle: "ADD DRIVER",
          driverFormSubtitle: "Add a New Driver",
          NOTIFICATIONS: "NOTIFICATIONS",
          notificationTitle: "Important Notifications Page",
          deductionSalaryTitle: "DEDUCTION SALARY",
          manageTeamMembers: "Managing the Team Members",
          manageDriverMembers: "Managing the Drivers",
          deductionSalaryRequest: "Deduction Salary Requests Page",
          manageTeam: "Manage Team",
          manageDrivers: "Manage Drivers",
          userProfileTitle: "USER PROFILE",
          userProfileSubtitle: "View/Update User Information",
          deductionInvoices: "Deduction Invoices",
          driversInvoices: "Drivers Invoices",
          notifications: "Notifications",
          settings: "Settings",
          forms: "Forms",
          profileForm: "Team Form",
          driversForm: "Drivers Form",
          deduction: "Deduction",
          contact: "Contact",
          messages: "Messages",
          invoicesArchive: "Invoices Archive",
          invoicesArchiveSubtitle: "List of archived invoices",
          message: "Message",
          send: "Send",
          companyFiles: "Company Files",
          companyFilesSubtitle: "Company Files Page",
          data: "Data",
          role: "Role",
          admins: "ADMINS",
          Admin: "Admin",
          Manager: "Manager",
          Accountant: "Accountant",
          Employee: "Employee",
          driver: "Driver",
          drivers: "Drivers",
          login: "LOGIN",
          logout: "Logout",
          loggingIn: "Logging in...",
          /////////////
          email: "Email",
          password: "Password",
          confirmPassword: "Confirm Password",
          createNewUser: "Create New User",
          phone: "Phone Number",
          name: "Name",
          civilId: "Civil ID",
          passport: "Passport",
          mainSalary: "Main Salary",
          accessLevel: "Access Level",
          actions: "Actions",
          /////////////
          required: "required",
          firstName: "First Name",
          lastName: "Last Name",
          optionalEmail: "Email (optional)",
          idNumber: "ID Number",
          idExpiryDate: "ID Expiry Date",
          passportExpiryDate: "Passport Expiry Date",
          contractExpiryDate: "Contract Expiry Date",
          driverLicenseExpiryDate: "Driver License Expiry Date",
          carPlateNumber: "Car Plate Number",
          carRegisteration: "Car Registeration",
          carRegisterationExpiryDate: "Car Registeration Expiry Date",
          workPass: "Work Pass",
          gasCard: "Gas Card",
          healthInsuranceExpiryDate: "Health Insurance Expiry Date",
          healthInsurance: "Health Insurance",
          carType: "Car Type",
          employeeCompanyNumber: "Employee Company Number",
          iban: "IBAN",
          vehicle: "Vehicle",
          car: "Car",
          bike: "Bike",
          contractType: "Contract Type",
          talabat: "Talabat",
          others: "Others",
          talabatId: "Talabat ID Number",
          uploadFile: "Upload File",
          viewUploadedFile: "View Uploaded File",
          update: "Update",
          delete: "Delete",
          add: "Add",
          edit: "Edit",
          addNewDriver: "Add New Driver",
          /////////////
          additionalSalary: "Additional Salary",
          talabatDeductionAmount: "Talabat Deduction Amount",
          companyDeductionAmount: "Company Deduction Amount",
          pettyCashDeductionAmount: "Petty Cash Deduction",
          deductionReason: "Deduction Reason",
          preview: "Preview",
          uploadNewFile: "Upload a New File",
          /////////////
          willExpireOn: "will expire on",
          expirationAlert: "Expiration Alert",
          /////////////
          createUserTitle: "CREATE USER",
          createUserSubtitle: "Create a New User Profile",
          /////////////
          firstNameIsRequired: "First name is required",
          lastNameIsRequired: "Last name is required",
          invalidEmail: "Invalid email",
          emailIsRequired: "Email is required",
          invalidPhoneNumber: "Invalid Phone Number",
          phoneIsRequired: "Phone number is required",
          identificationIsRequired: "ID number is required",
          passportIsRequired: "Passport number is required",
          contractExpiryDateIsRequired: "Contract expiry date is required",
          roleIsRequired: "Role selection is required",
          mainSalaryIsRequired: "Main salary is required",
          passwordMinLength: "Password minimum length is 6 characters",
          passwordIsRequired: "Password is requitred",
          passwordMustMatch: "Passwords must match",
          confirmPasswordIsRequired: "Confirm password is required",
          /////////////
          deductionTitle: "DEDUCT SALARY",
          deductionSubtitle: "Deduct Salary from Employee/Driver",
          reasonOfDeduction: "Reason of deduction",
          talabatDeductionAmountKD: "Talabat deduction amount (K.D.)",
          companyDeductionAmountKD: "Company deduction amount (K.D.)",
          submit: "Submit",
          selectUser: "Select User",
          selectDriver: "Select Driver",
          /////////////
          contactTitle: "CONTACT",
          contactSubtitle: "Contact page to contact the company team",
          /////////////
          MESSAGES: "MESSAGES",
          messagesSubtitle: "Received Messages Page",
          /////////////
          invoicesTitle: "INVOICES",
          invoices: "Invoices",
          invoicesSubtitle: "List of Invoice Balances",
          cash: "Cash",
          hours: "Hours",
          mainOrders: "Main Orders",
          additionalOrders: "Additional Orders",
          date: "Date",
          reset: "Reset",
          /////////////
          deductionInvoicesTitle: "Deduction Invoices",
          deductionInvoicesSubtitle: "Deduction Invoices Page",
          /////////////
          startingDate: "Starting Date",
          endingDate: "Ending Date",
          search: "Search",
          /////////////
          EmployeesSalaryTitle: "EMPLOYEES SALARY",
          EmployeesSalarySubtitle: "Employees Salary Page",
          startMonth: "Start Month",
          startYear: "Start Year",
          endMonth: "End Month",
          endYear: "End Year",
          print: "Print",
          remarks: "Remarks",
          netSalary: "Net Salary",
          notes: "NOTES",
          employeesTotalNetSalary: "Total net salary for the employees:",
          kd: "KD",
          /////////////
          employeesSalary: "Employees Salary",
          driversSalary: "Drivers Salary",
          bankStatement: "Bank Statement",
          pettyCash: "Petty Cash",
          spendTypes: "Spend Types",
          companySpends: "Company Spends",
          profitsAndLosses: "Profits and Losses",
          companyIncome: "Company Income",
          /////////////
          driversSalaryTitle: "DRIVERS SALARY",
          driversSalarySubtitle: "Drivers Salary Page",
          finalSalary: "Final Salary",
          salaryAdditionalOrders: "Salary (Additional Orders)",
          salaryMainOrders: "Salary (Main Orders)",
          totalOrders: "Total Orders",
          carDriversTotalNetSalary: "Total net salary for car drivers:",
          bikeDriversTotalNetSalary: "Total net salary for bike drivers:",
          totalMonthlySalary: "Total monthly salary:",
          totalMonthlyDeduction: "Total monthly deduction:",
          totalNetSalary: "Total net salary:",
          total: "Total",
          /////////////
          companySpendsTitle: "COMPANY SPENDS",
          companySpendsSubtitle: "Company Spends Page",
          from: "From",
          cashSpends: "Cash Spends",
          deductedFrom: "Deducted From",
          /////////////
          spendTypesTitle: "SPEND TYPES",
          spendTypesSubtitle: "Spend Types Page",
          addNewSpendType: "Add New Spend Type",
          /////////////
          bankStatementTitle: "BANK STATEMENT",
          bankStatementSubtitle: "Bank Statement Page",
          addNewRow: "ADD NEW ROW",
          bankAccountNumber: "Bank Account Number",
          deposits: "Deposits",
          spends: "Spends",
          checkNumber: "Check Number",
          details: "Details",
          balance: "Balance",
          totalWithdrawals: "Total withdrawals",
          totalDeposits: "Total Deposits",
          currentBalance: "Current Balance",
          /////////////
          pettyCashTitle: "PETTY CASH",
          pettyCashSubtitle: "Petty Cash Page",
          serialNumber: "Serial Number",
          requestApplicant: "Request Applicant",
          requestDate: "Request Date",
          spendsDate: "Spends Date",
          addNewPettyCash: "Add New Petty Cash",
          selectSpendType: "Select Spend Type",
          spendsReason: "Spends Reason",
          cashAmount: "Cash Amount",
          spendsRemarks: "Spends Remarks",
          startingBalance: "Starting Balance",
          saveData: "Save Data",
          totalSpends: "Total Spends",
          totalAmountOnWorkers: "Total amount on employees/drivers",
          totalAmountOnCompany: "Net amount on company",
          /////////////
          profitsAndLossesTitle: "PROFITS AND LOSSES",
          profitsAndLossesSubtitle: "Profits and Losses Page",
          addNewCompanyIncome: "Add New Company Income",
          year: "Year",
          bikeIncome: "Bike Income",
          carIncome: "Car Income",
          otherIncome: "Other Income",
          lastMonthIncome: "Last Month Income",
          lendsIncome: "Lends Income",
          moneySafeBalance: "Money Safe Balance",
          refundCompany: "Refund Company",
          refundAmount: "Refund Amount",
          selectIncomeType: "Select Income type",
          selectMonth: "Select Month",
          income: "Income",
          refund: "Refund",
          talabatCarIncome: "Talabat Car Income",
          talabatBikeIncome: "Talabat Bike Income",
          talabatOtherIncome: "Talabat Other Income",
          /////////////
          userDeletedSuccessfully: "User is successfully deleted!",
          userDeletedFailed: "Can't delete a user, you can try later!",
          userInformationUpdated: "User Information is updated successfully.",
          userInformationUdateFailed: "Something went wrong! Please try later.",
          /////////////
          totalCash: "Total Cash",
          totalHours: "Total Hours",
          revenue: "Revenue",
          revenueGenerated: "Revenue Generated",
          salesQuantity: "Sales Quantity",
          /////////////
          deactivatedDrivers: "Deactivated Drivers",
          deactivatedDriversTitle: "DEACTIVATED DRIVERS",
          deactivatedDriversSubtitle: "Deactivated Drivers Page",
          deactivate: "Deactivate",
          reactivate: "Reactivate",
          deactivationReason: "Deactivation Reason",
          /////////////
          deactivatedDriverFulfilled:
            "Driver has been deactivate successfully!",
          deactivatedDriverrejected:
            "Can't deactivate a driver, you can try later!",
          overrideDriverSalaryFulfilled:
            "Driver's information is successfully updated!",
          overrideDriverSalaryRejected:
            "Can't update a driver's information, you can try later!",
          /////////////
          updatedDriverFulfilled:
            "Driver's information is successfully updated!",
          updatedDriverRejected:
            "Can't update a driver's information, you can try later!",
          registerDriverFulfilled: "New driver is added successfully!",
          registerDriverRejected: "Can't add a driver, you can try later!",
          deleteDriverFulfilled: "Driver is successfully deleted!",
          deleteDriverRejected: "Can't delete a driver, you can try later!",
          /////////////
          changeLanguage: "Change Language",
          darkMode: "Dark Mode",
          lightMode: "Light Mode",
          noMessages: "No messages available",
          /////////////
          sendMessageFulfilled: "Message is successfully sent!",
          sendMessageRejected: "Can't send a message, you can try later!",
          updateAdditionalSalaryFulfilled: "User data is updated successfully.",
          updateAdditionalSalaryRejected:
            "Something went wrong! Please try later.",
          updateUserRejected: "Something went wrong! Please try later.",
          updateUserFulfilled: "User Information is updated successfully.",
          deleteUserRejected: "Can't delete a user, you can try later!",
          deleteUserFulfilled: "User is successfully deleted!",
          /////////////
          registerUserFulfilled: "User is added successfully!",
          registerUserRejected: "Something went wrong! Please try later!",
          profileImageFulfilled: "User profile image is uploaded successfully!",
          profileImageRejected: "Something went wrong! Please try later!",
          createUserInvoiceFulfilled: "Employee invoice is added successfully!",
          createUserInvoiceRejected: "Something went wrong! Please try later.",
          /////////////
          addSpendTypeFulfilled: "Spend type is successfully added!",
          addSpendTypeRejected: "Can't add a spend type, you can try later!",
          deleteSpendTypeFulfilled: "Spend type is successfully deleted!",
          deleteSpendTypeRejected:
            "Can't delete a spend type, you can try later!",
          /////////////
          createPettyCashFulfilled: "Petty cash is successfully added!",
          createPettyCashRejected: "Can't add a petty cash, you can try later!",
          /////////////
          createCompanyIncomeFulfilled: "Income is successfully added!",
          createCompanyIncomeRejected:
            "Can't add an income, you can try later!",
          /////////////
          addCompanyFilesFulfilled: "Company file is successfully added!",
          saveCompanyFilesSuccess: "Company file is successfully saved!",
          addCompanyFilesRejected:
            "Can't add a company file, you can try later!",
          deleteCompanyFileFulfilled: "Company file is successfully deleted!",
          deleteCompanyFileRejected:
            "Can't delete a company file, you can try later!",
          /////////////
          createBankStatementFulfilled: "Bank statement is successfully added!",
          createBankStatementRejected:
            "Can't add a bank statement, you can try later!",
          /////////////
          createDriverInvoiceFulfilled: "Driver invoice is added successfully!",
          createDriverInvoiceRejected:
            "Can't add a driver invoice, you can try later!",
          updateDriverInvoiceFulfilled:
            "Driver invoice is updated successfully!",
          updateDriverInvoiceRejected:
            "Can't update a driver invoice, you can try later!",
          updateEmployeeInvoiceFulfilled:
            "User invoice is updated successfully!",
          updateEmployeeInvoiceRejected:
            "Can't update a user invoice, you can try later!",
          resetDriverInvoicesFulfilled: "Invoices are reset successfully!",
          resetDriverInvoicesRejected:
            "Can't reset invoices, you can try later!",
          resetSingleDriverInvoiceFulfilled:
            "Driver's Invoices are reset successfully!",
          resetSingleDriverInvoiceRejected:
            "Can't reset driver's invoices, you can try later!",

          deductionAddHeading: "{{targetName}} Deduction Alert",
          deductionAddMessage:
            "{{senderName}} has made a deduction request on {{date}}",

          deductionApproveHeading: "{{targetName}} Deduction Alert",
          deductionApproveMessage:
            "{{senderName}} has approved deduction request on {{date}}",

          deductionRejectHeading: "{{targetName}} Deduction Alert",
          deductionRejectMessage:
            "{{senderName}} has rejected deduction request on {{date}}",

          deactivationHeading: "{{targetName}} Deactivation Alert",
          deactivationMessage:
            "{{senderName}} has deactivated driver on {{date}}",

          activationHeading: "{{targetName}} Activation Alert",
          activationMessage: "{{senderName}} has activated driver on {{date}}",

          newMessageHeading: "New Message Alert",
          newMessageMessage:
            "{{senderName}} has sent you a message on {{date}}",

          civilIdExpiryHeading: "{{targetName}} Civil Id Expiration Alert",
          civilIdExpiryMessage: "Civil id will expire on {{date}}",

          passportExpiryHeading: "{{targetName}} Passport Expiration Alert",
          passportExpiryMessage: "Passport will expire on {{date}}",

          healthInsuranceExpiryHeading:
            "{{targetName}} Health Insurance Expiration Alert",
          healthInsuranceExpiryMessage:
            "Health Insurance will expire on {{date}}",

          contractExpiryHeading: "{{targetName}} Contract Expiration Alert",
          contractExpiryMessage: "Contract will expire on {{date}}",
        },
      },
      ar: {
        translation: {
          welcome: "مرحبا",
          pages: "الصفحات",
          dashboard: "لوحة القيادة",
          DASHBOARD: "لوحة القيادة",
          dashboardSubtitle: "مرحبًا بك في لوحة القيادة الخاصة بك",
          TEAM: "الفريق",
          DRIVERS: "السائقين",
          driverFormTitle: "إضافة سائق",
          driverFormSubtitle: "إضافة سائق جديد",
          NOTIFICATIONS: "اشعارات",
          notificationTitle: "صفحة الاشعارات الهامة",
          deductionSalaryTitle: "خصم الراتب",
          manageTeamMembers: "إدارة أعضاء الفريق",
          manageDriverMembers: "إدارة السائقين",
          deductionSalaryRequest: "صفحة طلبات خصم الراتب",
          manageTeam: "إدارة الفريق",
          manageDrivers: "إدارة السائقين",
          userProfileTitle: "الملف التعريفي للموظف",
          userProfileSubtitle: "عرض/تحديث معلومات الموظف",
          deductionInvoices: "فواتير الخصم",
          driversInvoices: "فواتير السائقين",
          notifications: "الإشعارات",
          settings: "الإعدادات",
          forms: "نماذج",
          profileForm: "نموذج الفريق",
          driversForm: "نموذج السائقين",
          deduction: "خصم",
          contact: "التواصل",
          messages: "الرسائل",
          invoicesArchive: "أرشيف الفواتير",
          invoicesArchiveSubtitle: "قائمة الفواتير المؤرشفة",
          message: "رسالة",
          send: "ارسال",
          companyFiles: "ملفات الشركة",
          companyFilesSubtitle: "صفحة ملفات الشركة",
          data: "بيانات",
          role: "المسمى الوظيفي",
          admins: "المدراء التنفيذيون",
          Admin: "المدير التنفيذي",
          Manager: "المدير",
          Accountant: "المحاسب",
          Employee: "الموظف",
          driver: "السائق",
          drivers: "السائقين",
          login: "تسجيل الدخول",
          logout: "تسجيل الخروج",
          loggingIn: "...جاري تسجيل الدخول",
          /////////////
          email: "البريد الإلكتروني",
          password: "كلمة المرور",
          confirmPassword: "تأكيد كلمة المرور",
          createNewUser: "إنشاء مستخدم جديد",
          phone: "رقم الهاتف",
          name: "الاسم",
          civilId: "رقم الهوية",
          passport: "رقم الجواز",
          mainSalary: "الراتب الأساسي",
          accessLevel: "مستوى الوصول",
          actions: "الاجراءات",
          /////////////
          required: "مطلوب",
          firstName: "الاسم الأول",
          lastName: "الاسم الأخير",
          optionalEmail: "البريد الإلكتروني (اختياري)",
          idNumber: "رقم الهوية",
          idExpiryDate: "تاريخ انتهاء الهوية",
          passportExpiryDate: "تاريخ انتهاء الجواز",
          contractExpiryDate: "تاريخ انتهاء العقد",
          driverLicenseExpiryDate: "تاريخ انتهاء رخصة القيادة",
          carPlateNumber: "رقم لوحة السيارة",
          carRegisteration: "تسجيل السيارة",
          carRegisterationExpiryDate: "تاريخ انتهاء تسجيل السيارة",
          workPass: "تصريح العمل",
          gasCard: "بطاقة الوقود",
          healthInsuranceExpiryDate: "تاريخ انتهاء التأمين الصحي",
          healthInsurance: "التأمين الصحي",
          carType: "نوع السيارة",
          employeeCompanyNumber: "رقم موظف الشركة",
          iban: "IBAN",
          vehicle: "المركبة",
          car: "سيارة",
          bike: "دراجة",
          contractType: "نوع العقد",
          talabat: "طلبات",
          others: "أخرى",
          talabatId: "رقم هوية طلبات",
          uploadFile: "تحميل الملف",
          viewUploadedFile: "عرض الملف المحمل",
          update: "تحديث",
          delete: "حذف",
          add: "إضافة",
          edit: "تعديل",
          addNewDriver: "إضافة سائق جديد",
          /////////////
          additionalSalary: "الراتب الإضافي",
          talabatDeductionAmount: "خصم طلبات",
          companyDeductionAmount: "خصم الشركة",
          pettyCashDeductionAmount: "خصم المصروفات الصغيرة",
          deductionReason: "سبب الخصم",
          preview: "معاينة",
          uploadNewFile: "ارفع ملف جديد",
          /////////////
          willExpireOn: "سوف ينتهي في",
          expirationAlert: "تنبيه انتهاء صلاحية",
          /////////////
          createUserTitle: "إنشاء حساب مستخدم",
          createUserSubtitle: "إنشاء ملف تعريف مستخدم جديد",
          /////////////
          firstNameIsRequired: "الاسم الأول مطلوب",
          lastNameIsRequired: "الاسم الأخير مطلوب",
          invalidEmail: "البريد الإلكتروني غير صحيح",
          emailIsRequired: "البريد الإلكتروني مطلوب",
          invalidPhoneNumber: "رقم الهاتف غير صحيح",
          phoneIsRequired: "رقم الهاتف مطلوب",
          identificationIsRequired: "رقم الهوية مطلوب",
          passportIsRequired: "رقم جواز السفر مطلوب",
          contractExpiryDateIsRequired: "تاريخ انتهاء العقد مطلوب",
          roleIsRequired: "يجب اختيار الدور",
          mainSalaryIsRequired: "الراتب الأساسي مطلوب",
          passwordMinLength: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل",
          passwordIsRequired: "كلمة المرور مطلوبة",
          passwordMustMatch: "يجب أن تتطابق كلمتا المرور",
          confirmPasswordIsRequired: "تأكيد كلمة المرور مطلوبة",
          /////////////
          deductionTitle: "خصم الراتب",
          deductionSubtitle: "خصم الراتب من الموظف/السائق",
          reasonOfDeduction: "سبب الخصم",
          talabatDeductionAmountKD: "قيمة الخصم من طلبات (د.ك.)",
          companyDeductionAmountKD: "قيمة الخصم من الشركة (د.ك.)",
          submit: "تقديم",
          selectUser: "اختر الموظف",
          selectDriver: "اختر السائق",
          /////////////
          contactTitle: "التواصل",
          contactSubtitle: "صفحة الاتصال للتواصل مع فريق الشركة",
          /////////////
          MESSAGES: "الرسائل",
          messagesSubtitle: "صفحة الرسائل المستلمة",
          /////////////
          invoicesTitle: "الفواتير",
          invoices: "الفواتير",
          invoicesSubtitle: "قائمة أرصدة الفواتير",
          cash: "المبلغ",
          hours: "ساعات",
          mainOrders: "الطلبات الرئيسية",
          additionalOrders: "الطلبات الإضافية",
          date: "التاريخ",
          reset: "إعادة تعيين",
          /////////////
          deductionInvoicesTitle: "فواتير الخصم",
          deductionInvoicesSubtitle: "صفحة فواتير الخصم",
          /////////////
          startingDate: "تاريخ البدء",
          endingDate: "تاريخ الانتهاء",
          search: "ابحث",
          /////////////
          EmployeesSalaryTitle: "رواتب الموظفين",
          EmployeesSalarySubtitle: "صفحة رواتب الموظفين",
          startMonth: "شهر البدء",
          startYear: "سنة البدء",
          endMonth: "شهر الانتهاء",
          endYear: "سنة الانتهاء",
          print: "طباعة",
          remarks: "ملاحظات",
          netSalary: "صافي الراتب",
          notes: "ملحوظات",
          employeesTotalNetSalary: "إجمالي صافي الراتب للموظفين: ",
          kd: "دك",
          /////////////
          employeesSalary: "راواتب الموظفين",
          driversSalary: "رواتب السائقين",
          bankStatement: "كشف الحساب البنكي",
          pettyCash: "النقدية الصغيرة",
          spendTypes: "أنواع المصروفات",
          companySpends: "مصاريف الشركة",
          profitsAndLosses: "الأرباح والخسائر",
          companyIncome: "دخل الشركة",
          /////////////
          driversSalaryTitle: "رواتب السائقين",
          driversSalarySubtitle: "صفحة رواتب السائقين",
          finalSalary: "الراتب النهائي",
          salaryAdditionalOrders: "الراتب (الطلبات الإضافية)",
          salaryMainOrders: "الراتب (الطلبات الرئيسية)",
          totalOrders: "إجمالي الطلبات",
          carDriversTotalNetSalary: "إجمالي الراتب الصافي لسائقي السيارات:",
          bikeDriversTotalNetSalary: "إجمالي الراتب الصافي لسائقي الدراجات:",
          totalMonthlySalary: "إجمالي الراتب الشهري:",
          totalMonthlyDeduction: "إجمالي الخصم الشهري:",
          totalNetSalary: "إجمالي الراتب الصافي:",
          total: "إجمالي",
          /////////////
          companySpendsTitle: "مصاريف الشركة",
          companySpendsSubtitle: "صفحة مصاريف الشركة",
          from: "من",
          cashSpends: "المصاريف النقدية",
          deductedFrom: "مخصومة من",
          /////////////
          spendTypesTitle: "أنواع المصاريف",
          spendTypesSubtitle: "صفحة أنواع المصاريف",
          addNewSpendType: "إضافة نوع مصروف جديد",
          /////////////
          bankStatementTitle: "كشف الحساب البنكي",
          bankStatementSubtitle: "صفحة كشف الحساب البنكي",
          addNewRow: "إضافة صف جديد",
          bankAccountNumber: "رقم الحساب البنكي",
          deposits: "الودائع",
          spends: "المصروفات",
          checkNumber: "رقم الشيك",
          details: "التفاصيل",
          balance: "الرصيد",
          totalWithdrawals: "إجمالي المسحوبات",
          totalDeposits: "إجمالي الودائع",
          currentBalance: "الرصيد الحالي",
          /////////////
          pettyCashTitle: "النقدية الصغيرة",
          pettyCashSubtitle: "صفحة النقدية الصغيرة",
          serialNumber: "الرقم التسلسلي",
          requestApplicant: "مقدم الطلب",
          requestDate: "تاريخ الطلب",
          spendsDate: "تاريخ المصروفات",
          addNewPettyCash: "إضافة نقدية صغيرة جديدة",
          selectSpendType: "اختر نوع المصروف",
          spendsReason: "سبب المصروفات",
          cashAmount: "مبلغ النقدية",
          spendsRemarks: "ملاحظات المصروفات",
          startingBalance: "الرصيد الافتتاحي",
          saveData: "حفظ البيانات",
          totalSpends: "إجمالي المصروفات",
          totalAmountOnWorkers: "إجمالي المبلغ على الموظفين/السائقين",
          totalAmountOnCompany: "صافي المبلغ على الشركة",
          /////////////
          profitsAndLossesTitle: "الأرباح والخسائر",
          profitsAndLossesSubtitle: "صفحة الأرباح والخسائر",
          addNewCompanyIncome: "إضافة دخل جديد للشركة",
          year: "سنة",
          bikeIncome: "دخل الدراجات",
          carIncome: "دخل السيارات",
          otherIncome: "دخل آخر",
          lastMonthIncome: "دخل الشهر الماضي",
          lendsIncome: "دخل القروض",
          moneySafeBalance: "رصيد صندوق المال",
          refundCompany: "استرداد الشركة",
          refundAmount: "مبلغ الاسترداد",
          selectIncomeType: "اختر نوع الدخل",
          selectMonth: "اختر الشهر",
          income: "الدخل",
          refund: "الاسترداد",
          talabatCarIncome: "دخل سيارات طلبات",
          talabatBikeIncome: "دخل دراجات طلبات",
          talabatOtherIncome: "دخل آخر من طلبات",
          /////////////
          totalCash: "إجمالي النقود",
          totalHours: "إجمالي الساعات",
          revenue: "الإيرادات",
          revenueGenerated: "الإيرادات المتولدة",
          salesQuantity: "كمية المبيعات",
          /////////////
          deactivatedDrivers: "سائقين معطلون",
          deactivatedDriversTitle: "السائقون المعطلون",
          deactivatedDriversSubtitle: "صفحة السائقون المعطلون",
          deactivate: "إيقاف التفعيل",
          reactivate: "إعادة تفعيل",
          deactivationReason: "سبب التعطيل",
          deactivatedDriverFulfilled: "تم إيقاف تفعيل السائق بنجاح",
          deactivatedDriverrejected:
            "لا يمكن تعطيل السائق، يمكنك المحاولة لاحقًا",
          overrideDriverSalaryFulfilled: "تم تحديث معلومات السائق بنجاح",
          overrideDriverSalaryRejected:
            "لا يمكن تحديث معلومات السائق، يمكنك المحاولة لاحقًا",

          /////////////
          updatedDriverFulfilled: "تم تحديث معلومات السائق بنجاح",
          updatedDriverRejected:
            "لا يمكن تحديث معلومات السائق، يمكنك المحاولة لاحقًا",
          registerDriverFulfilled: "تمت إضافة السائق الجديد بنجاح",
          registerDriverRejected:
            "لا يمكن إضافة سائق جديد، يمكنك المحاولة لاحقًا",
          deleteDriverFulfilled: "تم حذف السائق بنجاح",
          deleteDriverRejected: "لا يمكن حذف السائق، يمكنك المحاولة لاحقًا",

          /////////////
          changeLanguage: "تغيير اللغة",
          darkMode: "وضع الظلام",
          lightMode: "وضع الضوء",
          noMessages: "لا توجد رسائل متاحة",
          sendMessageFulfilled: "تم إرسال الرسالة بنجاح!",
          sendMessageRejected: "لا يمكن إرسال الرسالة، يمكنك المحاولة لاحقًا!",
          updateAdditionalSalaryFulfilled: "تم تحديث بيانات المستخدم بنجاح.",
          updateAdditionalSalaryRejected: "حدث خطأ ما! يرجى المحاولة لاحقًا.",
          updateUserRejected: "حدث خطأ ما! يرجى المحاولة لاحقًا.",
          updateUserFulfilled: "تم تحديث معلومات المستخدم بنجاح.",
          deleteUserRejected: "لا يمكن حذف المستخدم، يمكنك المحاولة لاحقًا",
          deleteUserFulfilled: "تم حذف المستخدم بنجاح",
          registerUserFulfilled: "تمت إضافة المستخدم بنجاح",
          registerUserRejected: "حدث خطأ ما! يرجى المحاولة لاحقًا",
          profileImageFulfilled: "تم تحميل صورة ملف تعريف المستخدم بنجاح!",
          profileImageRejected: "حدث خطأ ما! يرجى المحاولة لاحقًا",
          createUserInvoiceFulfilled: "تم إضافة فاتورة الموظف بنجاح",
          createUserInvoiceRejected: "حدث خطأ ما! يرجى المحاولة لاحقًا.",
          /////////////
          addSpendTypeFulfilled: "تمت إضافة نوع الإنفاق بنجاح",
          addSpendTypeRejected:
            "لا يمكن إضافة نوع الإنفاق، يمكنك المحاولة لاحقًا",
          deleteSpendTypeFulfilled: "تم حذف نوع الإنفاق بنجاح",
          deleteSpendTypeRejected:
            "لا يمكن حذف نوع الإنفاق، يمكنك المحاولة لاحقًا",
          /////////////
          createPettyCashFulfilled: "تمت إضافة النقد الصغير بنجاح",
          createPettyCashRejected:
            "لا يمكن إضافة النقد الصغير، يمكنك المحاولة لاحقًا",
          /////////////
          createCompanyIncomeFulfilled: "تمت إضافة الدخل بنجاح",
          createCompanyIncomeRejected:
            "لا يمكن إضافة الدخل، يمكنك المحاولة لاحقًا",
          /////////////
          addCompanyFilesFulfilled: "تمت إضافة ملف الشركة بنجاح",
          saveCompanyFilesSuccess: "تم حفظ ملف الشركة بنجاح",
          addCompanyFilesRejected:
            "لا يمكن إضافة ملف الشركة، يمكنك المحاولة لاحقًا",
          deleteCompanyFileFulfilled: "تم حذف ملف الشركة بنجاح",
          deleteCompanyFileRejected:
            "لا يمكن حذف ملف الشركة، يمكنك المحاولة لاحقًا",
          /////////////
          createBankStatementFulfilled: "تمت إضافة كشف حساب البنك بنجاح",
          createBankStatementRejected:
            "لا يمكن إضافة كشف حساب البنك، يمكنك المحاولة لاحقًا",
          /////////////
          createDriverInvoiceFulfilled: "تمت إضافة فاتورة السائق بنجاح",
          createDriverInvoiceRejected:
            "لا يمكن إضافة فاتورة السائق، يمكنك المحاولة لاحقًا",
          updateDriverInvoiceFulfilled: "تم تحديث فاتورة السائق بنجاح",
          updateDriverInvoiceRejected:
            "لا يمكن تحديث فاتورة السائق، يمكنك المحاولة لاحقًا",
          updateEmployeeInvoiceFulfilled: "تم تحديث فاتورة المستخدم بنجاح",
          updateEmployeeInvoiceRejected:
            "لا يمكن تحديث فاتورة المستخدم، يمكنك المحاولة لاحقًا",
          resetDriverInvoicesFulfilled: "تمت إعادة تعيين الفواتير بنجاح",
          resetDriverInvoicesRejected:
            "لا يمكن إعادة تعيين الفواتير، يمكنك المحاولة لاحقًا",
          resetSingleDriverInvoiceFulfilled:
            "تمت إعادة تعيين فواتير السائق بنجاح",
          resetSingleDriverInvoiceRejected:
            "لا يمكن إعادة تعيين فواتير السائق، يمكنك المحاولة لاحقًا",

          deductionAddHeading: "{{targetName}} تنبيه الخصم",
          deductionAddMessage: "{{senderName}} قدم طلب خصم بتاريخ {{date}}",

          deductionApproveHeading: "{{targetName}} Deduction Alert",
          deductionApproveMessage:
            "{{date}} وافق على طلب الاستقطاع بتاريخ {{senderName}}",

          deductionRejectHeading: "{{targetName}} Deduction Alert",
          deductionRejectMessage:
            "{{date}} رفض طلب الاستقطاع بتاريخ {{senderName}}",

          deactivationHeading: "{{targetName}} تنبيه التعطيل",
          deactivationMessage:
            "قام {{senderName}} بتعطيل السائق بتاريخ {{date}}",

          activationHeading: "{{targetName}} تنبيه التنشيط",
          activationMessage: "{{senderName}} بتفعيل السائق بتاريخ {{date}}",

          newMessageHeading: "تنبيه رسالة جديدة",
          newMessageMessage: "{{senderName}} أرسل لك رسالة بتاريخ {{date}}",

          civilIdExpiryHeading:
            "{{targetName}} تنبيه انتهاء صلاحية البطاقة المدنية",
          civilIdExpiryMessage: "ستنتهي صلاحية البطاقة المدنية في {{date}}",

          passportExpiryHeading:
            "{{targetName}} تنبيه انتهاء صلاحية جواز السفر",
          passportExpiryMessage: "سوف تنتهي صلاحية جواز السفر في {{date}}",

          healthInsuranceExpiryHeading:
            "{{targetName}} تنبيه انتهاء التأمين الصحي",
          healthInsuranceExpiryMessage:
            "سوف تنتهي صلاحية التأمين الصحي في {{date}}",

          contractExpiryHeading: "تنبيه انتهاء العقد{{targetName}}",
          contractExpiryMessage: "سينتهي العقد في {{date}}",
        },
      },
    },
  });

export default i18n;
