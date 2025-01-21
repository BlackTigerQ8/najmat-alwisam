const i18next = require("i18next");
const Backend = require("i18next-node-fs-backend");
const middleware = require("i18next-express-middleware");

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    debug: true,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["querystring", "cookie"],
      caches: ["cookie"],
    },
    resources: {
      en: {
        translation: {
          welcome: "Welcome",
          pages: "Pages",
          dashboard: "Dashboard",
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
          logout: "Logout",
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
          deductionReject: "Deduction Rejected",
          deductionApprove: "Deduction Approved",
          Heading: "Heading",
          Message: "Message",
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
        },
      },
      ar: {
        translation: {
          welcome: "مرحبا",
          pages: "الصفحات",
          dashboard: "لوحة التحكم",
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
          forms: "نماذج",
          profileForm: "نموذج الفريق",
          driversForm: "نموذج السائقين",
          deduction: "خصم",
          contact: "اتصال",
          messages: "رسائل",
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
          logout: "تسجيل الخروج",
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
          deductionReject: "رفض الخصم",
          deductionApprove: "الموافقة على الخصم",
          Heading: "العنوان",
          Message: "الرسالة",
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
        },
      },
    },
  });

module.exports = i18next;
